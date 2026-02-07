// backend/src/controllers/NurseTaskController.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  Request,
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
    @Request() req: any,
  ): Promise<any> {
    try {
      const {
        wardId,
        taskType,
        assignedTo,
        patientId,
        priority,
        dueTime,
        description,
        metadata,
      } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const task = await this.nurseTaskService.createTask({
        wardId,
        taskType,
        assignedTo,
        patientId,
        priority,
        dueTime,
        description,
        metadata,
        createdBy: userId,
      });

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
    @Request() req: any,
  ): Promise<any> {
    try {
      const { status, notes } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const task = await this.nurseTaskService.updateTaskStatus(
        taskId,
        status,
        notes,
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
    @Request() req: any,
  ): Promise<any> {
    try {
      const { assignedTo, reassignmentReason } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const task = await this.nurseTaskService.assignTask(
        taskId,
        assignedTo,
        reassignmentReason,
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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<any> {
    try {
      const tasks = await this.nurseTaskService.getTasksByNurse(
        nurseId,
        status || undefined,
        parseInt(limit || '50', 10),
        parseInt(offset || '0', 10),
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

  @Get('ward/:wardId/queue')
  async getPrioritizedTaskQueue(
    @Param('wardId') wardId: string,
    @Query('nurseId') nurseId?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    try {
      const tasks = await this.nurseTaskService.getPrioritizedTaskQueue(
        wardId,
        nurseId || undefined,
        parseInt(limit || '100', 10),
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
    @Request() req: any,
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
    @Query('priority') priority?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<any> {
    try {
      const tasks = await this.nurseTaskService.getTasksByWard(
        wardId,
        status || undefined,
        priority || undefined,
        parseInt(limit || '100', 10),
        parseInt(offset || '0', 10),
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
        data: task,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getTasksByWard(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;
      const { status, priority, limit = 100, offset = 0 } = req.query;

      const tasks = await this.nurseTaskService.getTasksByWard(
        wardId,
        status as string,
        priority as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
