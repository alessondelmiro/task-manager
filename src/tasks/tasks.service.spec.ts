import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../../src/tasks/tasks.service';
import { TasksRepository } from './tasks.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { fakeTask } from '../../test/factories/task.factory';

describe('TasksService', () => {
  let service: TasksService;
  let repository: TasksRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksRepository,
        {
          provide: getRepositoryToken(Task),
          useClass: TasksRepository,
        },
        TasksService,
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<TasksRepository>(
      getRepositoryToken(TasksRepository),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTaskById()', () => {
    it('should find a task by ID', async () => {
      const findOneOrFailSpy = jest
        .spyOn(repository, 'findOneOrFail')
        .mockResolvedValueOnce(fakeTask);
      expect(await service.getTaskById(fakeTask.id)).toEqual(fakeTask);
      expect(findOneOrFailSpy).toBeCalledWith(fakeTask.id);
    });
  });
});
