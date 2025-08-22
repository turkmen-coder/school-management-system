import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

export interface PaymentRequest {
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardHolderName: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
  providerResponse?: any;
}

@Injectable()
export class IyzicoProvider {
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('IYZICO_API_KEY')!;
    this.secretKey = this.configService.get<string>('IYZICO_SECRET_KEY')!;
    this.baseUrl = this.configService.get<string>('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com';
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const requestData = {
        locale: 'tr',
        conversationId: request.orderId,
        price: request.amount.toFixed(2),
        paidPrice: request.amount.toFixed(2),
        currency: 'TRY',
        installment: '1',
        basketId: request.orderId,
        paymentChannel: 'WEB',
        paymentGroup: 'PRODUCT',
        paymentCard: {
          cardHolderName: request.cardHolderName,
          cardNumber: request.cardNumber,
          expireMonth: request.cardExpiry.split('/')[0],
          expireYear: '20' + request.cardExpiry.split('/')[1],
          cvc: request.cardCvc,
        },
        buyer: {
          id: 'BY' + Date.now(),
          name: request.customerName.split(' ')[0],
          surname: request.customerName.split(' ').slice(1).join(' '),
          gsmNumber: request.customerPhone,
          email: request.customerEmail,
          identityNumber: '74300864791', // Demo identity number
          registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
          ip: '85.34.78.112',
          city: 'Istanbul',
          country: 'Turkey',
        },
        shippingAddress: {
          contactName: request.customerName,
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        },
        billingAddress: {
          contactName: request.customerName,
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        },
        basketItems: [
          {
            id: 'BI' + Date.now(),
            name: 'Okul Ücreti',
            category1: 'Eğitim',
            itemType: 'VIRTUAL',
            price: request.amount.toFixed(2),
          },
        ],
      };

      const authString = this.generateAuthString(requestData);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/payment/auth`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authString,
            },
          }
        )
      );

      const result = response.data;

      if (result.status === 'success') {
        return {
          success: true,
          transactionId: result.paymentId,
          providerResponse: result,
        };
      } else {
        return {
          success: false,
          errorMessage: result.errorMessage || 'Payment failed',
          providerResponse: result,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.response?.data?.errorMessage || error.message,
        providerResponse: error.response?.data,
      };
    }
  }

  async refundPayment(transactionId: string, amount: number, reason: string): Promise<PaymentResponse> {
    try {
      const requestData = {
        locale: 'tr',
        conversationId: 'refund-' + Date.now(),
        paymentTransactionId: transactionId,
        price: amount.toFixed(2),
        currency: 'TRY',
        description: reason,
      };

      const authString = this.generateAuthString(requestData);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/payment/refund`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authString,
            },
          }
        )
      );

      const result = response.data;

      if (result.status === 'success') {
        return {
          success: true,
          transactionId: result.paymentTransactionId,
          providerResponse: result,
        };
      } else {
        return {
          success: false,
          errorMessage: result.errorMessage || 'Refund failed',
          providerResponse: result,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.response?.data?.errorMessage || error.message,
        providerResponse: error.response?.data,
      };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<any> {
    try {
      const requestData = {
        locale: 'tr',
        conversationId: 'status-check-' + Date.now(),
        paymentId: transactionId,
      };

      const authString = this.generateAuthString(requestData);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/payment/detail`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authString,
            },
          }
        )
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.errorMessage || error.message);
    }
  }

  private generateAuthString(requestData: any): string {
    const requestString = JSON.stringify(requestData);
    const pki = this.apiKey + requestString + this.secretKey;
    const token = crypto.createHmac('sha1', this.secretKey).update(pki).digest('base64');
    return `IYZWS ${this.apiKey}:${token}`;
  }

  // 3D Secure payment methods
  async initiate3DPayment(request: PaymentRequest, callbackUrl: string): Promise<any> {
    try {
      const requestData = {
        locale: 'tr',
        conversationId: request.orderId,
        price: request.amount.toFixed(2),
        paidPrice: request.amount.toFixed(2),
        currency: 'TRY',
        basketId: request.orderId,
        paymentGroup: 'PRODUCT',
        callbackUrl: callbackUrl,
        paymentCard: {
          cardHolderName: request.cardHolderName,
          cardNumber: request.cardNumber,
          expireMonth: request.cardExpiry.split('/')[0],
          expireYear: '20' + request.cardExpiry.split('/')[1],
          cvc: request.cardCvc,
        },
        buyer: {
          id: 'BY' + Date.now(),
          name: request.customerName.split(' ')[0],
          surname: request.customerName.split(' ').slice(1).join(' '),
          gsmNumber: request.customerPhone,
          email: request.customerEmail,
          identityNumber: '74300864791',
          registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
          ip: '85.34.78.112',
          city: 'Istanbul',
          country: 'Turkey',
        },
        basketItems: [
          {
            id: 'BI' + Date.now(),
            name: 'Okul Ücreti',
            category1: 'Eğitim',
            itemType: 'VIRTUAL',
            price: request.amount.toFixed(2),
          },
        ],
      };

      const authString = this.generateAuthString(requestData);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/payment/3dsecure/initialize`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authString,
            },
          }
        )
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.errorMessage || error.message);
    }
  }

  async complete3DPayment(conversationId: string, paymentId: string): Promise<PaymentResponse> {
    try {
      const requestData = {
        locale: 'tr',
        conversationId: conversationId,
        paymentId: paymentId,
      };

      const authString = this.generateAuthString(requestData);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/payment/3dsecure/auth`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authString,
            },
          }
        )
      );

      const result = response.data;

      if (result.status === 'success') {
        return {
          success: true,
          transactionId: result.paymentId,
          providerResponse: result,
        };
      } else {
        return {
          success: false,
          errorMessage: result.errorMessage || '3D payment completion failed',
          providerResponse: result,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.response?.data?.errorMessage || error.message,
        providerResponse: error.response?.data,
      };
    }
  }
}