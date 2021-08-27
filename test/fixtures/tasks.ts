import { CreateTaskDto } from '../../src/tasks/dto/create-task.dto';
import { Task, TaskStatus } from '../../src/tasks/task.model';

export const createTaskDto: CreateTaskDto = {
  title: 'Task 1',
  description: 'Task Description',
};

export const task: Task = {
  id: '',
  title: 'Task 1',
  description: 'Task Description',
  status: TaskStatus.OPEN,
};
