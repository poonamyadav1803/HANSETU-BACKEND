import { createApp } from "./app";
import { env } from "./config/env";

async function bootstrap() {
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

bootstrap();
