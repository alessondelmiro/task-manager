import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TasksModule } from '../src/tasks/tasks.module';
import { TasksService } from '../src/tasks/tasks.service';
import { TasksRepository } from '../src/tasks/tasks.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../src/tasks/task.entity';
import { fakeTask } from './factories/task.factory';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TasksModule],
      providers: [TasksRepository],
    })
      .overrideProvider(getRepositoryToken(Task))
      .useClass(TasksRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  describe('when the request is successful', () => {
    it('GET /tasks/:id', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${fakeTask.id}`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual(fakeTask);
        });
    });
  });

  describe('when the request fails', () => {
    // it('GET /tasks/:id', () => {
    //   return request(app.getHttpServer())
    //     .get(`/tasks/${wrongId}`)
    //     .set('Accept', 'application/json')
    //     .expect(HttpStatus.NOT_FOUND)
    //     .expect(({ body }) => {
    //       expect(body.message).toEqual(TASK_ERROR_MESSAGES.NOT_FOUND);
    //     });
    // });
  });

  afterAll(async () => {
    await app.close();
  });
});
