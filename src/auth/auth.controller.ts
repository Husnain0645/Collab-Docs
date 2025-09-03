import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth, 
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'User registration', 
    description: 'Register a new user account' 
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ 
    description: 'User successfully registered', 
    type: AuthResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data or user already exists' 
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login', 
    description: 'Authenticate user and return JWT token' 
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ 
    description: 'User successfully authenticated', 
    type: AuthResponseDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials' 
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user profile', 
    description: 'Retrieve current user profile information' 
  })
  @ApiOkResponse({ 
    description: 'User profile retrieved successfully', 
    type: User 
  })
  @ApiUnauthorizedResponse({ 
    description: 'JWT token is missing or invalid' 
  })
  async getProfile(@CurrentUser() user: any): Promise<Omit<User, 'password'>> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all users', 
    description: 'Retrieve list of all users (OWNER role required)' 
  })
  @ApiOkResponse({ 
    description: 'Users list retrieved successfully', 
    type: [User] 
  })
  @ApiUnauthorizedResponse({ 
    description: 'JWT token is missing or invalid' 
  })
  @ApiForbiddenResponse({ 
    description: 'Insufficient permissions - OWNER role required' 
  })
  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    return this.authService.getAllUsers();
  }

  @Post('role/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update user role', 
    description: 'Update user role (OWNER role required)' 
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'User ID to update role for',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: Object.values(UserRole),
          description: 'New role to assign to user'
        }
      },
      required: ['role']
    }
  })
  @ApiOkResponse({ 
    description: 'User role updated successfully', 
    type: User 
  })
  @ApiUnauthorizedResponse({ 
    description: 'JWT token is missing or invalid' 
  })
  @ApiForbiddenResponse({ 
    description: 'Insufficient permissions - OWNER role required' 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid user ID or role value' 
  })
  async updateUserRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('role', new ParseEnumPipe(UserRole)) newRole: UserRole,
    @CurrentUser() currentUser: any,
  ): Promise<User> {
    return this.authService.updateUserRole(userId, newRole);
  }
}
