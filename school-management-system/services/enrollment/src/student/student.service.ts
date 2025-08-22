import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@school/persistence';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    const { tenantId, ...studentData } = createStudentDto;

    // Check if student already exists with same TC
    const existingStudent = await this.prisma.student.findFirst({
      where: {
        tcKimlikNo: studentData.tcKimlikNo,
        tenantId,
      },
    });

    if (existingStudent) {
      throw new ConflictException('Bu TC kimlik numarasıyla kayıtlı öğrenci zaten mevcut');
    }

    // Validate Turkish ID
    if (!this.validateTurkishId(studentData.tcKimlikNo)) {
      throw new ConflictException('Geçersiz TC kimlik numarası');
    }

    return this.prisma.student.create({
      data: {
        ...studentData,
        tenantId,
        status: 'ACTIVE',
        createdAt: new Date(),
      },
    });
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    
    const where = {
      tenantId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { tcKimlikNo: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          parents: true,
          enrollments: {
            include: {
              class: true,
            },
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
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

    if (!student) {
      throw new NotFoundException('Öğrenci bulunamadı');
    }

    return student;
  }

  async update(id: string, tenantId: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.findOne(id, tenantId);

    // If updating TC, check for conflicts
    if (updateStudentDto.tcKimlikNo && updateStudentDto.tcKimlikNo !== student.tcKimlikNo) {
      if (!this.validateTurkishId(updateStudentDto.tcKimlikNo)) {
        throw new ConflictException('Geçersiz TC kimlik numarası');
      }

      const existingStudent = await this.prisma.student.findFirst({
        where: {
          tcKimlikNo: updateStudentDto.tcKimlikNo,
          tenantId,
          NOT: { id },
        },
      });

      if (existingStudent) {
        throw new ConflictException('Bu TC kimlik numarasıyla kayıtlı öğrenci zaten mevcut');
      }
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        ...updateStudentDto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    // Soft delete
    return this.prisma.student.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });
  }

  async bulkImport(studentsData: CreateStudentDto[], tenantId: string) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string; data: any }>,
    };

    for (let i = 0; i < studentsData.length; i++) {
      try {
        await this.create({ ...studentsData[i], tenantId });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message,
          data: studentsData[i],
        });
      }
    }

    return results;
  }

  private validateTurkishId(tcKimlikNo: string): boolean {
    if (!/^\d{11}$/.test(tcKimlikNo)) return false;
    if (tcKimlikNo[0] === '0') return false;

    const digits = tcKimlikNo.split('').map(Number);
    const checksum = digits[10];

    // First 10 digits sum check
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    
    const tenthDigit = ((oddSum * 7) - evenSum) % 10;
    if (tenthDigit !== digits[9]) return false;

    // All digits sum check
    const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
    if (totalSum % 10 !== checksum) return false;

    return true;
  }
}