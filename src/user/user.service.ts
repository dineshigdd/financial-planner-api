import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private  prisma: PrismaService) {}

    // Add user-related methods here
    async createUser(data: {
        username: string;
        email: string;
        password: string;
        role?: string;      
      }): Promise<Omit <User, 'password'>> {
 
       
        const existingUser = await this.prisma.user.findFirst({
          //Find a record WHERE the email column matches the provided email 
          // OR the username column matches the provided username.
          where: { 
            OR:[{email: data.email}, {username: data.username}] 
           },
        });
  
        if (existingUser?.username === data.username) {
          throw new ConflictException('User with this username already exists');
        }else if (existingUser?.email === data.email) {
          throw new ConflictException('User with this email already exists');
        }  


        //Hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        // create a new user record in the database
        const user = await this.prisma.user.create({ 
          data: {
            username: data.username,
            password: hashedPassword,
            email: data.email,          
            role: data.role || 'user', // Default role is 'USER' if not provided
          }, 
        });

            //Exclude the password field from the returned user object
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword; 
  
       
      }

      
      //find user by username
      async findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { username } });
        
    }

    //find user by ID 
    async findById(id: string): Promise<Omit <User, 'password'> | null> {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
          return null;
        }
        
        if( id !== user.id){
          throw new ForbiddenException('User ID mismatch. Access denied.');
        }

        const { password, ...userWithoutPassword } = user;   
        return userWithoutPassword;
    }    
      
    //find user by email
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });

    }

    //get all users( for admin purposes)
    async getAllUsers(): Promise<Omit <User, 'password'>[]> {
        const users = await this.prisma.user.findMany();
      
        //Exclude password from each user object
        return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);

  }


  //===update user ===
  async updateUser(id: string, data:{
    username?: string;
    email?: string;
    password?: string;
    role?: string;
  }): Promise<Omit <User, 'password'>> {
     const user = await this.prisma.user.findUnique({ where: { id } });

     if (!user) {
      throw new Error('User not found');
    }

    if (data.password) {
      //Hash the new password before updating
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }


    // === Delete User ===
    async deleteUser(id: string): Promise<Omit <User, 'password'>> {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new Error('User not found');
      }

      const deletedUser = await this.prisma.user.delete({ where: { id } });

      const { password, ...userWithoutPassword } = deletedUser;
      return userWithoutPassword;
    }

   //verify user password
  //  async verifyPassword(username: string, password: string): Promise<boolean> {
  //     const user = await this.prisma.user.findUnique({ where: { username } });

  //     if (!user) {
  //       return false;
  //     }

  //     return bcrypt.compare(password, user.password);
  //  }


     // Validate password (for login)
  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  }

