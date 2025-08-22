import { Injectable } from '@nestjs/common';

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  tenantId?: string;
  description?: string;
}

@Injectable()
export class RolesService {
  private readonly defaultRoles: Role[] = [
    {
      id: '1',
      name: 'SUPER_ADMIN',
      permissions: ['*'],
      description: 'Full system access',
    },
    {
      id: '2',
      name: 'ADMIN',
      permissions: [
        'students.read',
        'students.write',
        'contracts.read',
        'contracts.write',
        'payments.read',
        'payments.write',
        'reports.read',
      ],
      description: 'School admin with full campus access',
    },
    {
      id: '3',
      name: 'TEACHER',
      permissions: [
        'students.read',
        'classes.read',
        'exams.read',
        'exams.write',
      ],
      description: 'Teacher with class access',
    },
    {
      id: '4',
      name: 'PARENT',
      permissions: [
        'contracts.read.own',
        'payments.read.own',
        'payments.write.own',
        'students.read.own',
      ],
      description: 'Parent with access to own children data',
    },
    {
      id: '5',
      name: 'ACCOUNTANT',
      permissions: [
        'contracts.read',
        'contracts.write',
        'payments.read',
        'payments.write',
        'reports.read',
        'reports.write',
      ],
      description: 'Financial operations manager',
    },
  ];

  async findAll(): Promise<Role[]> {
    return this.defaultRoles;
  }

  async findById(id: string): Promise<Role | null> {
    return this.defaultRoles.find(role => role.id === id) || null;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.defaultRoles.find(role => role.name === name) || null;
  }

  async getUserPermissions(roleNames: string[]): Promise<string[]> {
    const permissions = new Set<string>();
    
    for (const roleName of roleNames) {
      const role = await this.findByName(roleName);
      if (role) {
        role.permissions.forEach(perm => permissions.add(perm));
      }
    }
    
    return Array.from(permissions);
  }

  async hasPermission(
    roleNames: string[], 
    requiredPermission: string
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(roleNames);
    
    // Check for wildcard permission
    if (permissions.includes('*')) {
      return true;
    }
    
    // Check for exact permission
    if (permissions.includes(requiredPermission)) {
      return true;
    }
    
    // Check for partial wildcard (e.g., 'students.*')
    const permissionParts = requiredPermission.split('.');
    for (let i = permissionParts.length - 1; i > 0; i--) {
      const wildcardPermission = permissionParts.slice(0, i).join('.') + '.*';
      if (permissions.includes(wildcardPermission)) {
        return true;
      }
    }
    
    return false;
  }
}