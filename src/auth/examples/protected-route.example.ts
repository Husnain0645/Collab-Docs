import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

@Controller('example')
export class ExampleController {
  
  // Public endpoint - no authentication required
  @Get('public')
  @HttpCode(HttpStatus.OK)
  getPublicData(): { message: string } {
    return { message: 'This is public data' };
  }

  // Protected endpoint - requires valid JWT token
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProtectedData(@CurrentUser() user: AuthenticatedUser): { message: string; user: AuthenticatedUser } {
    return { 
      message: 'This is protected data',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

  // Role-based endpoint - only owners can access
  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  getAdminData(@CurrentUser() user: AuthenticatedUser): { message: string; user: AuthenticatedUser } {
    return { 
      message: 'This is admin-only data',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

  // Multiple roles allowed
  @Get('collaborator-content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.COLLABORATOR)
  @HttpCode(HttpStatus.OK)
  getCollaboratorContent(@CurrentUser() user: AuthenticatedUser): { message: string; user: AuthenticatedUser } {
    return { 
      message: 'This content is for owners and collaborators',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }
}
