import Fastify, { type FastifyInstance } from 'fastify';

import { AppBootstrapError } from './errors.js';
import {
  type AppContainer,
  type CreateAppContainerOptions,
  createAppContainer,
  disposeAppContainer,
} from './container.js';
import { createHttpServer } from '../http/index.js';
import { StartupBlockedError } from '../processes/startup/index.js';

export interface BootstrapApplicationOptions extends CreateAppContainerOptions {
  port?: number;
}

export interface BootstrapApplicationResult {
  address: string;
  app: FastifyInstance;
  container: AppContainer;
}

export async function bootstrapApplication(
  options: BootstrapApplicationOptions = {},
): Promise<BootstrapApplicationResult> {
  let app: FastifyInstance | undefined;
  let container: AppContainer | undefined;

  try {
    container = await createAppContainer(options);
    const startupResult = await container.processes.startup.runSelfCheck();

    if (startupResult.status !== 'ready') {
      throw new StartupBlockedError('启动自检未通过，服务不能继续监听。');
    }

    app = await createHttpServer(container);
    const port = options.port ?? container.config.server.port;
    const address = await app.listen({
      host: '0.0.0.0',
      port,
    });

    return {
      address,
      app,
      container,
    };
  } catch (error) {
    if (app) {
      await app.close().catch(() => undefined);
    }

    if (container) {
      disposeAppContainer(container);
    }

    throw new AppBootstrapError(error);
  }
}

export async function shutdownApplication(result: BootstrapApplicationResult): Promise<void> {
  await result.app.close();
  disposeAppContainer(result.container);
}
