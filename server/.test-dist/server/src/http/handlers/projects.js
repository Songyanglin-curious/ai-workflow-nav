import { presentAppendLatestDeliberationsEnvelope, presentCreateDeliberationsFileEnvelope, presentDeliberationsFilesEnvelope, presentDeliberationsFolderEnvelope, presentProjectDetailEnvelope, presentProjectNodeDetailEnvelope, presentProjectNodeLayoutsEnvelope, presentProjectNodeLayoutsPatchEnvelope, presentProjectNodeListEnvelope, presentProjectViewportEnvelope, presentProjectListEnvelope, presentSummaryFilesEnvelope, presentSummaryFolderEnvelope, } from '../presenter/projects.js';
import { appendLatestDeliberationsBodySchema, createDeliberationsFileBodySchema, createProjectBodySchema, createProjectNodeBodySchema, patchProjectNodeLayoutsBodySchema, patchProjectViewportBodySchema, projectListQuerySchema, projectNodeParamsSchema, projectNodesListQuerySchema, projectParamsSchema, updateProjectBodySchema, updateProjectNodeBodySchema, } from '../schema/projects.js';
import { parseInput } from './utils.js';
export async function registerProjectRoutes(app, options) {
    app.get('/api/projects', async (request) => {
        const query = parseInput(projectListQuerySchema, request.query);
        return presentProjectListEnvelope(options.projectService.listProjects(query));
    });
    app.get('/api/projects/:projectId', async (request) => {
        const { projectId } = parseInput(projectParamsSchema, request.params);
        return presentProjectDetailEnvelope(options.projectService.getProjectById(projectId));
    });
    app.post('/api/projects', async (request, reply) => {
        const body = parseInput(createProjectBodySchema, request.body);
        const project = await options.projectService.createProject(body);
        reply.status(201);
        return presentProjectDetailEnvelope(project);
    });
    app.patch('/api/projects/:projectId', async (request) => {
        const { projectId } = parseInput(projectParamsSchema, request.params);
        const body = parseInput(updateProjectBodySchema, request.body);
        return presentProjectDetailEnvelope(options.projectService.updateProject(projectId, body));
    });
    app.get('/api/projects/:projectId/nodes', async (request) => {
        const { projectId } = parseInput(projectParamsSchema, request.params);
        const query = parseInput(projectNodesListQuerySchema, request.query);
        return presentProjectNodeListEnvelope(options.projectNodeService.listProjectNodes(projectId, query));
    });
    app.post('/api/projects/:projectId/nodes', async (request, reply) => {
        const { projectId } = parseInput(projectParamsSchema, request.params);
        const body = parseInput(createProjectNodeBodySchema, request.body);
        const projectNode = await options.projectNodeService.createProjectNode(projectId, body);
        reply.status(201);
        return presentProjectNodeDetailEnvelope(projectNode);
    });
    app.get('/api/project-nodes/:projectNodeId', async (request) => {
        const { projectNodeId } = parseInput(projectNodeParamsSchema, request.params);
        return presentProjectNodeDetailEnvelope(options.projectNodeService.getProjectNodeById(projectNodeId));
    });
    app.patch('/api/project-nodes/:projectNodeId', async (request) => {
        const { projectNodeId } = parseInput(projectNodeParamsSchema, request.params);
        const body = parseInput(updateProjectNodeBodySchema, request.body);
        return presentProjectNodeDetailEnvelope(options.projectNodeService.updateProjectNode(projectNodeId, body));
    });
    app.get('/api/projects/:projectId/node-layouts', async (request) => {
        const { projectId } = parseInput(projectParamsSchema, request.params);
        return presentProjectNodeLayoutsEnvelope(options.projectViewConfigService.getProjectNodeLayouts(projectId));
    });
    app.patch('/api/projects/:projectId/node-layouts', async (request) => {
        const { projectId } = parseInput(projectParamsSchema, request.params);
        const body = parseInput(patchProjectNodeLayoutsBodySchema, request.body);
        return presentProjectNodeLayoutsPatchEnvelope(options.projectViewConfigService.patchProjectNodeLayouts(projectId, body));
    });
    app.get('/api/projects/:projectId/viewport', async (request) => {
        const { projectId } = parseInput(projectParamsSchema, request.params);
        return presentProjectViewportEnvelope(options.projectViewConfigService.getProjectViewport(projectId));
    });
    app.patch('/api/projects/:projectId/viewport', async (request) => {
        const { projectId } = parseInput(projectParamsSchema, request.params);
        const body = parseInput(patchProjectViewportBodySchema, request.body);
        return presentProjectViewportEnvelope(options.projectViewConfigService.patchProjectViewport(projectId, body));
    });
    app.get('/api/project-nodes/:projectNodeId/deliberations-records', async (request) => {
        const { projectNodeId } = parseInput(projectNodeParamsSchema, request.params);
        return presentDeliberationsFolderEnvelope(await options.deliberationsService.getDeliberationsRecordFolderInfo(projectNodeId));
    });
    app.get('/api/project-nodes/:projectNodeId/deliberations-records/files', async (request) => {
        const { projectNodeId } = parseInput(projectNodeParamsSchema, request.params);
        return presentDeliberationsFilesEnvelope(await options.deliberationsService.listDeliberationsRecordFiles(projectNodeId));
    });
    app.post('/api/project-nodes/:projectNodeId/deliberations-records/append-latest', async (request) => {
        const { projectNodeId } = parseInput(projectNodeParamsSchema, request.params);
        const body = parseInput(appendLatestDeliberationsBodySchema, request.body);
        return presentAppendLatestDeliberationsEnvelope(await options.deliberationsService.appendLatestDeliberations(projectNodeId, body));
    });
    app.post('/api/project-nodes/:projectNodeId/deliberations-records/files', async (request, reply) => {
        const { projectNodeId } = parseInput(projectNodeParamsSchema, request.params);
        const body = parseInput(createDeliberationsFileBodySchema, request.body);
        const result = await options.deliberationsService.createDeliberationsFile(projectNodeId, body);
        reply.status(201);
        return presentCreateDeliberationsFileEnvelope(result);
    });
    app.get('/api/project-nodes/:projectNodeId/summaries', async (request) => {
        const { projectNodeId } = parseInput(projectNodeParamsSchema, request.params);
        return presentSummaryFolderEnvelope(await options.summaryService.getSummaryFolderInfo(projectNodeId));
    });
    app.get('/api/project-nodes/:projectNodeId/summaries/files', async (request) => {
        const { projectNodeId } = parseInput(projectNodeParamsSchema, request.params);
        return presentSummaryFilesEnvelope(await options.summaryService.listSummaryFiles(projectNodeId));
    });
}
//# sourceMappingURL=projects.js.map