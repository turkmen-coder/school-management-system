import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcryptjs');
jest.mock('../users/users.service');
jest.mock('./otp.service');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let otpService: jest.Mocked<OtpService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    phone: '+905551234567',
    password: 'hashedPassword',
    role: 'ADMIN',
    tenantId: 'tenant-1',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByPhone: jest.fn(),
            create: jest.fn(),
            validateUser: jest.fn(),
          },
        },
        {
          provide: OtpService,
          useValue: {
            generateAndSendOtp: jest.fn(),
            verifyOtp: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    otpService = module.get(OtpService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN' as const,
      tenantId: 'tenant-1',
    };

    it('should register a new user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      usersService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        user: mockUser,
        tokens: {
          accessToken: 'jwt-token',
          refreshToken: 'jwt-token',
        },
      });
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedPassword',
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      usersService.validateUser.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: mockUser,
        tokens: {
          accessToken: 'jwt-token',
          refreshToken: 'jwt-token',
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      usersService.validateUser.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestOtp', () => {
    it('should send OTP to normalized phone number', async () => {
      const phone = '0555 123 45 67';
      const normalizedPhone = '+905551234567';
      otpService.generateAndSendOtp.mockResolvedValue(undefined);

      const result = await service.requestOtp(phone);

      expect(result).toEqual({
        message: 'OTP sent successfully',
        phone: normalizedPhone,
      });
      expect(otpService.generateAndSendOtp).toHaveBeenCalledWith(normalizedPhone);
    });

    it('should handle various phone number formats', async () => {
      const testCases = [
        { input: '05551234567', expected: '+905551234567' },
        { input: '+90 555 123 45 67', expected: '+905551234567' },
        { input: '(555) 123-4567', expected: '+905551234567' },
        { input: '555 123 45 67', expected: '+905551234567' },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        otpService.generateAndSendOtp.mockResolvedValue(undefined);

        const result = await service.requestOtp(testCase.input);

        expect(result.phone).toBe(testCase.expected);
        expect(otpService.generateAndSendOtp).toHaveBeenCalledWith(testCase.expected);
      }
    });
  });

  describe('verifyOtp', () => {
    const verifyDto = {
      phone: '+905551234567',
      otp: '123456',
    };

    it('should verify OTP and return user tokens', async () => {
      otpService.verifyOtp.mockResolvedValue(true);
      usersService.findByPhone.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.verifyOtp(verifyDto);

      expect(result).toEqual({
        user: mockUser,
        tokens: {
          accessToken: 'jwt-token',
          refreshToken: 'jwt-token',
        },
      });
    });

    it('should throw UnauthorizedException for invalid OTP', async () => {
      otpService.verifyOtp.mockResolvedValue(false);

      await expect(service.verifyOtp(verifyDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      otpService.verifyOtp.mockResolvedValue(true);
      usersService.findByPhone.mockResolvedValue(null);

      await expect(service.verifyOtp(verifyDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const refreshTokenDto = { refreshToken: 'valid-refresh-token' };
      const payload = { userId: 'user-1', email: 'test@example.com' };

      jwtService.verify.mockReturnValue(payload);
      usersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('new-jwt-token');

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toEqual({
        accessToken: 'new-jwt-token',
        refreshToken: 'new-jwt-token',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshTokenDto = { refreshToken: 'invalid-token' };
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('normalizePhone', () => {
    it('should normalize Turkish phone numbers correctly', () => {
      const testCases = [
        { input: '05551234567', expected: '+905551234567' },
        { input: '+90 555 123 45 67', expected: '+905551234567' },
        { input: '(555) 123-4567', expected: '+905551234567' },
        { input: '0 555 123 45 67', expected: '+905551234567' },
        { input: '+905551234567', expected: '+905551234567' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = service['normalizePhone'](input);
        expect(result).toBe(expected);
      });
    });

    it('should handle invalid phone number formats', () => {
      const invalidInputs = ['123', 'abc', '', '555'];
      
      invalidInputs.forEach(input => {
        const result = service['normalizePhone'](input);
        expect(result).toMatch(/^\+90/); // Should still try to normalize
      });
    });
  });
});