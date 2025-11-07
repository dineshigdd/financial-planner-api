import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sigin-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) 
  async signIn(@Body() SignInDto:SignInDto) {
    // Placeholder for sign-in logic
    return this.authService.SignIn(SignInDto.username, SignInDto.password);
  }
}
