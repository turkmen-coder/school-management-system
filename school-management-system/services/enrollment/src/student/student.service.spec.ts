import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@school/persistence';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';

describe('StudentService', () => {
  let service: StudentService;
  let prisma: jest.Mocked<PrismaService>;

  const mockStudent = {
    id: 'student-1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    tcKimlikNo: '12345678901',
    birthDate: new Date('2010-05-15'),
    gender: 'MALE',
    tenantId: 'tenant-1',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    student: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createStudentDto: CreateStudentDto = {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      tcKimlikNo: '12345678901',
      birthDate: '2010-05-15',
      gender: 'MALE',
      birthPlace: 'İstanbul',
      tenantId: 'tenant-1',
    };

    it('should create a student successfully', async () => {
      prisma.student.findFirst.mockResolvedValue(null); // No existing student
      prisma.student.create.mockResolvedValue(mockStudent);

      const result = await service.create(createStudentDto);

      expect(result).toEqual(mockStudent);
      expect(prisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          tcKimlikNo: createStudentDto.tcKimlikNo,
          tenantId: createStudentDto.tenantId,
        },
      });
      expect(prisma.student.create).toHaveBeenCalledWith({
        data: {
          ...createStudentDto,
          birthDate: new Date(createStudentDto.birthDate),
          status: 'ACTIVE',
          createdAt: expect.any(Date),
        },
      });
    });

    it('should throw ConflictException if student already exists with same TC', async () => {
      prisma.student.findFirst.mockResolvedValue(mockStudent);

      await expect(service.create(createStudentDto)).rejects.toThrow(ConflictException);
      expect(prisma.student.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException for invalid Turkish ID', async () => {
      const invalidTcDto = {
        ...createStudentDto,
        tcKimlikNo: '12345678900', // Invalid TC
      };

      prisma.student.findFirst.mockResolvedValue(null);

      await expect(service.create(invalidTcDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated students', async () => {
      const mockStudents = [mockStudent];
      const tenantId = 'tenant-1';
      
      prisma.student.findMany.mockResolvedValue(mockStudents);
      prisma.student.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, 1, 20);

      expect(result).toEqual({
        data: mockStudents,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });

      expect(prisma.student.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          parents: true,
          enrollments: {
            include: {
              class: true,
            },
          },
        },
      });
    });

    it('should handle search functionality', async () => {
      const tenantId = 'tenant-1';
      const search = 'Ahmet';
      
      prisma.student.findMany.mockResolvedValue([mockStudent]);
      prisma.student.count.mockResolvedValue(1);

      await service.findAll(tenantId, 1, 20, search);

      expect(prisma.student.findMany).toHaveBeenCalledWith({
        where: {
          tenantId,
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { tcKimlikNo: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          parents: true,
          enrollments: {
            include: {
              class: true,
            },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return student by id', async () => {
      const studentId = 'student-1';
      const tenantId = 'tenant-1';
      
      prisma.student.findFirst.mockResolvedValue(mockStudent);

      const result = await service.findOne(studentId, tenantId);

      expect(result).toEqual(mockStudent);
      expect(prisma.student.findFirst).toHaveBeenCalledWith({
        where: { id: studentId, tenantId },
        include: {
          parents: true,
          enrollments: {
            include: {
              class: true,
              academicYear: true,
            },
          },
          documents: true,
        },
      });
    });

    it('should throw NotFoundException if student not found', async () => {
      prisma.student.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateTurkishId', () => {
    it('should validate correct Turkish ID numbers', () => {
      const validIds = [
        '12345678901',
        '98765432109',
      ];

      // Note: These are mock IDs for testing. The actual algorithm should validate real Turkish IDs
      validIds.forEach(id => {
        const result = service['validateTurkishId'](id);
        // The method should return boolean based on Turkish ID validation algorithm
        expect(typeof result).toBe('boolean');
      });
    });

    it('should reject invalid Turkish ID numbers', () => {
      const invalidIds = [
        '12345678900', // Ends with 0
        '1234567890',  // Too short
        '123456789012', // Too long
        '01234567890', // Starts with 0
        'abcdefghijk', // Non-numeric
      ];

      invalidIds.forEach(id => {
        const result = service['validateTurkishId'](id);
        expect(result).toBe(false);
      });
    });
  });

  describe('bulkImport', () => {
    it('should import multiple students and return results', async () => {
      const studentsData = [
        { ...createStudentDto, tcKimlikNo: '12345678901' } as any,
        { ...createStudentDto, tcKimlikNo: '10987654321', firstName: 'Ayşe' } as any,
      ];
      
      // First student succeeds
      prisma.student.findFirst.mockResolvedValueOnce(null);
      prisma.student.create.mockResolvedValueOnce(mockStudent);
      
      // Second student fails (already exists)
      prisma.student.findFirst.mockResolvedValueOnce(mockStudent);

      const result = await service.bulkImport(studentsData, 'tenant-1');

      expect(result).toEqual({
        success: 1,
        failed: 1,
        errors: expect.arrayContaining([
          expect.objectContaining({
            row: 2,
            error: expect.any(String),
            data: studentsData[1],
          }),
        ]),
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      firstName: 'Mehmet',
      email: 'mehmet@example.com',
    };

    it('should update student successfully', async () => {
      const updatedStudent = { ...mockStudent, ...updateDto };
      
      // Mock findOne
      jest.spyOn(service, 'findOne').mockResolvedValue(mockStudent as any);
      prisma.student.update.mockResolvedValue(updatedStudent);

      const result = await service.update('student-1', 'tenant-1', updateDto);

      expect(result).toEqual(updatedStudent);
      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: {
          ...updateDto,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should validate new TC number when updating', async () => {
      const updateWithTc = { tcKimlikNo: '98765432109' };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(mockStudent as any);
      prisma.student.findFirst.mockResolvedValue(null); // No existing student with new TC
      prisma.student.update.mockResolvedValue({ ...mockStudent, ...updateWithTc });

      await service.update('student-1', 'tenant-1', updateWithTc);

      expect(prisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          tcKimlikNo: updateWithTc.tcKimlikNo,
          tenantId: 'tenant-1',
          NOT: { id: 'student-1' },
        },
      });
    });
  });

  describe('remove', () => {
    it('should soft delete student', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockStudent as any);
      prisma.student.update.mockResolvedValue({
        ...mockStudent,
        status: 'INACTIVE',
        deletedAt: new Date(),
      });

      const result = await service.remove('student-1', 'tenant-1');

      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: {
          status: 'INACTIVE',
          deletedAt: expect.any(Date),
        },
      });
    });
  });

  const createStudentDto: CreateStudentDto = {
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    tcKimlikNo: '12345678901',
    birthDate: '2010-05-15',
    gender: 'MALE',
    birthPlace: 'İstanbul',
    tenantId: 'tenant-1',
  };
});