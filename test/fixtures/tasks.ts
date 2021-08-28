import { CreateTaskDto } from '../../src/tasks/dto/create-task.dto';
import { Task, TaskStatus } from '../../src/tasks/task.model';

export const createTaskDto: CreateTaskDto = {
  title: 'Task 1',
  description: 'Task Description',
};

export const task: Task = {
  id: '5814d1a0-417f-4f24-ab8c-9d5677d0b1bd',
  title: 'Task 1',
  description: 'Task Description',
  status: TaskStatus.OPEN,
};
