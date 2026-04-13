import { presentItems, presentNamed } from '../presenter.js';
export function createProjectNodesHttpHandlers({ projectNodes, }) {
    return {
        async listProjectNodes(request, reply) {
            const items = projectNodes.listProjectNodes(request.params.projectId, request.query);
            await reply.send(presentItems(items));
        },
        async getProjectNode(request, reply) {
            const projectNode = projectNodes.getProjectNodeById(request.params.id);
            await reply.send(presentNamed('projectNode', projectNode));
        },
        async createProjectNode(request, reply) {
            const projectNode = await projectNodes.createProjectNode(request.params.projectId, request.body);
            await reply.send(presentNamed('projectNode', projectNode));
        },
        async updateProjectNode(request, reply) {
            const projectNode = projectNodes.updateProjectNode(request.params.id, request.body);
            await reply.send(presentNamed('projectNode', projectNode));
        },
    };
}
//# sourceMappingURL=project-nodes.js.map