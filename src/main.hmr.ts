import { start } from './boot';

declare const module: any;

async function bootstrap() {
  const app = await start();

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();