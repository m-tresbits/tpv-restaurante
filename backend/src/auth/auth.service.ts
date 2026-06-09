import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

type AuthPayload = {
  sub: number;
  nombre: string;
  rol: string;
};

type LoginResponse = {
  accessToken: string;
  usuario: {
    id: number;
    nombre: string;
    rol: string;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findActiveByName(loginDto.nombre);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isPinValid = await argon2.verify(user.pinHash, loginDto.pin);

    if (!isPinValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    await this.usersService.updateLastAccess(user.id);

    const payload: AuthPayload = {
      sub: user.id,
      nombre: user.nombre,
      rol: user.role.nombre,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        rol: user.role.nombre,
      },
    };
  }
}
