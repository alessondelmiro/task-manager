import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TasksModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'laalesson.delmiro',
      database: 'task_management',
      autoLoadEntities: true,
      synchronize: true, // always keep schema synched
    }),
  ],
})
export class AppModule {}
