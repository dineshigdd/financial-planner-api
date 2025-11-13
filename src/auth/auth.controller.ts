import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sigin-in.dto';
import { SignUpDto } from './dto/sign-up-dto';

@Controller('auth')
export class AuthController {
  constructor(private  authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED) 
  async signUp(@Body() SignUpDto:SignUpDto) {
    // Placeholder for sign-up logic
    const { username , password , email, role } = SignUpDto;
    console.log( "SignUpDto:", SignUpDto );
    return this.authService.SignUp( username, password , email , role );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) 
  async signIn(@Body() SignInDto:SignInDto) {
    // Placeholder for sign-in logic
  const { username , password } = SignInDto;
  return this.authService.SignIn( username, password);
  }




}

  