import Fastify from 'fastify';
import { mapHttpError } from './error-mapper.js';
import { registerHttpRoutes } from './routes.js';
export async function createHttpServer(container) {
    const app = Fastify();
    app.setErrorHandler((error, _request, reply) => {
        const mappedError = mapHttpError(error);
        reply.status(mappedError.statusCode).send(mappedError.body);
    });
    await registerHttpRoutes(app, container);
    return app;
}
//# sourceMappingURL=server.js.map