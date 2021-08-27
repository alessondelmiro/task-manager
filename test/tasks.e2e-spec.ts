import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TasksModule } from '../src/tasks/tasks.module';
import { TaskStatus } from '../src/tasks/task.model';
import { validate } from 'uuid';
import { createTaskDto } from './fixtures/tasks';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/tasks (GET)', () => {
    return request(app.getHttpServer()).get('/tasks').expect(HttpStatus.OK);
  });

  it('/tasks (POST)', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('Accept', 'application/json')
      .send(createTaskDto)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        const { id, title, description, status } = body;
        const { title: expectedTitle, description: expectedDescription } =
          createTaskDto;
        expect(validate(id)).toBeTruthy();
        expect(title).toEqual(expectedTitle);
        expect(description).toEqual(expectedDescription);
        expect(status).toEqual(TaskStatus.OPEN);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
