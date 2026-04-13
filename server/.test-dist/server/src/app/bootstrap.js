import { AppBootstrapError } from './errors.js';
import { createAppContainer, disposeAppContainer, } from './container.js';
import { createHttpServer } from '../http/index.js';
import { StartupBlockedError } from '../processes/startup/index.js';
export async function bootstrapApplication(options = {}) {
    let app;
    let container;
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
    }
    catch (error) {
        if (app) {
            await app.close().catch(() => undefined);
        }
        if (container) {
            disposeAppContainer(container);
        }
        throw new AppBootstrapError(error);
    }
}
export async function shutdownApplication(result) {
    await result.app.close();
    disposeAppContainer(result.container);
}
//# sourceMappingURL=bootstrap.js.map