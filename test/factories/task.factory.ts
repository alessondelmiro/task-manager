import * as faker from 'faker';
import { Task } from '../../src/tasks/task.entity';
import { TaskStatus } from '../../src/tasks/task-status.enum';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';

export const fakeTask: Task = {
  id: faker.datatype.uuid(),
  title: faker.lorem.word(),
  description: faker.lorem.words(),
  status: TaskStatus.OPEN,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const createTaskDto: CreateTaskDto = {
  title: 'Task 1',
  description: 'Task Description',
};

export const filterTaskCreateDto: CreateTaskDto = {
  title: 'a Filter by title a',
  description: 'a Filter by description a',
};
