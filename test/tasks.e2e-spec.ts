import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TasksModule } from '../src/tasks/tasks.module';
import { TaskStatus } from '../src/tasks/task.model';
import { validate } from 'uuid';
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

  it('/tasks (GET)', () => {
    const tasksServiceSpy = jest
      .spyOn(tasksService, 'getAllTasks')
      .mockImplementation(() => [task]);

    return request(app.getHttpServer())
      .get('/tasks')
      .expect(HttpStatus.OK)
      .expect(() => {
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

  afterAll(async () => {
    await app.close();
  });
});
