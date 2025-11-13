import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common'; 

// 1. Define the mock service with the CORRECT capitalization 🔑
const mockAuthService = {
  SignIn: jest.fn(), // <-- FIX: Must be capitalized 'SignIn'
};

describe('AuthController', () => {
  let controller: AuthController;
  // Note: 'service' variable will now point to the mock object with the capitalized method
  let service: AuthService; 

  beforeEach(async () => {
    // Standard NestJS testing module setup
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService, 
          useValue: mockAuthService, 
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });


  //--
  describe('signUp', () => {
    it('should call authService.SignUp with username, password, email, role and return the JWT', async () => {
      // Arrange
      const signUpDto = { username: 'johndoe', password: 'password123!', email: 'dinesh@test.com', role: 'user' };
      
      // FIX: Define the expected token directly (since generateAccessToken isn't mocked)
      const expectedToken = { access_token: 'mock-jwt-token-for-user' }; 

      // Arrange: Set the mock return value (using SignUp - capitalized 'S')
      (service.SignUp as jest.Mock).mockResolvedValue(expectedToken); 

      // Act
      const result = await controller.signUp(signUpDto);

      // Assert 1: Check if the service method was called correctly (capitalized 'S')
      expect(service.SignUp).toHaveBeenCalledWith(
        signUpDto.username, 
        signUpDto.password,
        signUpDto.email,
        signUpDto.role,
      );
      
      // Assert 2
      expect(result).toEqual(expectedToken);
    });

    it('should throw an UnauthorizedException on service failure', async () => {
      // Arrange: Mock the service to throw an error (capitalized 'S')
      (service.SignUp as jest.Mock).mockRejectedValue(new UnauthorizedException()); 

      // Act & Assert
      await expect(
        controller.signUp({ username: 'wronguser', password: 'badpassword', email: 'jogndoe@exampl.com' , role: 'user' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
  // ---

  describe('signIn', () => {
    it('should call authService.SignIn with username and password and return the JWT', async () => {
      // Arrange
      const signInDto = { username: 'johndoe', password: 'password123!' };
      
      // FIX: Define the expected token directly (since generateAccessToken isn't mocked)
      const expectedToken = { access_token: 'mock-jwt-token-for-user' }; 

      // Arrange: Set the mock return value (using SignIn - capitalized 'S')
      (service.SignIn as jest.Mock).mockResolvedValue(expectedToken); 

      // Act
      const result = await controller.signIn(signInDto);

      // Assert 1: Check if the service method was called correctly (capitalized 'S')
      expect(service.SignIn).toHaveBeenCalledWith(
        signInDto.username, 
        signInDto.password,
      );
      
      // Assert 2
      expect(result).toEqual(expectedToken);
    });

    it('should throw an UnauthorizedException on service failure', async () => {
      // Arrange: Mock the service to throw an error (capitalized 'S')
      (service.SignIn as jest.Mock).mockRejectedValue(new UnauthorizedException()); 

      // Act & Assert
      await expect(
        controller.signIn({ username: 'wronguser', password: 'badpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});