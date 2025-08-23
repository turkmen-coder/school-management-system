// Mock auth exports for monitoring package
export const JwtAuthGuard = class JwtAuthGuard {};
export const Roles = (...args: any[]) => (target: any, key?: string, descriptor?: any) => {};
export const Public = () => (target: any, key?: string, descriptor?: any) => {};