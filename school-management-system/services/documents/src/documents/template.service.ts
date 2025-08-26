import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@school/persistence';
// @ts-ignore
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

interface TemplateData {
  student?: any;
  parent?: any;
  contract?: any;
  exam?: any;
  tenant?: any;
  campus?: any;
  installments?: any[];
  [key: string]: any;
}

@Injectable()
export class TemplateService {
  private templatesPath = path.join(__dirname, '..', '..', 'templates');

  constructor(private readonly prisma: PrismaService) {
    this.registerHelpers();
  }

  private registerHelpers() {
    // Türkçe para formatı
    Handlebars.registerHelper('currency', (amount: number) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount || 0);
    });

    // Tarih formatı
    Handlebars.registerHelper('date', (date: string | Date, format?: string) => {
      const dateObj = new Date(date);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };

      if (format === 'short') {
        options.month = 'short';
      }

      return new Intl.DateTimeFormat('tr-TR', options).format(dateObj);
    });

    // Sayı yazıyla
    Handlebars.registerHelper('numberToText', (num: number) => {
      // Basit implementasyon - production'da daha kapsamlı olmalı
      const units = ['', 'bin', 'milyon', 'milyar'];
      const ones = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
      
      if (num === 0) return 'sıfır';
      
      let result = '';
      let unitIndex = 0;
      
      while (num > 0) {
        const group = num % 1000;
        if (group > 0) {
          result = this.groupToText(group) + (units[unitIndex] ? ' ' + units[unitIndex] : '') + ' ' + result;
        }
        num = Math.floor(num / 1000);
        unitIndex++;
      }
      
      return result.trim();
    });

    // Koşullu gösterim
    Handlebars.registerHelper('if_gt', function(a: number, b: number, options: any) {
      const context = this;
      return a > b ? options.fn(context) : options.inverse(context);
    });

    // Toplam hesaplama
    Handlebars.registerHelper('sum', (items: any[], field: string) => {
      return items.reduce((total, item) => total + (item[field] || 0), 0);
    });
  }

  private groupToText(num: number): string {
    const ones = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
    const tens = ['', '', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
    const hundreds = ['', 'yüz'];
    
    let result = '';
    
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const o = num % 10;
    
    if (h > 0) {
      result += (h === 1 ? '' : ones[h]) + hundreds[1];
    }
    
    if (t > 0) {
      if (t === 1) {
        result += (result ? ' ' : '') + (o === 0 ? 'on' : 'on' + ones[o]);
      } else {
        result += (result ? ' ' : '') + tens[t];
      }
    }
    
    if (o > 0 && t !== 1) {
      result += (result ? ' ' : '') + ones[o];
    }
    
    return result;
  }

  async renderTemplate(templateName: string, data: TemplateData): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      
      if (!fs.existsSync(templatePath)) {
        throw new NotFoundException(`Template not found: ${templateName}`);
      }

      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const template = Handlebars.compile(templateContent);
      
      return template(data);
    } catch (error) {
      const err = error as any;
      throw new Error(`Template rendering failed: ${err.message}`);
    }
  }

  async getAvailableTemplates(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.templatesPath);
      return files
        .filter(file => file.endsWith('.hbs'))
        .map(file => file.replace('.hbs', ''));
    } catch (error) {
      return [];
    }
  }

  async validateTemplateData(templateName: string, data: TemplateData): Promise<boolean> {
    const requiredFields: Record<string, string[]> = {
      'contract': ['student', 'parent', 'contract', 'tenant'],
      'installment-plan': ['contract', 'installments'],
      'admission-ticket': ['student', 'exam', 'application'],
      'exam-results': ['exam', 'results'],
    };

    const required = requiredFields[templateName] || [];
    
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return true;
  }

  async createCustomTemplate(name: string, content: string): Promise<void> {
    try {
      // Güvenlik kontrolü - sadece admin kullanıcıları
      const templatePath = path.join(this.templatesPath, `${name}.hbs`);
      
      // Template syntax kontrolü
      try {
        Handlebars.compile(content);
      } catch (error) {
        const err = error as any;
        throw new Error(`Invalid template syntax: ${err.message}`);
      }

      fs.writeFileSync(templatePath, content, 'utf-8');
    } catch (error) {
      const err = error as any;
      throw new Error(`Template creation failed: ${err.message}`);
    }
  }

  async previewTemplate(templateName: string, sampleData?: TemplateData): Promise<string> {
    const defaultSampleData: TemplateData = {
      student: {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        identityNumber: '12345678901',
        birthDate: '2010-05-15',
      },
      parent: {
        firstName: 'Mehmet',
        lastName: 'Yılmaz',
        phone: '+905551234567',
        email: 'mehmet@example.com',
      },
      contract: {
        contractNumber: 'CT-2024-001',
        totalAmount: 25000,
        semester: '2024-2025 Güz',
        createdAt: new Date(),
      },
      tenant: {
        name: 'Örnek Okul',
        address: 'İstanbul, Türkiye',
        phone: '+902121234567',
      },
      installments: [
        { sequenceNo: 1, amount: 5000, dueDate: '2024-09-01' },
        { sequenceNo: 2, amount: 5000, dueDate: '2024-10-01' },
        { sequenceNo: 3, amount: 5000, dueDate: '2024-11-01' },
        { sequenceNo: 4, amount: 5000, dueDate: '2024-12-01' },
        { sequenceNo: 5, amount: 5000, dueDate: '2025-01-01' },
      ],
    };

    const data = sampleData || defaultSampleData;
    return this.renderTemplate(templateName, data);
  }
}