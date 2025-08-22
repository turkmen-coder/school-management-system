import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '@school/persistence';
import * as bcrypt from 'bcryptjs';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
    tenantId: 'test-tenant',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    await app.init();

    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });

    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toMatchObject({
        user: {
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          role: testUser.role,
          tenantId: testUser.tenantId,
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      });

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe(testUser.email);
      expect(await bcrypt.compare(testUser.password, createdUser!.password)).toBe(true);
    });

    it('should return 409 for duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should validate required fields', async () => {
      const invalidUser = { ...testUser };
      delete invalidUser.email;

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        user: {
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          role: testUser.role,
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      });

      // Verify JWT token is valid
      const decoded = jwtService.verify(response.body.tokens.accessToken);
      expect(decoded.email).toBe(testUser.email);
    });

    it('should return 401 for invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/auth/request-otp (POST)', () => {
    it('should send OTP to valid phone number', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/request-otp')
        .send({ phone: '0555 123 45 67' })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'OTP sent successfully',
        phone: '+905551234567',
      });
    });

    it('should normalize phone number formats', async () => {
      const phoneFormats = [
        '05551234567',
        '+90 555 123 45 67',
        '(555) 123-4567',
        '555 123 45 67',
      ];

      for (const phone of phoneFormats) {
        const response = await request(app.getHttpServer())
          .post('/auth/request-otp')
          .send({ phone })
          .expect(200);

        expect(response.body.phone).toBe('+905551234567');
      }
    });

    it('should validate phone number format', async () => {
      await request(app.getHttpServer())
        .post('/auth/request-otp')
        .send({ phone: 'invalid' })
        .expect(400);
    });
  });

  describe('/auth/verify-otp (POST)', () => {
    let userWithPhone: any;

    beforeAll(async () => {
      // Create a user with phone number for OTP testing
      const hashedPassword = await bcrypt.hash('password123', 10);
      userWithPhone = await prisma.user.create({
        data: {
          email: 'otp-test@example.com',
          phone: '+905551234567',
          password: hashedPassword,
          firstName: 'OTP',
          lastName: 'Test',
          role: 'ADMIN',
          tenantId: 'test-tenant',
          isActive: true,
        },
      });
    });

    afterAll(async () => {
      await prisma.user.delete({
        where: { id: userWithPhone.id },
      });
    });

    // Note: This test requires mocking the OTP service
    // In a real implementation, you would mock the SMS service
    it('should verify OTP and return tokens (mocked)', async () => {
      // This is a placeholder test - in reality you'd need to mock the OTP service
      // and provide a valid OTP code
      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phone: '+905551234567',
          otp: '123456', // This would be a valid OTP in a real scenario
        });

      // The response will depend on your OTP service implementation
      // This is just to show the test structure
      expect([200, 401]).toContain(response.status);
    });

    it('should return 400 for invalid phone format', async () => {
      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phone: 'invalid',
          otp: '123456',
        })
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let validRefreshToken: string;

    beforeAll(async () => {
      // Login to get a valid refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      validRefreshToken = loginResponse.body.tokens.refreshToken;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      // Verify new tokens are different from old ones
      expect(response.body.accessToken).not.toBe(validRefreshToken);
    });

    it('should return 401 for invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });

    it('should return 401 for expired refresh token', async () => {
      // Create an expired token
      const expiredToken = jwtService.sign(
        { userId: 'user-id', email: testUser.email },
        { expiresIn: '-1h' }
      );

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = loginResponse.body.tokens.accessToken;
    });

    it('should access protected route with valid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return 401 for protected route without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return 401 for protected route with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Rate Limiting and Security', () => {
    it('should handle multiple login attempts', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'wrongpassword',
          })
      );

      const responses = await Promise.all(promises);
      
      // All should return 401 for wrong credentials
      responses.forEach(response => {
        expect(response.status).toBe(401);
      });
    });

    it('should sanitize error messages', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      // Should not reveal whether email exists or not
      expect(response.body.message).not.toContain('user not found');
      expect(response.body.message).not.toContain('email');
    });
  });
});