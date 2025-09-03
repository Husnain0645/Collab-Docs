# Authentication Module

This module provides a complete authentication system for the collaborative document API with JWT-based sessions and role-based access control.

## Features

- **User Registration & Login**: Email/password authentication
- **JWT Sessions**: Secure token-based authentication
- **Role-Based Access Control**: Three user roles (owner, collaborator, viewer)
- **Password Hashing**: Secure password storage using bcrypt
- **Guards & Decorators**: Easy-to-use protection for routes

## User Roles

- **OWNER**: Full access to all features, can manage users and documents
- **COLLABORATOR**: Can edit and collaborate on documents
- **VIEWER**: Read-only access to documents

## API Endpoints

### Public Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Protected Endpoints
- `GET /auth/profile` - Get current user profile
- `GET /auth/users` - Get all users (OWNER only)
- `POST /auth/role/:userId` - Update user role (OWNER only)

## Usage Examples

### Protecting Routes

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('documents')
export class DocumentsController {
  
  // Public endpoint
  @Get('public')
  getPublicDocuments() {
    return { message: 'Public documents' };
  }

  // Protected endpoint - requires authentication
  @Get('private')
  @UseGuards(JwtAuthGuard)
  getPrivateDocuments(@CurrentUser() user: any) {
    return { message: 'Private documents', userId: user.id };
  }

  // Role-based endpoint - only owners can access
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  getAdminDocuments(@CurrentUser() user: any) {
    return { message: 'Admin documents', user };
  }
}
```

### Getting Current User

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: any) {
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}
```

## Environment Variables

Set the following environment variable for production:

```bash
JWT_SECRET=your-super-secret-key-here
```

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 24 hours
- Role-based access control prevents unauthorized access
- Input validation using class-validator decorators

## Future Enhancements

- OAuth integration (Google, GitHub, etc.)
- Refresh token mechanism
- Password reset functionality
- Email verification
- Rate limiting
- Database integration (currently uses in-memory storage)
