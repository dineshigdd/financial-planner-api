import { IsEmail, IsNotEmpty, IsString, MinLength , IsOptional , IsIn } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Username should not be empty' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(8, { message: 'Username must be at least 3 characters long' })
  username: string;

  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Role must be a string' })
  @IsIn(['user', 'admin'])  // Validate allowed roles
  role?: string;

}
       
           