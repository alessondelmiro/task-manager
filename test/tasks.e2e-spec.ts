import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TasksModule } from '../src/tasks/tasks.module';
import { createTaskDto, filterTaskCreateDto } from './fixtures/tasks';
import { TasksService } from '../src/tasks/tasks.service';
import { Task, TaskStatus } from '../src/tasks/task.model';
import { TASK_ERROR_MESSAGES } from '../src/tasks/utils/constants';
import { validate } from 'uuid';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let tasksService: TasksService;
  let createdTask: Task;
  let taskToFilter: Task;
  let allTasks: Task[];
  let newStatus: TaskStatus;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    tasksService = moduleFixture.get<TasksService>(TasksService);
    createdTask = tasksService.createTask(createTaskDto);
    taskToFilter = tasksService.createTask(filterTaskCreateDto);
    allTasks = tasksService.getTasks();
    newStatus = TaskStatus.IN_PROGRESS;
    await app.init();
  });

  describe('when the request is successful', () => {
    it('GET /tasks [Without filter]', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual(allTasks);
        });
    });

    it('GET /tasks [Filter by title]', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .query({ search: 'Filter by Title' })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual([taskToFilter]);
        });
    });

    it('GET /tasks [Filter by description]', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .query({ search: 'Filter By description' })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual([taskToFilter]);
        });
    });

    it('GET /tasks [Filter by status]', () => {
      const updatedTaskToFilter: Task = tasksService.updateTaskStatus(
        taskToFilter.id,
        TaskStatus.DONE,
      );
      return request(app.getHttpServer())
        .get('/tasks')
        .query({ status: TaskStatus.DONE })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual([updatedTaskToFilter]);
        });
    });

    it('POST /tasks', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Accept', 'application/json')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(validate(body.id)).toBe(true);
          expect(body.title).toEqual(createTaskDto.title);
          expect(body.description).toEqual(createTaskDto.description);
          expect(body.status).toEqual(TaskStatus.OPEN);
        });
    });

    it('GET /task/:id', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${createdTask.id}`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual(createdTask);
        });
    });

    it('DELETE /task/:id', () => {
      const taskToDelete: Task = tasksService.createTask(createTaskDto);

      return request(app.getHttpServer())
        .delete(`/tasks/${taskToDelete.id}`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.NO_CONTENT);
    });

    it('PATCH /tasks/:id/status', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${createdTask.id}/status`)
        .set('Accept', 'application/json')
        .send({ status: newStatus })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.status).toEqual(newStatus);
        });
    });
  });

  describe('when the request fails', () => {
    const wrongId = 'wrong-id';

    it('GET /task/:id', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${wrongId}`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.NOT_FOUND)
        .expect(({ body }) => {
          expect(body.message).toEqual(TASK_ERROR_MESSAGES.NOT_FOUND);
        });
    });

    it('DELETE /task/:id', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${wrongId}`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.NOT_FOUND)
        .expect(({ body }) => {
          expect(body.message).toEqual(TASK_ERROR_MESSAGES.NOT_FOUND);
        });
    });

    it('PATCH /task/:id/status [Invalid id]', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${wrongId}/status`)
        .set('Accept', 'application/json')
        .send({ status: newStatus })
        .expect(HttpStatus.NOT_FOUND)
        .expect(({ body }) => {
          expect(body.message).toEqual(TASK_ERROR_MESSAGES.NOT_FOUND);
        });
    });

    it('PATCH /task/:id/status [Invalid status]', () => {
      const invalidStatus = 'INVALID_STATUS';

      return request(app.getHttpServer())
        .patch(`/tasks/${createdTask.id}/status`)
        .set('Accept', 'application/json')
        .send({ status: invalidStatus })
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toEqual(TASK_ERROR_MESSAGES.INVALID_STATUS);
        });
    });

    it('PATCH /task/:id/status [No status on body] ', () => {
      return (
        request(app.getHttpServer())
          .patch(`/tasks/${createdTask.id}/status`)
          .set('Accept', 'application/json')
          // .send({ status: invalidStatus })
          .expect(HttpStatus.BAD_REQUEST)
          .expect(({ body }) => {
            expect(body.message).toEqual(TASK_ERROR_MESSAGES.INVALID_STATUS);
          })
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
