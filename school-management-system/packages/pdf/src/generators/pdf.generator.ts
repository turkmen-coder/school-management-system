import * as pdf from 'html-pdf';
import * as handlebars from 'handlebars';
import * as QRCode from 'qrcode';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface PdfOptions {
  format?: string;
  orientation?: 'portrait' | 'landscape';
  border?: string;
  header?: {
    height?: string;
    contents?: string;
  };
  footer?: {
    height?: string;
    contents?: string;
  };
}

export class PdfGenerator {
  private static readonly DEFAULT_OPTIONS: pdf.CreateOptions = {
    format: 'A4',
    orientation: 'portrait',
    border: '1cm',
    header: {
      height: '1cm',
    },
    footer: {
      height: '1cm',
      contents: '<div style="text-align: center;">{{page}}/{{pages}}</div>',
    },
  };

  static async generateFromTemplate(
    templateName: string,
    data: any,
    options?: PdfOptions
  ): Promise<Buffer> {
    const templatePath = join(__dirname, '../templates', `${templateName}.hbs`);
    const templateContent = readFileSync(templatePath, 'utf8');
    
    const template = handlebars.compile(templateContent);
    const html = template(data);
    
    return this.generateFromHtml(html, options);
  }

  static async generateFromHtml(
    html: string,
    options?: PdfOptions
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
      
      pdf.create(html, mergedOptions).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });
  }

  static async generateQRCode(text: string, size: number = 200): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        width: size,
        height: size,
      });
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  static registerHelpers() {
    handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(amount);
    });

    handlebars.registerHelper('formatDate', (date: Date | string) => {
      const d = new Date(date);
      return new Intl.DateTimeFormat('tr-TR').format(d);
    });

    handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    handlebars.registerHelper('lt', (a: number, b: number) => a < b);
  }
}

// Initialize helpers
PdfGenerator.registerHelpers();