// auth/guards/guards.module.ts
import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtAuthGuard } from './jwt.guard';


@Global()  //Makes guards available everywhere
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,      
    }),
  ],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard,PrismaModule, JwtModule]//exporting JwtAuthGuard is optional, but a good practice
})
export class GuardsModule {}