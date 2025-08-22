import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@school/persistence';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { AssignStudentDto } from './dto/assign-student.dto';

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createParentDto: CreateParentDto) {
    const { tenantId, ...parentData } = createParentDto;

    // Check if parent already exists with same TC
    const existingParent = await this.prisma.parent.findFirst({
      where: {
        tcKimlikNo: parentData.tcKimlikNo,
        tenantId,
      },
    });

    if (existingParent) {
      throw new ConflictException('Bu TC kimlik numarasıyla kayıtlı veli zaten mevcut');
    }

    // Validate Turkish ID
    if (!this.validateTurkishId(parentData.tcKimlikNo)) {
      throw new ConflictException('Geçersiz TC kimlik numarası');
    }

    return this.prisma.parent.create({
      data: {
        ...parentData,
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
          { phone: { contains: search } },
        ],
      }),
    };

    const [parents, total] = await Promise.all([
      this.prisma.parent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          students: {
            include: {
              student: true,
            },
          },
        },
      }),
      this.prisma.parent.count({ where }),
    ]);

    return {
      data: parents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const parent = await this.prisma.parent.findFirst({
      where: { id, tenantId },
      include: {
        students: {
          include: {
            student: {
              include: {
                enrollments: {
                  include: {
                    class: true,
                    academicYear: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Veli bulunamadı');
    }

    return parent;
  }

  async update(id: string, tenantId: string, updateParentDto: UpdateParentDto) {
    const parent = await this.findOne(id, tenantId);

    // If updating TC, check for conflicts
    if (updateParentDto.tcKimlikNo && updateParentDto.tcKimlikNo !== parent.tcKimlikNo) {
      if (!this.validateTurkishId(updateParentDto.tcKimlikNo)) {
        throw new ConflictException('Geçersiz TC kimlik numarası');
      }

      const existingParent = await this.prisma.parent.findFirst({
        where: {
          tcKimlikNo: updateParentDto.tcKimlikNo,
          tenantId,
          NOT: { id },
        },
      });

      if (existingParent) {
        throw new ConflictException('Bu TC kimlik numarasıyla kayıtlı veli zaten mevcut');
      }
    }

    return this.prisma.parent.update({
      where: { id },
      data: {
        ...updateParentDto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    // Check if parent has students
    const parentWithStudents = await this.prisma.parent.findFirst({
      where: { id, tenantId },
      include: {
        students: true,
      },
    });

    if (parentWithStudents.students.length > 0) {
      throw new ConflictException('Bu velinin öğrencileri mevcut. Önce öğrenci ilişkilerini kaldırın.');
    }

    // Soft delete
    return this.prisma.parent.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });
  }

  async assignStudent(parentId: string, tenantId: string, assignStudentDto: AssignStudentDto) {
    const parent = await this.findOne(parentId, tenantId);
    
    // Check if student exists
    const student = await this.prisma.student.findFirst({
      where: {
        id: assignStudentDto.studentId,
        tenantId,
      },
    });

    if (!student) {
      throw new NotFoundException('Öğrenci bulunamadı');
    }

    // Check if relationship already exists
    const existingRelationship = await this.prisma.studentParent.findFirst({
      where: {
        studentId: assignStudentDto.studentId,
        parentId,
      },
    });

    if (existingRelationship) {
      throw new ConflictException('Bu veli-öğrenci ilişkisi zaten mevcut');
    }

    return this.prisma.studentParent.create({
      data: {
        studentId: assignStudentDto.studentId,
        parentId,
        relationshipType: assignStudentDto.relationshipType,
        isPrimary: false, // Can be updated later
        canPickUp: true,
        canViewGrades: true,
        canViewAttendance: true,
        createdAt: new Date(),
      },
    });
  }

  async unassignStudent(parentId: string, studentId: string, tenantId: string) {
    const parent = await this.findOne(parentId, tenantId);

    const relationship = await this.prisma.studentParent.findFirst({
      where: {
        studentId,
        parentId,
      },
    });

    if (!relationship) {
      throw new NotFoundException('Veli-öğrenci ilişkisi bulunamadı');
    }

    return this.prisma.studentParent.delete({
      where: { id: relationship.id },
    });
  }

  async updateRelationship(
    parentId: string,
    studentId: string,
    tenantId: string,
    updateData: {
      relationshipType?: string;
      isPrimary?: boolean;
      canPickUp?: boolean;
      canViewGrades?: boolean;
      canViewAttendance?: boolean;
    },
  ) {
    const parent = await this.findOne(parentId, tenantId);

    const relationship = await this.prisma.studentParent.findFirst({
      where: {
        studentId,
        parentId,
      },
    });

    if (!relationship) {
      throw new NotFoundException('Veli-öğrenci ilişkisi bulunamadı');
    }

    return this.prisma.studentParent.update({
      where: { id: relationship.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
  }

  async getStudentsByParent(parentId: string, tenantId: string) {
    const parent = await this.findOne(parentId, tenantId);

    return this.prisma.studentParent.findMany({
      where: { parentId },
      include: {
        student: {
          include: {
            enrollments: {
              include: {
                class: true,
                academicYear: true,
              },
            },
          },
        },
      },
    });
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