import { Injectable , UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import  { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import bcrypt from 'bcrypt';
import { access } from 'fs';




@Injectable()
export class AuthService {
    constructor(
        private users: UserService,
        private jwtService: JwtService,
        private prisma:PrismaService,    
    ){}

    async SignIn(username: string, password: string){
        const user = await this.users.findByUsername(username);
        if( user?.password !== password) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const { password:_, ...result } = user;


        //generate and return JWT token here in real application
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = this.generateAccessToken(user.id, user.username);
        
        return {
           accessToken,
           user: result,
        }
        
    }

    async generateAccessToken( id: String, username: string): Promise<string> {
        const payload = { sub:id, username };
        return this.jwtService.signAsync(payload);
    }
}
