// backend/src/controllers/NurseTaskController.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NurseTaskService } from '../services/NurseTaskService';

@Controller('nurse-tasks')
export class NurseTaskController {
  constructor(private nurseTaskService: NurseTaskService) {}

  @Post()
  @HttpCode(201)
  async createTask(
    @Body() body: any,
    @Req() req: any,
  ): Promise<any> {
    try {
      const {
        wardId,
        patientId,
        assignedToNurseId,
        type,
        priority,
        title,
        description,
        scheduledTime,
        dueTime,
        metadata,
      } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const task = await this.nurseTaskService.createTask(
        {
          wardId,
          patientId,
          assignedToNurseId,
          type,
          priority,
          title,
          description,
          scheduledTime,
          dueTime,
          metadata,
        },
        userId,
      );

      return {
        success: true,
        data: task,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to create task',
      );
    }
  }

  @Put(':taskId/status')
  async updateTaskStatus(
    @Param('taskId') taskId: string,
    @Body() body: any,
    @Req() req: any,
  ): Promise<any> {
    try {
      const { status, completionNotes } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const task = await this.nurseTaskService.updateTaskStatus(
        {
          taskId,
          status,
          completionNotes,
        },
        userId,
      );

      return {
        success: true,
        data: task,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to update task status',
      );
    }
  }

  @Put(':taskId/assign')
  async assignTask(
    @Param('taskId') taskId: string,
    @Body() body: any,
    @Req() req: any,
  ): Promise<any> {
    try {
      const { assignedToNurseId } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const task = await this.nurseTaskService.assignTask(
        {
          taskId,
          assignedToNurseId,
        },
        userId,
      );

      return {
        success: true,
        data: task,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to assign task',
      );
    }
  }

  @Get('nurse/:nurseId')
  async getTasksByNurse(
    @Param('nurseId') nurseId: string,
    @Query('status') status?: string,
  ): Promise<any> {
    try {
      const tasks = await this.nurseTaskService.getTasksByNurse(
        nurseId,
        status as any,
      );

      return {
        success: true,
        data: tasks,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch tasks',
      );
    }
  }

  @Get('nurse/:nurseId/queue')
  async getPrioritizedTaskQueue(
    @Param('nurseId') nurseId: string,
  ): Promise<any> {
    try {
      const tasks = await this.nurseTaskService.getPrioritizedTaskQueue(
        nurseId,
      );

      return {
        success: true,
        data: tasks,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch task queue',
      );
    }
  }

  @Get('ward/:wardId/overdue')
  async getOverdueTasks(
    @Param('wardId') wardId: string,
  ): Promise<any> {
    try {
      const tasks = await this.nurseTaskService.getOverdueTasks(wardId);

      return {
        success: true,
        data: tasks,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch overdue tasks',
      );
    }
  }

  @Put(':taskId/complete')
  async completeTask(
    @Param('taskId') taskId: string,
    @Body() body: any,
    @Req() req: any,
  ): Promise<any> {
    try {
      const { completionNotes } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const task = await this.nurseTaskService.completeTask(
        taskId,
        completionNotes,
        userId,
      );

      return {
        success: true,
        data: task,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to complete task',
      );
    }
  }

  @Get(':taskId')
  async getTaskById(
    @Param('taskId') taskId: string,
  ): Promise<any> {
    try {
      const task = await this.nurseTaskService.getTaskById(taskId);

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      return {
        success: true,
        data: task,
      };
    } catch (error: any) {
      if (error?.status === 404) {
        throw error;
      }
      throw new BadRequestException(
        error?.message || 'Failed to fetch task',
      );
    }
  }

  @Get('ward/:wardId')
  async getTasksByWard(
    @Param('wardId') wardId: string,
    @Query('status') status?: string,
  ): Promise<any> {
    try {
      const tasks = await this.nurseTaskService.getTasksByWard(
        wardId,
        status as any,
      );

      return {
        success: true,
        data: tasks,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch ward tasks',
      );
    }
  }
}
