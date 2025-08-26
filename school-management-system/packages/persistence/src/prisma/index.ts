import { PrismaClient } from '../generated/client';

export const prisma = new PrismaClient();
export { PrismaClient };
export { PrismaService } from './prisma.service';
export { PersistenceModule } from './prisma.module';
export { PersistenceModule as PrismaModule } from './prisma.module';