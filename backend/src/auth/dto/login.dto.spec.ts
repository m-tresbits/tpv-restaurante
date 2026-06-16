import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should pass validation with a valid login body', async () => {
    const dto = plainToInstance(LoginDto, {
      nombre: 'Administrador',
      pin: '1111',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail validation when nombre is empty', async () => {
    const dto = plainToInstance(LoginDto, {
      nombre: '',
      pin: '1111',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation when pin is not valid', async () => {
    const dto = plainToInstance(LoginDto, {
      nombre: 'Administrador',
      pin: 'abcd',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
