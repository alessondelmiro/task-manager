import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../../src/tasks/tasks.service';
import { Task, TaskStatus } from './task.model';
import { validate } from 'uuid';
import { createTaskDto } from '../../test/fixtures/tasks';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all tasks', () => {
    expect(service.getAllTasks()).toEqual([]);
  });

  describe('createTask()', () => {
    let createdTask: Task;
    let allTasks: Task[];

    beforeAll(() => {
      createdTask = service.createTask(createTaskDto);
      allTasks = service.getAllTasks();
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
      expect(allTasks).toHaveLength(1);
      expect(allTasks).toContain(createdTask);
    });
  });

  describe('getTaskById()', () => {
    it('should find a task by id', () => {
      const createdTask: Task = service.createTask(createTaskDto);
      expect(service.getTaskById(createdTask.id)).toEqual(createdTask);
    });
  });
});
