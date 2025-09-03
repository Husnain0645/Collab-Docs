import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, JwtPayload, AuthResponseDto } from './dto/auth.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists in database
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Create new user entity
    const newUser = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: UserRole.VIEWER, // Default role
    });

    // Save user to database
    const savedUser = await this.userRepository.save(newUser);

    // Generate JWT token
    const token = this.generateToken(savedUser);

    // Return response without password
    const { password, ...userWithoutPassword } = savedUser;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user in database
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email }
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return response without password
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async findUserById(id: string): Promise<User | null> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }
    return this.userRepository.findOne({
      where: { id }
    });
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    if (!Object.values(UserRole).includes(newRole)) {
      throw new BadRequestException('Invalid role specified');
    }

    // Update user role in database
    await this.userRepository.update(userId, { role: newRole });

    // Return updated user
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!updatedUser) {
      throw new UnauthorizedException('User not found');
    }

    return updatedUser;
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt']
    });
    return users;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email }
    });
  }
}
