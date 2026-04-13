import { presentError } from '../presenter.js';
export async function notFoundHandler(_request, reply) {
    reply.status(404).send(presentError('NOT_FOUND', '请求的接口不存在。'));
}
//# sourceMappingURL=not-found-handler.js.map