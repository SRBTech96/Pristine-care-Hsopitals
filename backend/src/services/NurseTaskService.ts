// backend/src/services/NurseTaskService.ts
import { Repository } from 'typeorm';
import { NurseTask, TaskType, TaskPriority, TaskStatus } from '../entities/NurseTask';

export interface CreateTaskDTO {
  wardId: string;
  patientId: string;
  assignedToNurseId: string;
  type: TaskType;
  priority: TaskPriority;
  title: string;
  description?: string;
  scheduledTime: Date;
  dueTime?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateTaskStatusDTO {
  taskId: string;
  status: TaskStatus;
  completionNotes?: string;
}

export interface AssignTaskDTO {
  taskId: string;
  assignedToNurseId: string;
}

export class NurseTaskService {
  constructor(private taskRepository: Repository<NurseTask>) {}

  private logAudit(message: string, userId: string): string {
    return JSON.stringify({
      timestamp: new Date(),
      userId,
      message,
    });
  }

  async createTask(dto: CreateTaskDTO, userId: string): Promise<NurseTask> {
    const task = new NurseTask();
    task.wardId = dto.wardId;
    task.patientId = dto.patientId;
    task.assignedToNurseId = dto.assignedToNurseId;
    task.type = dto.type;
    task.priority = dto.priority;
    task.title = dto.title;
    task.description = dto.description || undefined;
    task.scheduledTime = dto.scheduledTime;
    task.dueTime = dto.dueTime || undefined;
    task.metadata = dto.metadata || undefined;
    task.createdByNurseId = userId;
    task.status = TaskStatus.PENDING;
    task.auditLog = this.logAudit('Task created', userId);

    return this.taskRepository.save(task);
  }

  async updateTaskStatus(dto: UpdateTaskStatusDTO, userId: string): Promise<NurseTask> {
    const task = await this.taskRepository.findOne({
      where: { id: dto.taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const oldStatus = task.status;
    task.status = dto.status;
    task.completionNotes = dto.completionNotes || undefined;

    if (dto.status === TaskStatus.COMPLETED) {
      task.completedAt = new Date();
    }

    task.auditLog = (task.auditLog || '') + '\n' + this.logAudit(
      `Task status changed from ${oldStatus} to ${dto.status}`,
      userId
    );

    return this.taskRepository.save(task);
  }

  async assignTask(dto: AssignTaskDTO, userId: string): Promise<NurseTask> {
    const task = await this.taskRepository.findOne({
      where: { id: dto.taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const oldNurseId = task.assignedToNurseId;
    task.assignedToNurseId = dto.assignedToNurseId;
    task.auditLog = (task.auditLog || '') + '\n' + this.logAudit(
      `Task reassigned from ${oldNurseId} to ${dto.assignedToNurseId}`,
      userId
    );

    return this.taskRepository.save(task);
  }

  async getTasksByNurse(
    nurseId: string,
    status?: TaskStatus
  ): Promise<NurseTask[]> {
    const query = this.taskRepository.createQueryBuilder('task')
      .where('task.assignedToNurseId = :nurseId', { nurseId })
      .leftJoinAndSelect('task.patient', 'patient')
      .orderBy('task.priority', 'DESC')
      .addOrderBy('task.scheduledTime', 'ASC');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    return query.getMany();
  }

  async getTasksByWard(wardId: string, status?: TaskStatus): Promise<NurseTask[]> {
    const query = this.taskRepository.createQueryBuilder('task')
      .where('task.wardId = :wardId', { wardId })
      .leftJoinAndSelect('task.patient', 'patient')
      .leftJoinAndSelect('task.assignedToNurse', 'assignedNurse')
      .orderBy('task.priority', 'DESC')
      .addOrderBy('task.scheduledTime', 'ASC');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    return query.getMany();
  }

  async getOverdueTasks(wardId: string): Promise<NurseTask[]> {
    const now = new Date();
    return this.taskRepository.createQueryBuilder('task')
      .where('task.wardId = :wardId', { wardId })
      .andWhere('task.dueTime < :now', { now })
      .andWhere('task.status != :completed', { completed: TaskStatus.COMPLETED })
      .leftJoinAndSelect('task.patient', 'patient')
      .leftJoinAndSelect('task.assignedToNurse', 'assignedNurse')
      .orderBy('task.priority', 'DESC')
      .getMany();
  }

  async getPrioritizedTaskQueue(
    nurseId: string
  ): Promise<NurseTask[]> {
    return this.taskRepository.createQueryBuilder('task')
      .where('task.assignedToNurseId = :nurseId', { nurseId })
      .andWhere('task.status IN (:...statuses)', {
        statuses: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.OVERDUE],
      })
      .leftJoinAndSelect('task.patient', 'patient')
      .orderBy('task.priority', 'DESC')
      .addOrderBy('task.scheduledTime', 'ASC')
      .getMany();
  }

  async getTaskById(id: string): Promise<NurseTask | null> {
    return this.taskRepository.findOne({
      where: { id },
      relations: ['patient', 'assignedToNurse', 'createdByNurse'],
    });
  }

  async completeTask(taskId: string, notes: string, userId: string): Promise<NurseTask> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.completionNotes = notes;
    task.auditLog = (task.auditLog || '') + '\n' + this.logAudit('Task completed', userId);

    return this.taskRepository.save(task);
  }
}
