import { presentItems, presentNamed, presentResult } from '../presenter.js';
export function createDeliberationsHttpHandlers({ deliberations, }) {
    return {
        async getDeliberationsRecord(request, reply) {
            const deliberationsRecord = await deliberations.getDeliberationsRecordFolderInfo(request.params.projectNodeId);
            await reply.send(presentNamed('deliberationsRecord', deliberationsRecord));
        },
        async listDeliberationsRecordFiles(request, reply) {
            const items = await deliberations.listDeliberationsRecordFiles(request.params.projectNodeId);
            await reply.send(presentItems(items));
        },
        async appendLatestDeliberations(request, reply) {
            const result = await deliberations.appendLatestDeliberations(request.params.projectNodeId, request.body);
            await reply.send(presentResult(result));
        },
        async createDeliberationsFile(request, reply) {
            const result = await deliberations.createDeliberationsFile(request.params.projectNodeId, request.body);
            await reply.send(presentResult(result));
        },
    };
}
//# sourceMappingURL=deliberations.js.map