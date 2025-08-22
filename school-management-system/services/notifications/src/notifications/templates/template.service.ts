import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class TemplateService {
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor() {
    this.loadTemplates();
    this.registerHelpers();
  }

  private loadTemplates() {
    const templatePath = join(__dirname, 'views');
    
    // Load SMS templates
    this.loadTemplate('payment-reminder', join(templatePath, 'sms', 'payment-reminder.hbs'));
    this.loadTemplate('exam-reminder', join(templatePath, 'sms', 'exam-reminder.hbs'));
    this.loadTemplate('otp', join(templatePath, 'sms', 'otp.hbs'));
    
    // Load Email templates
    this.loadTemplate('welcome', join(templatePath, 'email', 'welcome.hbs'));
    this.loadTemplate('exam-invitation', join(templatePath, 'email', 'exam-invitation.hbs'));
    this.loadTemplate('exam-results', join(templatePath, 'email', 'exam-results.hbs'));
    this.loadTemplate('payment-confirmation', join(templatePath, 'email', 'payment-confirmation.hbs'));
    this.loadTemplate('contract-signed', join(templatePath, 'email', 'contract-signed.hbs'));
  }

  private loadTemplate(name: string, path: string) {
    try {
      const templateContent = readFileSync(path, 'utf8');
      this.templates.set(name, handlebars.compile(templateContent));
    } catch (error) {
      console.warn(`Template not found: ${path}`);
      // Create a simple fallback template
      this.templates.set(name, handlebars.compile('Bildirim: {{message}}'));
    }
  }

  private registerHelpers() {
    handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(amount);
    });

    handlebars.registerHelper('formatDate', (date: Date | string) => {
      const d = new Date(date);
      return new Intl.DateTimeFormat('tr-TR', {
        dateStyle: 'long',
        timeStyle: 'short'
      }).format(d);
    });

    handlebars.registerHelper('formatTime', (date: Date | string) => {
      const d = new Date(date);
      return new Intl.DateTimeFormat('tr-TR', {
        timeStyle: 'short'
      }).format(d);
    });

    handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
    handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    handlebars.registerHelper('lt', (a: number, b: number) => a < b);
    handlebars.registerHelper('and', (a: any, b: any) => a && b);
    handlebars.registerHelper('or', (a: any, b: any) => a || b);
  }

  async render(templateName: string, data: any): Promise<string> {
    const template = this.templates.get(templateName);
    
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    return template(data);
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}