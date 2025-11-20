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
       
        this.handleForbiddenAccess( id, user);

        return this.userService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(@Param('id') id: string,@CurrentUser()  user: any, @Body() updateUserDto: UpdateUserDto) {

        this.handleForbiddenAccess( id, user);

        return this.userService.updateUser(id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @CurrentUser()  user: any ) {

        this.handleForbiddenAccess( id, user);

        return this.userService.deleteUser(id);
    }

    private handleForbiddenAccess( id: string, user: any) {
        if(  id !== user.id ){  
            throw new ForbiddenException('Access to other user accounts is denied.');
        }
    }
}
