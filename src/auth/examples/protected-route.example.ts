import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('example')
export class ExampleController {
  
  // Public endpoint - no authentication required
  @Get('public')
  getPublicData() {
    return { message: 'This is public data' };
  }

  // Protected endpoint - requires valid JWT token
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtectedData(@CurrentUser() user: any) {
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
  getAdminData(@CurrentUser() user: any) {
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
  getCollaboratorContent(@CurrentUser() user: any) {
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
