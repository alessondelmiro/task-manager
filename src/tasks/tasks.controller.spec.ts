import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { fakeTask } from '../../test/factories/task.factory';
import { Task } from './task.entity';
import { TasksController } from './tasks.controller';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let repository: TasksRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksRepository,
        {
          provide: getRepositoryToken(Task),
          useClass: TasksRepository,
        },
        TasksService,
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    repository = module.get<TasksRepository>(
      getRepositoryToken(TasksRepository),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTaskById()', () => {
    it('should find a task by ID', async () => {
      const findOneOrFailSpy = jest
        .spyOn(repository, 'findOneOrFail')
        .mockResolvedValueOnce(fakeTask);
      expect(await controller.getTaskById(fakeTask.id)).toEqual(fakeTask);
      expect(findOneOrFailSpy).toBeCalledWith(fakeTask.id);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
