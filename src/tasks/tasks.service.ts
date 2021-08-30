import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { TASK_ERROR_MESSAGES } from './utils/constants';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: string): Task {
    return this.findTaskByIdOrThrow(id);
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;
    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);
    return task;
  }

  deleteTaskById(id: string): void {
    this.tasks = this.tasks.filter(
      (task) => task !== this.findTaskByIdOrThrow(id),
    );
  }

  updateTaskStatus(id: string, status: TaskStatus): Task {
    const task: Task = this.findTaskByIdOrThrow(id);

    if (!status || !Object.values(TaskStatus).includes(status)) {
      throw new BadRequestException(TASK_ERROR_MESSAGES.INVALID_STATUS);
    }

    task.status = status;
    return task;
  }

  private findTaskByIdOrThrow(id: string) {
    const task: Task = this.tasks.find((task) => task.id === id);

    if (!task) {
      throw new NotFoundException(TASK_ERROR_MESSAGES.NOT_FOUND);
    }
    return task;
  }
}
