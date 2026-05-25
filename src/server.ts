import { createServer } from "http";
import { createApp } from "./app";
import { ensureMasterDatabaseExists } from "./core/database/ensureDatabase";
import { envConfig } from "./core/config/env.config";
import { logger } from "./core/utils/logger.util";

const bootstrap = async (): Promise<void> => {
  await ensureMasterDatabaseExists();
  const app = createApp();
  const server = createServer(app);
  const { port } = envConfig;

  server.listen(port, () => {
    logger.info(
      `API running at http://localhost:${port}${envConfig.apiPrefix}`,
    );
    logger.info(`Health check at http://localhost:${port}/health`);
  });
};

bootstrap().catch((error: Error & { code?: string }) => {
  const hint =
    error.code === "28000"
      ? "PostgreSQL auth failed. For Render: set DB_AUTO_CREATE=false, DB_SSL=true, and use External DB credentials."
      : error.code === "ECONNREFUSED"
        ? "Cannot reach PostgreSQL. Start Docker: npm run db:up"
        : undefined;
  logger.error("Failed to start server", {
    message: error.message,
    code: error.code,
    hint,
  });
  process.exit(1);
});
