// backend/src/controllers/NurseTaskController.ts
import { Request, Response } from 'express';
import { NurseTaskService } from '../services/NurseTaskService';

export class NurseTaskController {
  constructor(private nurseTaskService: NurseTaskService) {}

  async createTask(req: Request, res: Response): Promise<void> {
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
      } = req.body;
      const userId = req.user.id;

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

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.id;

      const task = await this.nurseTaskService.updateTaskStatus(
        taskId,
        status,
        notes,
        userId
      );

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async assignTask(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { assignedTo, reassignmentReason } = req.body;
      const userId = req.user.id;

      const task = await this.nurseTaskService.assignTask(
        taskId,
        assignedTo,
        reassignmentReason,
        userId
      );

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getTasksByNurse(req: Request, res: Response): Promise<void> {
    try {
      const { nurseId } = req.params;
      const { status, limit = 50, offset = 0 } = req.query;

      const tasks = await this.nurseTaskService.getTasksByNurse(
        nurseId,
        status as string,
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

  async getPrioritizedTaskQueue(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;
      const { nurseId, limit = 100 } = req.query;

      const tasks = await this.nurseTaskService.getPrioritizedTaskQueue(
        wardId,
        nurseId as string,
        parseInt(limit as string)
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

  async getOverdueTasks(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;

      const tasks = await this.nurseTaskService.getOverdueTasks(wardId);

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

  async completeTask(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { completionNotes } = req.body;
      const userId = req.user.id;

      const task = await this.nurseTaskService.completeTask(
        taskId,
        completionNotes,
        userId
      );

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;

      const task = await this.nurseTaskService.getTaskById(taskId);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
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
