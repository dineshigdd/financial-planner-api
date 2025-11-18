import { Body, Controller, HttpCode, HttpStatus, Post , Res, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sigin-in.dto';
import { SignUpDto } from './dto/sign-up-dto';
import type { Response , Request} from 'express';
import { RefreshTokenDto } from './dto/refresh-token-dto';

@Controller('auth')
export class AuthController {
  constructor(private  authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED) 
  async signUp(@Body() SignUpDto:SignUpDto , @Res({ passthrough: true }) res: Response ) {
    // Placeholder for sign-up logic
    const { username , password , email } = SignUpDto; 
    const result = await this.authService.SignUp( username, password , email  );
    this.setAuthCookies( res,  result.accessToken , result.refreshToken);
    return {
      user: result.user,  
      message: 'User registered successfully',
    }   
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) 
  async signIn(@Body() SignInDto:SignInDto , @Res({ passthrough: true }) res: Response) {
    // Placeholder for sign-in logic
  const { username , password } = SignInDto;
  const result = await this.authService.SignIn( username, password);
  this.setAuthCookies( res,  result.accessToken , result.refreshToken);
    return {
      user: result.user,
      message: 'User logged in successfully',
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Get refresh token from cookie
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    // Set new access token cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return { message: 'Token refreshed' };
  }
  

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(   
    @Res({passthrough:true }) res: Response,
    @Req() req: Request
  ) {
    
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      return { message: 'User logged out successfully' };
    }

    // Invalidate the refresh token
    await this.authService.logout(refreshToken);

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');  
    return { message: 'User logged out successfully' };
  }


  private setAuthCookies( response: Response, accessToken: string, refreshToken: string) {
    // Set HttpOnly cookies for access and refresh tokens
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax', // Adjust based on your requirements
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}

  