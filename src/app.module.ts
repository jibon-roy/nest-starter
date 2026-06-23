import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadsModule } from './uploads/uploads.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { CaslModule } from './casl/casl.module';
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { LoggerModule } from 'nestjs-pino';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import pino from 'pino';
import * as path from 'path';
import { mkdirSync } from 'fs';
import { LogsModule } from './logs/logs.module';

const logsDir = path.join(process.cwd(), 'logs');
mkdirSync(logsDir, { recursive: true });

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      typesOutputPath: path.join(__dirname, '../src/common/generated/i18n.generated.ts'),
      resolvers: [AcceptLanguageResolver],
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        stream: pino.multistream([
          { stream: process.stdout },
          { level: 'debug', stream: pino.destination(path.join(logsDir, 'app.log')) },
          { level: 'error', stream: pino.destination(path.join(logsDir, 'error.log')) },
        ]),
      },
    }),
    ConfigModule.forRoot(),
    AuthModule,
    PrismaModule,
    CommonModule,
    UploadsModule,
    CaslModule,
    UsersModule,
    PermissionsModule,
    LogsModule,
  ],
})
export class AppModule {}
