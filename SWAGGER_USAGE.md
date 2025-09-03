# Swagger API Documentation

Your NestJS application now has comprehensive Swagger documentation available at `http://localhost:3000/api` when the application is running.

## Accessing Swagger UI

1. Start your application:
   ```bash
   npm run start:dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/api
   ```

## Available API Endpoints

### App Endpoints
- **GET /** - Health check endpoint (no authentication required)

### Authentication Endpoints (`/auth`)
- **POST /auth/register** - User registration
- **POST /auth/login** - User authentication
- **GET /auth/profile** - Get current user profile (JWT required)
- **GET /auth/users** - Get all users (OWNER role required)
- **POST /auth/role/:userId** - Update user role (OWNER role required)

### Example Endpoints (`/example`)
- **GET /example/public** - Public endpoint (no authentication required)
- **GET /example/protected** - Protected endpoint (JWT required)
- **GET /example/admin-only** - Admin-only endpoint (OWNER role required)
- **GET /example/collaborator-content** - Collaborator content (OWNER/COLLABORATOR roles required)

## Testing Authentication

### 1. Register a New User
1. Go to the `/auth/register` endpoint
2. Click "Try it out"
3. Enter user details:
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```
4. Click "Execute"

### 2. Login to Get JWT Token
1. Go to the `/auth/login` endpoint
2. Click "Try it out"
3. Enter credentials:
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
4. Click "Execute"
5. Copy the JWT token from the response

### 3. Use JWT Token for Protected Endpoints
1. Click the "Authorize" button at the top of the Swagger UI
2. Enter your JWT token in the format: `Bearer YOUR_JWT_TOKEN`
3. Click "Authorize"
4. Now you can test protected endpoints

## Testing Role-Based Access

### Creating an Owner User
To test role-based endpoints, you'll need to create a user with OWNER role. You can do this by:

1. Register a user normally (they get VIEWER role by default)
2. Use the database or create a script to update their role to OWNER
3. Or modify the registration logic temporarily to assign OWNER role

### Testing Different Access Levels
- **Public endpoints**: No authentication required
- **Protected endpoints**: Valid JWT token required
- **Role-based endpoints**: Valid JWT token + appropriate role required

## Features

- **Interactive API Testing**: Test all endpoints directly from the browser
- **Request/Response Examples**: See example data for all endpoints
- **Authentication Support**: JWT Bearer token authentication
- **Role-Based Access Control**: Clear documentation of required roles
- **Comprehensive Schema**: All DTOs and entities are documented
- **Persistent Authorization**: JWT token persists across requests in Swagger UI

## Troubleshooting

### Common Issues
1. **CORS errors**: Make sure your frontend is configured to allow requests to the API
2. **JWT token expired**: Re-login to get a new token
3. **Role permission denied**: Check that your user has the required role
4. **Validation errors**: Check the request body format and required fields

### Database Setup
Make sure your database is running and migrations have been applied:
```bash
npm run migration:run
```

## Next Steps

With Swagger now integrated, you can:
1. Test all your API endpoints
2. Share the API documentation with frontend developers
3. Use the interactive testing for development and debugging
4. Generate client SDKs from the OpenAPI specification

The Swagger UI will automatically update as you add new endpoints or modify existing ones, keeping your API documentation always current.
