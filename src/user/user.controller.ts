import { 
    Controller,
    Get,
    Post, 
    Body,
    Patch,
    Param,
    Delete,
    ForbiddenException,
    UseGuards,

} from '@nestjs/common';
import { UserService } from './user.service';
import type { Request } from 'express';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';




@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    //creting a new user is via /auth/register endpoint. this should be removed later
   /* @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    } */

    @Get()
    async findAll() {
        return this.userService.getAllUsers()
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string , @CurrentUser()  user: any) {
        if(  id !== user.id ){
           throw new ForbiddenException('Access to other user accounts is denied.');
        }
        

        return this.userService.findById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.updateUser(id, updateUserDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.userService.deleteUser(id);
    }
}
