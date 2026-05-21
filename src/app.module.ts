import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ✅ add this

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JobsModule } from './jobs/jobs.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { ApplicationsModule } from './applications/applications.module';
import { CompanyModule } from './company/company.module';
import { SignalsModule } from './signals/signals.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { BullModule } from '@nestjs/bullmq';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    AuthModule,
    PrismaModule,
    JobsModule,
    IngestionModule,
    ApplicationsModule,
    CompanyModule,
    SignalsModule,
    OpportunitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
