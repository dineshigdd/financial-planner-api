import { Injectable , UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import  { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import bcrypt from 'bcrypt';




@Injectable()
export class AuthService {
    constructor(
        private users: UserService,
        private jwtService: JwtService,
        private prisma:PrismaService,    
    ){}

    async SignIn(username: string, password: string){
        const user = await this.users.findByUsername(username);
        console.log( 'user', user);
        
        if( !user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password:_, ...result } = user;


        //generate and return JWT token here in real application
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = this.generateAccessToken(user.id, user.username , user.role );
        const refreshToken = await this.generateRefreshToken(user.id);
        
        return {
           accessToken,
           refreshToken,
           user: result,
        }
        
    }

    generateAccessToken( userId: String, username: string , role: string ):string {
        const payload = { sub:userId, username , role} ;
        return this.jwtService.sign(payload);
    }

    async generateRefreshToken( userId: string):Promise<string> {
        const payload = { sub:userId,type: 'refresh' , jti: crypto.randomUUID} ;
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: '7d', // Refresh token expires in 7 days
        });

        // Store refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration date to 7 days from now

            await this.prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: userId,
                    expiresAt: expiresAt,
                },
        });

        return refreshToken;
    }
}


