import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @Matches(/^\d{4}$/)
  pin!: string;
}
