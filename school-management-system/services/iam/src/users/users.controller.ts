import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  NotFoundException 
} from '@nestjs/common';
import { UsersService, User } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('tenantId') tenantId?: string,
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      tenantId,
      role,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };

    const result = await this.usersService.findAll(filters);
    
    return {
      success: true,
      data: result.users,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / filters.limit),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<{ success: boolean; user: User }> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { success: true, user };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: any): Promise<User | null> {
    const user = await this.usersService.update(id, updateData);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.usersService.delete(id);
    if (!deleted) {
      throw new Error('User not found');
    }
    return { success: true, message: 'User deleted successfully' };
  }
}