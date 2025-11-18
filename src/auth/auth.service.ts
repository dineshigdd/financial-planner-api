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
        
        const user = await this.validateUser(username, password);
        const accessToken = this.generateAccessToken(user.id, user.username , user.role );
        const refreshToken = await this.generateRefreshToken(user.id);
        
        
        return {
           accessToken,
           refreshToken,
           user: user
        }
        
    }

    async SignUp(username: string, password: string, email: string, role?: string){ 
        
        const newUser = await this.users.createUser({
            username,
            password,
            email,
            role,
        });
     
        const accessToken:string = this.generateAccessToken(newUser.id, newUser.username , newUser.role );
        const refreshToken = await this.generateRefreshToken(newUser.id);

        return {
            accessToken,
            refreshToken,
            user:{
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            },
        };
    }
    

     async validateUser( username: string, password: string) {

        const user = await this.users.findByUsername(username);
       
        
        if( !user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password:_, ...result } = user;


        //generate and return JWT token here in real application
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

     
        return result;
    }   


    async logout( refreshToken: string): Promise<{ message: string }> {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });

        // CHANGE: Only attempt to update if the token exists AND is NOT already revoked.
        // If it's missing or revoked, we simply skip the DB operation.
        if(storedToken && !storedToken.revokedAt){
            
            // This is the only time we perform the DB write
            await this.prisma.refreshToken.update({
                where: { token: refreshToken },
                data: { revokedAt: new Date() },
            });
        }

        // if(!storedToken || storedToken.revokedAt){
        //     throw new UnauthorizedException('Invalid refresh token');
        // }
        
        // await this.prisma.refreshToken.update({
        //     where: { token: refreshToken },
        //     data: { revokedAt: new Date() },
        // });


        return { message: 'Logged out successfully.' };
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

    // Refresh access token
    async refreshAccessToken( refreshToken: string): Promise<{ accessToken: string }> {
        // Placeholder for refresh token logic  
        try{
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.REFRESH_TOKEN_SECRET,
            });

            const storedToken = await this.prisma.refreshToken.findUnique({
                where: {token: refreshToken },
                include: { user: true },
                });

            if(!storedToken || storedToken.revokedAt ){
                throw new UnauthorizedException('Invalid refresh token');
            }

            if( payload.type !== 'refresh'){
                throw new UnauthorizedException('Invalid token type');
            }

            if( new Date() > storedToken.expiresAt){
                throw new UnauthorizedException('Refresh token expired');
            }

            //Generate new access token
            const user = storedToken.user;
            const newAccessToken = this.generateAccessToken(user.id, user.username, user.role);
            return { accessToken: newAccessToken }; 
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }     

    

    

    // Verify access token (for guards)
    async verifyAccessToken( token: string): Promise<any> {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.users.findById(payload.sub);

            if(!user) {
                throw new UnauthorizedException('User not found');
            }
            return user;
        } catch (error) {
            throw new UnauthorizedException('Invalid access token');
        }
    }
}


