import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  
  constructor(private readonly configService: ConfigService) {}

  async sendSms(to: string, message: string): Promise<void> {
    try {
      const provider = this.configService.get('SMS_PROVIDER', 'iletimerkezi');
      
      switch (provider) {
        case 'iletimerkezi':
          await this.sendViaIletimerkezi(to, message);
          break;
        case 'netgsm':
          await this.sendViaNetgsm(to, message);
          break;
        default:
          throw new Error(`Unknown SMS provider: ${provider}`);
      }
      
      this.logger.log(`SMS sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}:`, error);
      throw error;
    }
  }

  private async sendViaIletimerkezi(to: string, message: string): Promise<void> {
    const apiUrl = 'https://api.iletimerkezi.com/v1/send-sms/get/';
    const username = this.configService.get('ILETIMERKEZI_USERNAME');
    const password = this.configService.get('ILETIMERKEZI_PASSWORD');
    const sender = this.configService.get('ILETIMERKEZI_SENDER');

    if (!username || !password) {
      throw new Error('İletimerkezi credentials not configured');
    }

    const params = {
      username,
      password,
      text: message,
      receipents: to.replace('+90', '').replace(/\s/g, ''),
      sender,
    };

    const response = await axios.post(apiUrl, null, { params });
    
    if (response.data.status !== 'success') {
      throw new Error(`İletimerkezi error: ${response.data.message}`);
    }
  }

  private async sendViaNetgsm(to: string, message: string): Promise<void> {
    const apiUrl = 'https://api.netgsm.com.tr/sms/send/get';
    const username = this.configService.get('NETGSM_USERNAME');
    const password = this.configService.get('NETGSM_PASSWORD');
    const header = this.configService.get('NETGSM_HEADER');

    if (!username || !password) {
      throw new Error('NetGSM credentials not configured');
    }

    const params = {
      usercode: username,
      password,
      gsmno: to.replace('+90', '').replace(/\s/g, ''),
      message,
      msgheader: header,
    };

    const response = await axios.post(apiUrl, null, { params });
    
    // NetGSM returns status codes, 0 and 1 mean success
    if (!['0', '1'].includes(response.data.trim())) {
      throw new Error(`NetGSM error: ${response.data}`);
    }
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    const message = `Doğrulama kodunuz: ${otp}. Bu kodu kimseyle paylaşmayın.`;
    await this.sendSms(to, message);
  }

  async sendBulkSms(recipients: string[], message: string): Promise<void> {
    const promises = recipients.map(phone => 
      this.sendSms(phone, message).catch(error => {
        this.logger.error(`Failed to send SMS to ${phone}:`, error);
        return { phone, error: error.message };
      })
    );

    await Promise.all(promises);
    this.logger.log(`Bulk SMS sent to ${recipients.length} recipients`);
  }
}