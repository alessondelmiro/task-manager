import { Test, TestingModule } from '@nestjs/testing';
import { Task, TaskStatus } from './task.model';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { validate } from 'uuid';
import { createTaskDto } from '../../test/fixtures/tasks';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TASK_ERROR_MESSAGES } from './utils/constants';

describe('TasksController', () => {
  let controller: TasksController;
  let createdTask: Task;
  let allTasks: Task[];
  let wrongId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    createdTask = controller.createTask(createTaskDto);
    allTasks = controller.getAllTasks();
    wrongId = 'wrong-id';
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllTasks()', () => {
    it('should return all tasks', () => {
      expect(controller.getAllTasks()).toEqual(allTasks);
    });
  });

  describe('getTaskById()', () => {
    it('it should return a task by id', () => {
      expect(controller.getTaskById(createdTask.id)).toEqual(createdTask);
    });

    it('should throw an error if id is not found', () => {
      expect(() => controller.getTaskById(wrongId)).toThrow(
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
      controller.deleteTaskById(createdTask.id);
      expect(controller.getAllTasks().includes(createdTask)).toBe(false);
    });
    it('should throw an error if id is not found', () => {
      expect(() => controller.deleteTaskById(wrongId)).toThrow(
        new NotFoundException(TASK_ERROR_MESSAGES.NOT_FOUND),
      );
    });
  });

  describe('updateTaskStatus()', () => {
    const newStatus = TaskStatus.IN_PROGRESS;
    it('should update the task to the new status', () => {
      const updatedTask = controller.updateTaskStatus(
        createdTask.id,
        newStatus,
      );
      expect(updatedTask.status).toEqual(newStatus);
    });

    it('should throw an error if id is not found', () => {
      expect(() => controller.updateTaskStatus(wrongId, newStatus)).toThrow(
        new NotFoundException(TASK_ERROR_MESSAGES.NOT_FOUND),
      );
    });

    it('should throw an error if a invalid status is sent', () => {
      expect(() => controller.updateTaskStatus(createdTask.id, null)).toThrow(
        new BadRequestException(TASK_ERROR_MESSAGES.INVALID_STATUS),
      );
    });

    it('should throw an error if status is not sent', () => {
      const invalidStatus = 'invalid';
      expect(() =>
        controller.updateTaskStatus(
          createdTask.id,
          invalidStatus as TaskStatus,
        ),
      ).toThrow(new BadRequestException(TASK_ERROR_MESSAGES.INVALID_STATUS));
    });
  });
});
