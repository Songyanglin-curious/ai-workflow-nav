import { createApp } from './app/createApp.js';
import { loadConfig } from './config/loadConfig.js';

async function main() {
  const config = loadConfig();
  const app = await createApp({ config });

  await app.listen({
    host: config.server.host,
    port: config.server.port,
  });

  app.log.info(`server listening on http://${config.server.host}:${config.server.port}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
