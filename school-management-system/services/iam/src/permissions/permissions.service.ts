import { Injectable } from '@nestjs/common';
import { RolesService } from '../roles/roles.service';

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

@Injectable()
export class PermissionsService {
  constructor(private readonly rolesService: RolesService) {}

  private readonly permissions: Permission[] = [
    // Student permissions
    { resource: 'students', action: 'read' },
    { resource: 'students', action: 'write' },
    { resource: 'students', action: 'delete' },
    
    // Contract permissions
    { resource: 'contracts', action: 'read' },
    { resource: 'contracts', action: 'write' },
    { resource: 'contracts', action: 'delete' },
    
    // Payment permissions
    { resource: 'payments', action: 'read' },
    { resource: 'payments', action: 'write' },
    { resource: 'payments', action: 'refund' },
    
    // Exam permissions
    { resource: 'exams', action: 'read' },
    { resource: 'exams', action: 'write' },
    { resource: 'exams', action: 'delete' },
    
    // Report permissions
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'write' },
    { resource: 'reports', action: 'export' },
    
    // User management permissions
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'write' },
    { resource: 'users', action: 'delete' },
    
    // System permissions
    { resource: 'system', action: 'config' },
    { resource: 'system', action: 'audit' },
  ];

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissions;
  }

  async checkPermission(
    user: any,
    resource: string,
    action: string,
    resourceData?: any
  ): Promise<boolean> {
    const permission = `${resource}.${action}`;
    const hasBasePermission = await this.rolesService.hasPermission(
      [user.role],
      permission
    );

    if (!hasBasePermission) {
      // Check for ownership-based permission
      const ownPermission = `${resource}.${action}.own`;
      const hasOwnPermission = await this.rolesService.hasPermission(
        [user.role],
        ownPermission
      );

      if (hasOwnPermission && resourceData) {
        return this.checkOwnership(user, resourceData);
      }

      return false;
    }

    // Apply additional conditions if needed
    if (user.tenantId && resourceData?.tenantId) {
      if (user.tenantId !== resourceData.tenantId) {
        return false;
      }
    }

    if (user.campusIds && resourceData?.campusId) {
      if (!user.campusIds.includes(resourceData.campusId)) {
        return false;
      }
    }

    return true;
  }

  private checkOwnership(user: any, resourceData: any): boolean {
    // Check if user owns the resource
    if (resourceData.userId === user.id) {
      return true;
    }

    // Check if parent owns student data
    if (resourceData.parentId === user.id) {
      return true;
    }

    // Check if resource is related to user's children
    if (user.childrenIds && resourceData.studentId) {
      return user.childrenIds.includes(resourceData.studentId);
    }

    return false;
  }
}