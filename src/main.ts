import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'public')); // 템플릿 파일이 위치한 디렉토리 설정
  app.setViewEngine('hbs'); // Handlebars 엔진 사용 설정
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  await app.listen(3000);
}
bootstrap();