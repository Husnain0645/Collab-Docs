import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, JwtPayload, AuthResponseDto } from './dto/auth.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class AuthService {
  private users: User[] = []; // In-memory storage for demo purposes

  constructor(private readonly jwtService: JwtService) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = this.users.find(user => user.email === registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const newUser = new User({
      id: Date.now().toString(),
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: UserRole.VIEWER, // Default role
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.users.push(newUser);

    const { password, ...userWithoutPassword } = newUser;
    const token = this.generateToken(newUser);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user;
    const token = this.generateToken(user);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
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
    return this.users.find(user => user.id === id) || null;
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    if (!Object.values(UserRole).includes(newRole)) {
      throw new BadRequestException('Invalid role specified');
    }

    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new UnauthorizedException('User not found');
    }

    this.users[userIndex].role = newRole;
    this.users[userIndex].updatedAt = new Date();

    return this.users[userIndex];
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    return this.users.map(({ password, ...user }) => user);
  }
}
