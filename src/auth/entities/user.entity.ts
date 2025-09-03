import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  OWNER = 'owner',
  COLLABORATOR = 'collaborator',
  VIEWER = 'viewer',
}

@Entity('users')
@Index(['email'], { unique: true }) // Database-level unique constraint
export class User {
  @ApiProperty({
    description: 'Unique user identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User email address (must be unique)',
    example: 'user@example.com',
    type: String
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password (hashed)',
    example: 'hashedPassword123',
    type: String
  })
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: String
  })
  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: String
  })
  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.VIEWER,
    default: UserRole.VIEWER
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'User account creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
    type: Date
  })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ApiProperty({
    description: 'User account last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
    type: Date
  })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
