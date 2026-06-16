import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  nombre!: string;

  @IsString()
  @Length(4, 4)
  pin!: string;
}
