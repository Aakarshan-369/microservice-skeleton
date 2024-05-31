import { Test } from '@nestjs/testing';

import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { CryptoLibModule, ICryptoAdapter } from '@/libs/crypto';
import { IEventAdapter } from '@/libs/event';
import { IUserCreateAdapter } from '@/modules/user/adapter';
import { ApiConflictException } from '@/utils/exception';
import { expectZodError, getMockTracing, getMockUUID } from '@/utils/tests';

import { UserEntity, UserRole } from '../../entity/user';
import { IUserRepository } from '../../repository/user';
import { UserCreateUsecase } from '../user-create';

const userMock = {
  id: getMockUUID(),
  email: 'admin@admin.com',
  password: '**********',
  roles: [UserRole.USER]
} as UserEntity;

describe(UserCreateUsecase.name, () => {
  let usecase: IUserCreateAdapter;
  let repository: IUserRepository;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [LoggerModule, CryptoLibModule],
      providers: [
        {
          provide: IUserRepository,
          useValue: {}
        },
        {
          provide: IEventAdapter,
          useValue: {
            emit: jest.fn()
          }
        },
        {
          provide: IUserCreateAdapter,
          useFactory: (
            userRepository: IUserRepository,
            logger: ILoggerAdapter,
            crypto: ICryptoAdapter,
            event: IEventAdapter
          ) => {
            return new UserCreateUsecase(userRepository, logger, crypto, event);
          },
          inject: [IUserRepository, ILoggerAdapter, ICryptoAdapter, IEventAdapter]
        }
      ]
    }).compile();

    usecase = app.get(IUserCreateAdapter);
    repository = app.get(IUserRepository);
  });

  test('when the user is created successfully, should expect an user that has been created', async () => {
    repository.findOne = jest.fn().mockResolvedValue(null);
    repository.create = jest.fn().mockResolvedValue(userMock);
    repository.startSession = jest.fn().mockResolvedValue({
      commitTransaction: jest.fn()
    });

    await expect(usecase.execute(userMock, getMockTracing())).resolves.toEqual(userMock);
  });

  test('when transaction throw an error, should expect an error', async () => {
    repository.findOne = jest.fn().mockResolvedValue(null);
    repository.create = jest.fn().mockResolvedValue(userMock);
    repository.startSession = jest.fn().mockRejectedValue(new Error('startSessionError'));

    await expect(usecase.execute(userMock, getMockTracing())).rejects.toThrow('startSessionError');
  });

  test('when user already exists, should expect an error', async () => {
    repository.findOne = jest.fn().mockResolvedValue(userMock);
    await expect(usecase.execute(userMock, getMockTracing())).rejects.toThrow(ApiConflictException);
  });

  test('when no input is specified, should expect an error', async () => {
    await expectZodError(
      () => usecase.execute({}, getMockTracing()),
      (issues) => {
        expect(issues).toEqual([
          { message: 'Required', path: UserEntity.nameOf('email') },
          { message: 'Required', path: UserEntity.nameOf('password') },
          { message: 'Required', path: UserEntity.nameOf('roles') }
        ]);
      }
    );
  });
});
