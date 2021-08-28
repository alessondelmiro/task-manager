import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../../src/tasks/tasks.service';
import { Task, TaskStatus } from './task.model';
import { validate } from 'uuid';
import { createTaskDto } from '../../test/fixtures/tasks';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let createdTask: Task;
  let allTasks: Task[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
    createdTask = service.createTask(createTaskDto);
    allTasks = service.getAllTasks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTasks()', () => {
    it('should return all tasks', () => {
      expect(service.getAllTasks()).toEqual([createdTask]);
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
      expect(allTasks).toHaveLength(1);
      expect(allTasks).toContain(createdTask);
    });
  });

  describe('getTaskById()', () => {
    it('should find a task by id', () => {
      expect(service.getTaskById(createdTask.id)).toEqual(createdTask);
    });

    it('should throw an error if id is not found', () => {
      const wrongId = '1234';
      expect(() => service.getTaskById(wrongId)).toThrow(
        new NotFoundException('task not found'),
      );
    });
  });

  describe('deleteTaskById()', () => {
    it('should delete a task by id', () => {
      service.deleteTaskById(createdTask.id);
      expect(service.getAllTasks().includes(createdTask)).toBe(false);
    });

    it('should throw an error if id is not found', () => {
      const wrongId = '1234';
      expect(() => service.deleteTaskById(wrongId)).toThrow(
        new NotFoundException('task not found'),
      );
    });
  });
});
