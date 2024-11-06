import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './databases/prisma.service';

async function bootstrap() {
  process.env.TZ = 'Europe/Amsterdam';
  console.log(process.env.TZ);
  const app = await NestFactory.create(AppModule, { cors: true });
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  await app.listen(3000);
}
bootstrap();
