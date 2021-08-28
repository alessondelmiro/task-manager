import { Test, TestingModule } from '@nestjs/testing';
import { Task, TaskStatus } from './task.model';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { validate } from 'uuid';
import { createTaskDto } from '../../test/fixtures/tasks';

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all tasks', () => {
    expect(controller.getAllTasks()).toEqual([]);
  });

  it('it should return a task by id', () => {
    const createdTask: Task = controller.createTask(createTaskDto);
    expect(controller.getTaskById(createdTask.id)).toEqual(createdTask);
  });

  describe('createTask()', () => {
    let createdTask: Task;
    let allTasks: Task[];

    beforeAll(() => {
      createdTask = controller.createTask(createTaskDto);
      allTasks = controller.getAllTasks();
    });

    it('should create a task', () => {
      const { title: expectedTitle, description: expectedDescription } =
        createTaskDto;
      expect(createdTask).toBeDefined();
      expect(validate(createdTask.id)).toBeTruthy();
      expect(createdTask.title).toEqual(expectedTitle);
      expect(createdTask.description).toEqual(expectedDescription);
      expect(createdTask.status).toEqual(TaskStatus.OPEN);
    });

    it('should return all tasks with the newly created task', () => {
      expect(allTasks).toContain(createdTask);
    });
  });
});
