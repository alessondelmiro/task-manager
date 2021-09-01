import { Test, TestingModule } from '@nestjs/testing';
import { Task, TaskStatus } from './task.model';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { validate } from 'uuid';
import { createTaskDto, filterTaskCreateDto } from '../../test/fixtures/tasks';
import { NotFoundException } from '@nestjs/common';
import { TASK_ERROR_MESSAGES } from './utils/constants';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

describe('TasksController', () => {
  let controller: TasksController;
  let createdTask: Task;
  let taskToFilter: Task;
  let allTasks: Task[];
  let wrongId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    createdTask = controller.createTask(createTaskDto);
    taskToFilter = controller.createTask(filterTaskCreateDto);
    allTasks = controller.getTasks();
    wrongId = 'wrong-id';
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllTasks()', () => {
    it('should return all tasks', () => {
      expect(controller.getTasks()).toEqual(allTasks);
    });

    it('should return a filtered task by title', () => {
      const filterByName: GetTasksFilterDto = {
        search: 'Filter by Title',
      };
      expect(controller.getTasks(filterByName)).toEqual([taskToFilter]);
    });

    it('should return a filtered task by description', () => {
      const filterByDescription: GetTasksFilterDto = {
        search: 'Filter By description',
      };
      expect(controller.getTasks(filterByDescription)).toEqual([taskToFilter]);
    });

    it('should return a filtered task by status', () => {
      const updateTaskStatusDto: UpdateTaskStatusDto = {
        status: TaskStatus.DONE,
      };
      const updatedTaskToFilter: Task = controller.updateTaskStatus(
        taskToFilter.id,
        updateTaskStatusDto,
      );
      const filterByStatus: GetTasksFilterDto = {
        status: TaskStatus.DONE,
      };
      expect(controller.getTasks(filterByStatus)).toEqual([
        updatedTaskToFilter,
      ]);
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
      expect(controller.getTasks().includes(createdTask)).toBe(false);
    });
    it('should throw an error if id is not found', () => {
      expect(() => controller.deleteTaskById(wrongId)).toThrow(
        new NotFoundException(TASK_ERROR_MESSAGES.NOT_FOUND),
      );
    });
  });

  describe('updateTaskStatus()', () => {
    const updateTaskStatusDto: UpdateTaskStatusDto = {
      status: TaskStatus.DONE,
    };
    it('should update the task to the new status', () => {
      const updatedTask = controller.updateTaskStatus(
        createdTask.id,
        updateTaskStatusDto,
      );
      expect(updatedTask.status).toEqual(TaskStatus.DONE);
    });

    it('should throw an error if id is not found', () => {
      expect(() =>
        controller.updateTaskStatus(wrongId, updateTaskStatusDto),
      ).toThrow(new NotFoundException(TASK_ERROR_MESSAGES.NOT_FOUND));
    });
  });
});
