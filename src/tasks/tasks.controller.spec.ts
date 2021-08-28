import { Test, TestingModule } from '@nestjs/testing';
import { Task, TaskStatus } from './task.model';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { validate } from 'uuid';
import { createTaskDto } from '../../test/fixtures/tasks';
import { NotFoundException } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;
  let createdTask: Task;
  let allTasks: Task[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    createdTask = controller.createTask(createTaskDto);
    allTasks = controller.getAllTasks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllTasks()', () => {
    it('should return all tasks', () => {
      expect(controller.getAllTasks()).toEqual([createdTask]);
    });
  });

  describe('getTaskById()', () => {
    it('it should return a task by id', () => {
      expect(controller.getTaskById(createdTask.id)).toEqual(createdTask);
    });

    it('should throw an error if id is not found', () => {
      const wrongId = '1234';
      expect(() => controller.getTaskById(wrongId)).toThrow(
        new NotFoundException('task not found'),
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
      controller.deleteTaskById(createdTask.id);
      expect(controller.getAllTasks().includes(createdTask)).toBe(false);
    });
    it('should throw an error if id is not found', () => {
      const wrongId = '1234';
      expect(() => controller.deleteTaskById(wrongId)).toThrow(
        new NotFoundException('task not found'),
      );
    });
  });
});
