import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import session from 'express-session';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'public')); // 템플릿 파일이 위치한 디렉토리 설정
  app.setViewEngine('hbs'); // Handlebars 엔진 사용 설정
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(cookieParser());
  app.use(
    session({
      secret: 'your-secret-key', // 세션 암호화를 위한 비밀 키
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // HTTPS를 사용하는 경우 true로 설정
    }),
  );

  await app.listen(3000);
}
bootstrap();

