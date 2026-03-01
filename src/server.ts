import { createApp } from "./app";
import { Database } from "./config/database";
import { env } from "./config/env";
import { UserMigration } from "./modules/user/user.migration";

async function bootstrap() {
  await Database.connect();
  await UserMigration.up(); // auto create table

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

bootstrap();