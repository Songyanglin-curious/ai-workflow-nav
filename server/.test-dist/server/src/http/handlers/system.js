import { presentProjectDeletionCheckEnvelope, presentProjectDeletionExecuteEnvelope, presentProjectNodeDeletionCheckEnvelope, presentProjectNodeDeletionExecuteEnvelope, presentWorkflowRuntimeDetailEnvelope, presentWorkflowRuntimeTriggerEnvelope, } from '../presenter/projects.js';
import { presentInspectionRunEnvelope, presentSelfCheckEnvelope, presentStartupReportEnvelope, presentSyncExportEnvelope, presentSyncImportEnvelope, } from '../presenter/system.js';
import { projectDeletionExecuteBodySchema, projectNodeDeletionExecuteBodySchema, projectNodeParamsSchema, projectParamsSchema, workflowRuntimeParamsSchema, } from '../schema/projects.js';
import { emptyBodySchema, syncImportBodySchema } from '../schema/system.js';
import { parseInput } from './utils.js';
export async function registerSystemRoutes(app, options) {
    app.post('/api/projects/:projectId/deletion-check', async (request) => {
        const { projectId } = parseInput(projectParamsSchema, request.params);
        parseInput(emptyBodySchema, request.body ?? {});
        return presentProjectDeletionCheckEnvelope(await options.projectDeletionService.checkProjectDeletion(projectId));
    });
    app.post('/api/projects/:projectId/deletion-execute', async (request) => {
        const { projectId } = parseInput(projectParamsSchema, request.params);
        const body = parseInput(projectDeletionExecuteBodySchema, request.body);
        return presentProjectDeletionExecuteEnvelope(await options.projectDeletionService.executeProjectDeletion(projectId, body));
    });
    app.post('/api/project-nodes/:projectNodeId/deletion-check', async (request) => {
        const { projectNodeId } = parseInput(projectNodeParamsSchema, request.params);
        parseInput(emptyBodySchema, request.body ?? {});
        return presentProjectNodeDeletionCheckEnvelope(await options.projectNodeDeletionService.checkProjectNodeDeletion(projectNodeId));
    });
    app.post('/api/project-nodes/:projectNodeId/deletion-execute', async (request) => {
        const { projectNodeId } = parseInput(projectNodeParamsSchema, request.params);
        const body = parseInput(projectNodeDeletionExecuteBodySchema, request.body);
        return presentProjectNodeDeletionExecuteEnvelope(await options.projectNodeDeletionService.executeProjectNodeDeletion(projectNodeId, body));
    });
    app.get('/api/project-nodes/:projectNodeId/workflow-runtime/nodes/:mermaidNodeId', async (request) => {
        const { projectNodeId, mermaidNodeId } = parseInput(workflowRuntimeParamsSchema, request.params);
        return presentWorkflowRuntimeDetailEnvelope(await options.workflowRuntimeActionsService.getWorkflowRuntimeNodeDetail(projectNodeId, mermaidNodeId));
    });
    app.post('/api/project-nodes/:projectNodeId/workflow-runtime/nodes/:mermaidNodeId/trigger', async (request) => {
        const { projectNodeId, mermaidNodeId } = parseInput(workflowRuntimeParamsSchema, request.params);
        parseInput(emptyBodySchema, request.body ?? {});
        return presentWorkflowRuntimeTriggerEnvelope(await options.workflowRuntimeActionsService.triggerWorkflowRuntimeNodeAction(projectNodeId, mermaidNodeId));
    });
    app.post('/api/inspections/run', async (request) => {
        parseInput(emptyBodySchema, request.body ?? {});
        return presentInspectionRunEnvelope(await options.inspectionsProcess.runInspection());
    });
    app.post('/api/sync/export', async (request) => {
        parseInput(emptyBodySchema, request.body ?? {});
        return presentSyncExportEnvelope(await options.importsExportsProcess.exportSync());
    });
    app.post('/api/sync/import', async (request) => {
        const body = parseInput(syncImportBodySchema, request.body);
        return presentSyncImportEnvelope(await options.importsExportsProcess.importSync(body.mode));
    });
    app.get('/api/system/startup-report', async () => {
        const report = options.startupService.getLatestStartupReport();
        if (!report) {
            throw new Error('启动报告不存在。');
        }
        return presentStartupReportEnvelope(report);
    });
    app.post('/api/system/self-check', async (request) => {
        parseInput(emptyBodySchema, request.body ?? {});
        return presentSelfCheckEnvelope(await options.startupService.runSelfCheck());
    });
}
//# sourceMappingURL=system.js.map