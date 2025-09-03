# Database Setup Guide - TypeORM + PostgreSQL

This guide explains how to set up and use the database with TypeORM and PostgreSQL in our NestJS authentication system.

## 🗄️ Database Architecture

### **Technology Stack**
- **Database**: PostgreSQL 12+
- **ORM**: TypeORM (latest version)
- **Migration System**: TypeORM CLI migrations
- **Connection**: Async configuration with environment variables

### **Database Schema**
```
users
├── id (UUID, Primary Key)
├── email (VARCHAR(255), Unique)
├── password (VARCHAR(255), Hashed)
├── firstName (VARCHAR(100))
├── lastName (VARCHAR(100))
├── role (ENUM: owner, collaborator, viewer)
├── createdAt (TIMESTAMP WITH TIME ZONE)
└── updatedAt (TIMESTAMP WITH TIME ZONE)
```

## 🚀 Quick Start

### **1. Install PostgreSQL**

#### **macOS (using Homebrew)**
```bash
brew install postgresql
brew services start postgresql
```

#### **Ubuntu/Debian**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### **Windows**
Download from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### **2. Create Database and User**

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database
CREATE DATABASE collab_docs;

# Create user (replace with your desired username/password)
CREATE USER collab_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE collab_docs TO collab_user;

# Exit
\q
```

### **3. Set Environment Variables**

Create a `.env` file in your project root:

```bash
# Copy from env.example
cp env.example .env

# Edit .env with your database credentials
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=collab_user
DB_PASSWORD=your_secure_password
DB_NAME=collab_docs
DB_SYNC=false
DB_LOGGING=true
DB_SSL=false
```

### **4. Run Migrations**

```bash
# Generate migration (if you make entity changes)
npm run migration:generate -- src/migrations/UpdateUsersTable

# Run migrations
npm run migration:run

# Check migration status
npm run migration:show
```

## 🔧 Configuration Details

### **Database Module Configuration**

```typescript
// src/database/database.module.ts
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_NAME', 'collab_docs'),
        entities: [User],
        synchronize: configService.get<boolean>('DB_SYNC', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
        ssl: configService.get<boolean>('DB_SSL', false),
        autoLoadEntities: true,
        migrations: [__dirname + '/../migrations/*.js'],
        migrationsRun: false,
        migrationsTableName: 'migrations',
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
```

### **Environment Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL server hostname |
| `DB_PORT` | `5432` | PostgreSQL server port |
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | `password` | Database password |
| `DB_NAME` | `collab_docs` | Database name |
| `DB_SYNC` | `false` | Auto-sync schema (never true in production) |
| `DB_LOGGING` | `false` | Enable SQL query logging |
| `DB_SSL` | `false` | Enable SSL connection |

## 📊 Entity Definition

### **User Entity with TypeORM Decorators**

```typescript
// src/auth/entities/user.entity.ts
@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @IsNotEmpty()
  password: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER
  })
  @IsEnum(UserRole)
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
```

## 🚀 Migration System

### **Migration Commands**

```bash
# Generate new migration
npm run migration:generate -- src/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Sync schema (development only)
npm run schema:sync

# Drop all tables (development only)
npm run schema:drop
```

### **Migration File Structure**

```typescript
// src/migrations/1700000000000-CreateUsersTable.ts
export class CreateUsersTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tables, indexes, etc.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes
  }
}
```

### **How Migrations Work**

1. **Migration Generation**: TypeORM compares entities with current database schema
2. **Migration Files**: Creates TypeScript files with `up()` and `down()` methods
3. **Migration Table**: Tracks which migrations have been applied
4. **Version Control**: Migrations are versioned and can be shared across team

## 🔐 Security Best Practices

### **Database Security**

```bash
# Never expose database credentials in code
# Use environment variables
DB_PASSWORD=your_secure_password

# Use strong passwords
# Minimum 12 characters, mix of:
# - Uppercase letters
# - Lowercase letters
# - Numbers
# - Special characters

# Enable SSL in production
DB_SSL=true

# Use connection pooling for production
# Configure max connections based on your needs
```

### **Entity Validation**

```typescript
// Always validate data at entity level
@Column({ type: 'varchar', length: 255 })
@IsEmail()
@IsNotEmpty()
email: string;

// Use appropriate column types
@Column({ type: 'varchar', length: 100 }) // Limit string length
@Column({ type: 'enum', enum: UserRole }) // Use enums for fixed values
@Column({ type: 'timestamp with time zone' }) // Proper timestamp handling
```

## 🧪 Testing Database

### **Test Database Setup**

```bash
# Create test database
CREATE DATABASE collab_docs_test;

# Use different environment for testing
NODE_ENV=test
DB_NAME=collab_docs_test
DB_SYNC=true  # Auto-sync for tests
```

### **Integration Tests**

```typescript
// test/auth.e2e-spec.ts
describe('Auth (e2e)', () => {
  beforeEach(async () => {
    // Clean database before each test
    await clearDatabase();
  });

  it('should register a new user', async () => {
    // Test user registration
  });
});
```

## 📈 Performance Optimization

### **Database Indexes**

```typescript
// Automatic indexes for unique constraints
@Index(['email'], { unique: true })

// Manual indexes for frequently queried fields
@Index(['role', 'createdAt'])
export class User {
  // ... entity definition
}
```

### **Query Optimization**

```typescript
// Use select to limit returned fields
const users = await this.userRepository.find({
  select: ['id', 'email', 'firstName', 'lastName', 'role']
});

// Use relations for joins
const user = await this.userRepository.findOne({
  where: { id: userId },
  relations: ['documents', 'permissions']
});
```

## 🚨 Production Considerations

### **Environment Variables**

```bash
# Production environment
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=very_secure_production_password
DB_SSL=true
DB_SYNC=false  # Never true in production
DB_LOGGING=false  # Disable logging in production
```

### **Database Backups**

```bash
# Regular backups
pg_dump -h localhost -U username -d collab_docs > backup.sql

# Automated backups with cron
0 2 * * * pg_dump -h localhost -U username -d collab_docs > /backups/backup_$(date +\%Y\%m\%d).sql
```

### **Connection Pooling**

```typescript
// Add connection pooling for production
{
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  }
}
```

## 🔍 Troubleshooting

### **Common Issues**

#### **Connection Refused**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if port is open
netstat -an | grep 5432
```

#### **Authentication Failed**
```bash
# Check pg_hba.conf configuration
# Ensure your user has proper permissions
GRANT ALL PRIVILEGES ON DATABASE collab_docs TO your_user;
```

#### **Migration Errors**
```bash
# Check migration status
npm run migration:show

# Revert problematic migration
npm run migration:revert

# Check database schema
\dt  # List tables
\d users  # Describe users table
```

## 📚 Additional Resources

- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [Database Migration Best Practices](https://typeorm.io/migrations)

## 🎯 Next Steps

1. **Set up PostgreSQL** on your system
2. **Configure environment variables**
3. **Run initial migration**
4. **Test database operations**
5. **Add more entities** (documents, permissions, etc.)
6. **Implement advanced queries** and relationships

Your database is now ready for production use! 🚀
