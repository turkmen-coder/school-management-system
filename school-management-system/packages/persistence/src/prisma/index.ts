import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export { PrismaClient };
export { PrismaService } from './prisma.service';
export { PersistenceModule } from './prisma.module';