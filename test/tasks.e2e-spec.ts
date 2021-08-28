import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpStatus,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import * as request from 'supertest';
import { TasksModule } from '../src/tasks/tasks.module';
import { createTaskDto, task } from './fixtures/tasks';
import { TasksService } from '../src/tasks/tasks.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let tasksService: TasksService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    tasksService = moduleFixture.get<TasksService>(TasksService);
    await app.init();
  });

  describe('when the request is successful', () => {
    it('/tasks (GET)', () => {
      const tasksServiceSpy = jest
        .spyOn(tasksService, 'getAllTasks')
        .mockImplementation(() => [task]);

      return request(app.getHttpServer())
        .get('/tasks')
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual([task]);
          expect(tasksServiceSpy).toBeCalledTimes(1);
        });
    });

    it('/tasks (POST)', () => {
      const tasksServiceSpy = jest
        .spyOn(tasksService, 'createTask')
        .mockImplementation(() => task);

      return request(app.getHttpServer())
        .post('/tasks')
        .set('Accept', 'application/json')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body).toEqual(task);
          expect(tasksServiceSpy).toBeCalledWith(createTaskDto);
        });
    });

    it('/task/:id (GET)', () => {
      const tasksServiceSpy = jest
        .spyOn(tasksService, 'getTaskById')
        .mockImplementation(() => task);

      return request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual(task);
          expect(tasksServiceSpy).toBeCalledWith(task.id);
        });
    });

    it('/task/:id (DELETE)', () => {
      const tasksServiceSpy = jest
        .spyOn(tasksService, 'deleteTaskById')
        .mockImplementation(() => true);

      return request(app.getHttpServer())
        .delete(`/tasks/${task.id}`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.NO_CONTENT)
        .expect(() => {
          expect(tasksServiceSpy).toBeCalledWith(task.id);
        });
    });
  });

  describe('when the request fails', () => {
    const errorMessage = 'task not found';
    it('/task/:id (GET)', () => {
      const tasksServiceSpy = jest
        .spyOn(tasksService, 'getTaskById')
        .mockImplementation(() => {
          throw new NotFoundException(errorMessage);
        });

      return request(app.getHttpServer())
        .get(`/tasks/wrongId`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.NOT_FOUND)
        .expect(({ body }) => {
          expect(body.message).toEqual(errorMessage);
          expect(tasksServiceSpy).toBeCalledTimes(1);
        });
    });

    it('/task/:id (DELETE)', () => {
      const tasksServiceSpy = jest
        .spyOn(tasksService, 'deleteTaskById')
        .mockImplementation(() => {
          throw new NotFoundException(errorMessage);
        });

      return request(app.getHttpServer())
        .delete(`/tasks/${task.id}`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.NOT_FOUND)
        .expect(({ body }) => {
          expect(body.message).toEqual(errorMessage);
          expect(tasksServiceSpy).toBeCalledWith(task.id);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
