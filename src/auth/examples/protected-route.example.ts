import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse
} from '@nestjs/swagger';
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

@ApiTags('examples')
@Controller('example')
export class ExampleController {
  
  // Public endpoint - no authentication required
  @Get('public')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Public endpoint', 
    description: 'Accessible without authentication' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Public data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'This is public data'
        }
      }
    }
  })
  getPublicData(): { message: string } {
    return { message: 'This is public data' };
  }

  // Protected endpoint - requires valid JWT token
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Protected endpoint', 
    description: 'Requires valid JWT token for access' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Protected data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'This is protected data'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            email: { type: 'string', example: 'user@example.com' },
            role: { type: 'string', example: 'USER' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'JWT token is missing or invalid' 
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Admin-only endpoint', 
    description: 'Only users with OWNER role can access this endpoint' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Admin data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'This is admin-only data'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            email: { type: 'string', example: 'user@example.com' },
            role: { type: 'string', example: 'OWNER' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'JWT token is missing or invalid' 
  })
  @ApiForbiddenResponse({ 
    description: 'Insufficient permissions - OWNER role required' 
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Collaborator content endpoint', 
    description: 'Accessible by users with OWNER or COLLABORATOR roles' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Collaborator content retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'This content is for owners and collaborators'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            email: { type: 'string', example: 'user@example.com' },
            role: { type: 'string', example: 'COLLABORATOR' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'JWT token is missing or invalid' 
  })
  @ApiForbiddenResponse({ 
    description: 'Insufficient permissions - OWNER or COLLABORATOR role required' 
  })
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
