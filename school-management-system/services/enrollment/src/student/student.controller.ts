import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
// import { multer } from 'multer';
import * as ExcelJS from 'exceljs';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  create(
    @Body() createStudentDto: CreateStudentDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.studentService.create({ ...createStudentDto, tenantId });
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.studentService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.studentService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, tenantId, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.studentService.remove(id, tenantId);
  }

  @Post('bulk-import')
  @UseInterceptors(FileInterceptor('file'))
  async bulkImport(
    @Headers('x-tenant-id') tenantId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /\.(xlsx|xls)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as unknown as ArrayBuffer);

    const worksheet = workbook.getWorksheet(1);
    const studentsData: CreateStudentDto[] = [];

    // Skip header row (row 1)
    if (worksheet) {
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
      
      if (!row.getCell(1).value) continue; // Skip empty rows

      const studentData: CreateStudentDto = {
        firstName: row.getCell(1).value?.toString() || '',
        lastName: row.getCell(2).value?.toString() || '',
        tcKimlikNo: row.getCell(3).value?.toString() || '',
        birthDate: this.parseDate(row.getCell(4).value),
        gender: row.getCell(5).value?.toString() as any,
        birthPlace: row.getCell(6).value?.toString() || '',
        email: row.getCell(7).value?.toString(),
        phone: row.getCell(8).value?.toString(),
        address: row.getCell(9).value?.toString(),
        city: row.getCell(10).value?.toString(),
        district: row.getCell(11).value?.toString(),
        emergencyContactName: row.getCell(12).value?.toString(),
        emergencyContactPhone: row.getCell(13).value?.toString(),
        previousSchool: row.getCell(14).value?.toString(),
        tenantId,
      };

        studentsData.push(studentData);
      }
    }

    return this.studentService.bulkImport(studentsData, tenantId);
  }

  @Get('export/template')
  async exportTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Öğrenci Listesi');

    // Headers
    worksheet.columns = [
      { header: 'Ad', key: 'firstName', width: 15 },
      { header: 'Soyad', key: 'lastName', width: 15 },
      { header: 'TC Kimlik No', key: 'tcKimlikNo', width: 15 },
      { header: 'Doğum Tarihi (YYYY-MM-DD)', key: 'birthDate', width: 20 },
      { header: 'Cinsiyet (MALE/FEMALE)', key: 'gender', width: 20 },
      { header: 'Doğum Yeri', key: 'birthPlace', width: 15 },
      { header: 'E-posta', key: 'email', width: 25 },
      { header: 'Telefon', key: 'phone', width: 15 },
      { header: 'Adres', key: 'address', width: 30 },
      { header: 'Şehir', key: 'city', width: 15 },
      { header: 'İlçe', key: 'district', width: 15 },
      { header: 'Acil Durum İletişim Adı', key: 'emergencyContactName', width: 25 },
      { header: 'Acil Durum Telefonu', key: 'emergencyContactPhone', width: 20 },
      { header: 'Önceki Okul', key: 'previousSchool', width: 25 },
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E3F2FD' },
    };

    // Sample data
    worksheet.addRow({
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      tcKimlikNo: '12345678901',
      birthDate: '2010-05-15',
      gender: 'MALE',
      birthPlace: 'İstanbul',
      email: 'ahmet@example.com',
      phone: '05551234567',
      address: 'Atatürk Mahallesi No:10',
      city: 'İstanbul',
      district: 'Kadıköy',
      emergencyContactName: 'Mehmet Yılmaz',
      emergencyContactPhone: '05557654321',
      previousSchool: 'ABC İlkokulu',
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buffer),
      filename: 'ogrenci-import-template.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private parseDate(value: any): string {
    if (!value) return '';
    
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    if (typeof value === 'string') {
      const date = new Date(value);
      return date.toISOString().split('T')[0];
    }
    
    return '';
  }
}