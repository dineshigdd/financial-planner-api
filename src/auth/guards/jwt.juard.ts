import { Injectable , CanActivate, ExecutionContext , UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header not found');
        }

        // const token = authHeader.split(' ')[1]; // Assuming Bearer token
        const [ bearer , token ] = authHeader.split(' ');

        if ( bearer !== 'Bearer' || !token) {
            throw new UnauthorizedException('Token not found');
        }

        try {
            const payload = await this.authService.verifyAccessToken(token);
            request.user = payload; // Attach user info to request
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
       