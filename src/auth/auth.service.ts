import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, JwtPayload } from './dto/auth.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class AuthService {
  private users: User[] = []; // In-memory storage for demo purposes

  constructor(private jwtService: JwtService) {}

  async register(registerDto: RegisterDto): Promise<{ user: Omit<User, 'password'>; token: string }> {
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

  async login(loginDto: LoginDto): Promise<{ user: Omit<User, 'password'>; token: string }> {
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
    return this.users.find(user => user.id === id) || null;
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new UnauthorizedException('User not found');
    }

    this.users[userIndex].role = newRole;
    this.users[userIndex].updatedAt = new Date();

    return this.users[userIndex];
  }
}
