import { presentProjectSolutionsEnvelope, presentSolutionDeleteEnvelope, presentSolutionDetailEnvelope, presentSolutionListEnvelope, presentSolutionProjectsEnvelope, } from '../presenter/solutions.js';
import { createSolutionBodySchema, createSolutionProjectBodySchema, patchSolutionProjectBodySchema, projectSolutionsParamsSchema, solutionListQuerySchema, solutionParamsSchema, solutionProjectParamsSchema, updateSolutionBodySchema, } from '../schema/solutions.js';
import { parseInput } from './utils.js';
export async function registerSolutionRoutes(app, options) {
    app.get('/api/solutions', async (request) => {
        const query = parseInput(solutionListQuerySchema, request.query);
        return presentSolutionListEnvelope(options.solutionService.listSolutions(query));
    });
    app.get('/api/solutions/:solutionId', async (request) => {
        const { solutionId } = parseInput(solutionParamsSchema, request.params);
        return presentSolutionDetailEnvelope(options.solutionService.getSolutionById(solutionId));
    });
    app.post('/api/solutions', async (request, reply) => {
        const body = parseInput(createSolutionBodySchema, request.body);
        reply.status(201);
        return presentSolutionDetailEnvelope(options.solutionService.createSolution(body));
    });
    app.patch('/api/solutions/:solutionId', async (request) => {
        const { solutionId } = parseInput(solutionParamsSchema, request.params);
        const body = parseInput(updateSolutionBodySchema, request.body);
        return presentSolutionDetailEnvelope(options.solutionService.updateSolution(solutionId, body));
    });
    app.delete('/api/solutions/:solutionId', async (request) => {
        const { solutionId } = parseInput(solutionParamsSchema, request.params);
        options.solutionService.deleteSolutionById(solutionId);
        return presentSolutionDeleteEnvelope();
    });
    app.get('/api/solutions/:solutionId/projects', async (request) => {
        const { solutionId } = parseInput(solutionParamsSchema, request.params);
        return presentSolutionProjectsEnvelope(options.solutionService.listSolutionProjectsBySolutionId(solutionId));
    });
    app.post('/api/solutions/:solutionId/projects', async (request, reply) => {
        const { solutionId } = parseInput(solutionParamsSchema, request.params);
        const body = parseInput(createSolutionProjectBodySchema, request.body);
        reply.status(201);
        return presentSolutionProjectsEnvelope([
            options.solutionService.createSolutionProject(solutionId, body),
        ]);
    });
    app.patch('/api/solutions/:solutionId/projects/:projectId', async (request) => {
        const { solutionId, projectId } = parseInput(solutionProjectParamsSchema, request.params);
        const body = parseInput(patchSolutionProjectBodySchema, request.body);
        return presentSolutionProjectsEnvelope([
            options.solutionService.updateSolutionProjectBySolutionIdAndProjectId(solutionId, projectId, body),
        ]);
    });
    app.delete('/api/solutions/:solutionId/projects/:projectId', async (request) => {
        const { solutionId, projectId } = parseInput(solutionProjectParamsSchema, request.params);
        options.solutionService.deleteSolutionProjectBySolutionIdAndProjectId(solutionId, projectId);
        return presentSolutionDeleteEnvelope();
    });
    app.get('/api/projects/:projectId/solutions', async (request) => {
        const { projectId } = parseInput(projectSolutionsParamsSchema, request.params);
        return presentProjectSolutionsEnvelope(options.solutionService.listProjectSolutionsByProjectId(projectId));
    });
}
//# sourceMappingURL=solutions.js.map