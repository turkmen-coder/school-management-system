import { Injectable, OnModuleInit } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// Temporary mock for build - replace with actual PrismaClient when available
class MockPrismaClient {
  contact = {
    findUnique: (params?: any) => Promise.resolve(null),
    findFirst: (params?: any) => Promise.resolve(null),
    findMany: (params?: any) => Promise.resolve([]),
    count: (params?: any) => Promise.resolve(0),
    create: (data: any) => Promise.resolve({ id: 'mock-id', ...data.data }),
    update: (data: any) => Promise.resolve({ id: data.where.id, ...data.data }),
    delete: (params?: any) => Promise.resolve({}),
  };
  
  campaign = {
    findUnique: (params?: any) => Promise.resolve(null),
    findFirst: (params?: any) => Promise.resolve(null),
    findMany: (params?: any) => Promise.resolve([]),
    count: (params?: any) => Promise.resolve(0),
    create: (data: any) => Promise.resolve({ id: 'mock-id', ...data.data }),
    update: (data: any) => Promise.resolve({ id: data.where.id, ...data.data }),
    delete: (params?: any) => Promise.resolve({}),
  };
  
  prospect = {
    findUnique: (params?: any) => Promise.resolve({ 
      id: 'mock-id',
      score: 50,
      stage: 'INITIAL_CONTACT',
      status: 'ACTIVE',
      _count: { interactions: 0 }
    }),
    findFirst: (params?: any) => Promise.resolve(null),
    findMany: (params?: any) => Promise.resolve([]),
    count: (params?: any) => Promise.resolve(0),
    groupBy: (params?: any) => Promise.resolve([]),
    create: (data: any) => Promise.resolve({ id: 'mock-id', ...data.data }),
    update: (data: any) => Promise.resolve({ id: data.where.id, ...data.data }),
    delete: (params?: any) => Promise.resolve({}),
  };
  
  interaction = {
    findUnique: (params?: any) => Promise.resolve(null),
    findFirst: (params?: any) => Promise.resolve(null),
    findMany: (params?: any) => Promise.resolve([]),
    count: (params?: any) => Promise.resolve(0),
    create: (data: any) => Promise.resolve({ id: 'mock-id', ...data.data }),
    update: (data: any) => Promise.resolve({ id: data.where.id, ...data.data }),
    delete: (params?: any) => Promise.resolve({}),
  };
  
  conversion = {
    findUnique: (params?: any) => Promise.resolve(null),
    findFirst: (params?: any) => Promise.resolve(null),
    findMany: (params?: any) => Promise.resolve([]),
    count: (params?: any) => Promise.resolve(0),
    create: (data: any) => Promise.resolve({ id: 'mock-id', ...data.data }),
    update: (data: any) => Promise.resolve({ id: data.where.id, ...data.data }),
    delete: (params?: any) => Promise.resolve({}),
  };
  
  $connect = () => Promise.resolve();
  $disconnect = () => Promise.resolve();
}

@Injectable()
export class PrismaService extends MockPrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}