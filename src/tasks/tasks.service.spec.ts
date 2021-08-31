import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../../src/tasks/tasks.service';
import { Task, TaskStatus } from './task.model';
import { validate } from 'uuid';
import { createTaskDto, filterTaskCreateDto } from '../../test/fixtures/tasks';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TASK_ERROR_MESSAGES } from './utils/constants';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

describe('TasksService', () => {
  let service: TasksService;
  let createdTask: Task;
  let taskToFilter: Task;
  let allTasks: Task[];
  let wrongId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
    createdTask = service.createTask(createTaskDto);
    taskToFilter = service.createTask(filterTaskCreateDto);
    allTasks = service.getTasks();
    wrongId = 'wrong-id';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTasks()', () => {
    it('should return all tasks', () => {
      expect(service.getTasks()).toEqual(allTasks);
    });

    it('should return a filtered task by name', () => {
      const filterByName: GetTasksFilterDto = {
        search: 'Filter by Name',
      };
      expect(service.getTasks(filterByName)).toEqual([taskToFilter]);
    });

    it('should return a filtered task by description', () => {
      const filterByDescription: GetTasksFilterDto = {
        search: 'Filter By description',
      };
      expect(service.getTasks(filterByDescription)).toEqual([taskToFilter]);
    });

    it('should return a filtered task by status', () => {
      const updatedTaskToFilter: Task = service.updateTaskStatus(
        taskToFilter.id,
        TaskStatus.DONE,
      );
      const filterByStatus: GetTasksFilterDto = {
        status: TaskStatus.DONE,
      };
      expect(service.getTasks(filterByStatus)).toEqual([updatedTaskToFilter]);
    });
  });

  describe('getTaskById()', () => {
    it('should find a task by id', () => {
      expect(service.getTaskById(createdTask.id)).toEqual(createdTask);
    });

    it('should throw an error if id is not found', () => {
      expect(() => service.getTaskById(wrongId)).toThrow(
        new NotFoundException(TASK_ERROR_MESSAGES.NOT_FOUND),
      );
    });
  });

  describe('createTask()', () => {
    it('should create a task', () => {
      const { title: expectedTitle, description: expectedDescription } =
        createTaskDto;
      expect(createdTask).toBeDefined();
      expect(validate(createdTask.id)).toBe(true);
      expect(createdTask.title).toEqual(expectedTitle);
      expect(createdTask.description).toEqual(expectedDescription);
      expect(createdTask.status).toEqual(TaskStatus.OPEN);
    });

    it('should return all tasks with the newly created task', () => {
      expect(allTasks).toContain(createdTask);
    });
  });

  describe('deleteTaskById()', () => {
    it('should delete a task by id', () => {
      service.deleteTaskById(createdTask.id);
      expect(service.getTasks().includes(createdTask)).toBe(false);
    });

    it('should throw an error if id is not found', () => {
      expect(() => service.deleteTaskById(wrongId)).toThrow(
        new NotFoundException(TASK_ERROR_MESSAGES.NOT_FOUND),
      );
    });
  });

  describe('updateTaskStatus()', () => {
    const newStatus = TaskStatus.IN_PROGRESS;
    it('should update the task to the new status', () => {
      const updatedTask = service.updateTaskStatus(createdTask.id, newStatus);
      expect(updatedTask.status).toEqual(newStatus);
    });

    it('should throw an error if id is not found', () => {
      expect(() => service.updateTaskStatus(wrongId, newStatus)).toThrow(
        new NotFoundException(TASK_ERROR_MESSAGES.NOT_FOUND),
      );
    });

    it('should throw an error if status is not sent', () => {
      expect(() => service.updateTaskStatus(createdTask.id, null)).toThrow(
        new BadRequestException(TASK_ERROR_MESSAGES.INVALID_STATUS),
      );
    });

    it('should throw an error if status is not sent', () => {
      const invalidStatus = 'invalid';
      expect(() =>
        service.updateTaskStatus(createdTask.id, invalidStatus as TaskStatus),
      ).toThrow(new BadRequestException(TASK_ERROR_MESSAGES.INVALID_STATUS));
    });
  });
});
