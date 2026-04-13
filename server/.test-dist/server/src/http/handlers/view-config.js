import { presentItems, presentNamed, presentResult } from '../presenter.js';
export function createProjectViewConfigHttpHandlers({ projectViewConfig, }) {
    return {
        async getProjectNodeLayouts(request, reply) {
            const items = projectViewConfig.getProjectNodeLayouts(request.params.projectId);
            await reply.send(presentItems(items));
        },
        async patchProjectNodeLayouts(request, reply) {
            const result = projectViewConfig.patchProjectNodeLayouts(request.params.projectId, request.body);
            await reply.send(presentResult(result));
        },
        async getProjectViewport(request, reply) {
            const viewport = projectViewConfig.getProjectViewport(request.params.projectId);
            await reply.send(presentNamed('viewport', viewport));
        },
        async patchProjectViewport(request, reply) {
            const viewport = projectViewConfig.patchProjectViewport(request.params.projectId, request.body);
            await reply.send(presentNamed('viewport', viewport));
        },
    };
}
//# sourceMappingURL=view-config.js.map