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
        
        return {
           accessToken,
           user: result,
        }
        
    }

    generateAccessToken( userId: String, username: string , role: string ) {
        const payload = { sub:userId, username , role} ;
        return this.jwtService.sign(payload);
    }
}
