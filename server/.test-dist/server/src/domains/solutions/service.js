import { randomBytes } from 'node:crypto';
import { runInTransaction, DatabaseTransactionError } from '../../infra/db/index.js';
import { ProjectNotFoundError, SolutionConflictError, SolutionNotFoundError, SolutionProjectBindingNotFoundError, SolutionValidationFailedError, } from './errors.js';
import { createSolutionRepo, } from './repo.js';
function createUuidV7() {
    const timestamp = BigInt(Date.now());
    const bytes = randomBytes(16);
    bytes[0] = Number((timestamp >> 40n) & 0xffn);
    bytes[1] = Number((timestamp >> 32n) & 0xffn);
    bytes[2] = Number((timestamp >> 24n) & 0xffn);
    bytes[3] = Number((timestamp >> 16n) & 0xffn);
    bytes[4] = Number((timestamp >> 8n) & 0xffn);
    bytes[5] = Number(timestamp & 0xffn);
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Buffer.from(bytes).toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
function createTimestamp() {
    return new Date().toISOString();
}
function assertSolutionName(name) {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
        throw new SolutionValidationFailedError('Solution 名称不能为空。');
    }
    return trimmedName;
}
function toSolutionSummary(record) {
    return {
        id: record.id,
        name: record.name,
        description: record.description,
        tags: record.tags,
        category: record.category,
        projectCount: record.projectCount,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}
function toSolutionProjectItem(record) {
    return {
        solutionId: record.solutionId,
        projectId: record.projectId,
        sortOrder: record.sortOrder,
        projectName: record.projectName,
    };
}
function toProjectSolutionItem(record) {
    return {
        projectId: record.projectId,
        solutionId: record.solutionId,
        solutionName: record.solutionName,
        sortOrder: record.sortOrder,
    };
}
function isUniqueBindingConflict(error) {
    if (!(error instanceof DatabaseTransactionError)) {
        return false;
    }
    const cause = error.cause;
    if (cause instanceof Error) {
        return (cause.message.includes('solution_projects.solution_id') &&
            cause.message.includes('solution_projects.project_id'));
    }
    return false;
}
function assertSolutionExists(solution, solutionId) {
    if (!solution) {
        throw new SolutionNotFoundError(solutionId);
    }
    return solution;
}
function assertProjectExists(project, projectId) {
    if (!project) {
        throw new ProjectNotFoundError(projectId);
    }
    return project;
}
function assertSolutionProjectExists(binding, solutionId, projectId) {
    if (!binding) {
        throw new SolutionProjectBindingNotFoundError(solutionId, projectId);
    }
    return binding;
}
export function createSolutionService(database) {
    const repo = createSolutionRepo(database);
    function assertSolutionProjectBindingSolution(solutionId, projectId) {
        const solution = assertSolutionExists(repo.getSolutionById(solutionId), solutionId);
        const project = assertProjectExists(repo.getProjectById(projectId), projectId);
        const binding = repo.getSolutionProjectBySolutionIdAndProjectId(solution.id, project.id);
        return assertSolutionProjectExists(binding, solution.id, project.id);
    }
    return {
        listSolutions(query = {}) {
            return repo.listSolutions(query).map(toSolutionSummary);
        },
        getSolutionById(id) {
            const record = repo.getSolutionById(id);
            if (!record) {
                throw new SolutionNotFoundError(id);
            }
            return toSolutionSummary(record);
        },
        createSolution(input) {
            const now = createTimestamp();
            const record = {
                id: createUuidV7(),
                name: assertSolutionName(input.name),
                description: input.description ?? '',
                tags: input.tags ?? '',
                category: input.category ?? '',
                projectCount: 0,
                createdAt: now,
                updatedAt: now,
            };
            runInTransaction(database, () => repo.createSolution(record));
            return toSolutionSummary(record);
        },
        updateSolution(id, patch) {
            const currentRecord = repo.getSolutionById(id);
            if (!currentRecord) {
                throw new SolutionNotFoundError(id);
            }
            const nextRecord = {
                ...currentRecord,
                name: patch.name !== undefined ? assertSolutionName(patch.name) : currentRecord.name,
                description: patch.description ?? currentRecord.description,
                tags: patch.tags ?? currentRecord.tags,
                category: patch.category ?? currentRecord.category,
                updatedAt: createTimestamp(),
            };
            runInTransaction(database, () => repo.updateSolution(nextRecord));
            return toSolutionSummary(nextRecord);
        },
        deleteSolutionById(id) {
            const record = repo.getSolutionById(id);
            if (!record) {
                throw new SolutionNotFoundError(id);
            }
            runInTransaction(database, () => repo.deleteSolutionById(id));
            return {
                deleted: true,
            };
        },
        listSolutionProjectsBySolutionId(solutionId) {
            assertSolutionExists(repo.getSolutionById(solutionId), solutionId);
            return repo.listSolutionProjectsBySolutionId(solutionId).map(toSolutionProjectItem);
        },
        createSolutionProject(solutionId, input) {
            const solution = assertSolutionExists(repo.getSolutionById(solutionId), solutionId);
            const project = assertProjectExists(repo.getProjectById(input.projectId), input.projectId);
            const currentBinding = repo.getSolutionProjectBySolutionIdAndProjectId(solution.id, project.id);
            if (currentBinding) {
                throw new SolutionConflictError(solution.id, project.id);
            }
            const now = createTimestamp();
            const record = {
                id: createUuidV7(),
                solutionId: solution.id,
                projectId: project.id,
                sortOrder: input.sortOrder ?? repo.getNextSolutionProjectSortOrder(solution.id),
                projectName: project.name,
                createdAt: now,
            };
            try {
                runInTransaction(database, () => repo.createSolutionProject(record));
            }
            catch (error) {
                if (isUniqueBindingConflict(error)) {
                    throw new SolutionConflictError(solution.id, project.id);
                }
                throw error;
            }
            return toSolutionProjectItem(record);
        },
        updateSolutionProjectBySolutionIdAndProjectId(solutionId, projectId, patch) {
            const binding = assertSolutionProjectBindingSolution(solutionId, projectId);
            runInTransaction(database, () => repo.updateSolutionProjectSortOrder(binding.solutionId, binding.projectId, patch.sortOrder));
            return {
                ...toSolutionProjectItem(binding),
                sortOrder: patch.sortOrder,
            };
        },
        deleteSolutionProjectBySolutionIdAndProjectId(solutionId, projectId) {
            const binding = assertSolutionProjectBindingSolution(solutionId, projectId);
            runInTransaction(database, () => repo.deleteSolutionProjectBySolutionIdAndProjectId(binding.solutionId, binding.projectId));
            return {
                deleted: true,
            };
        },
        listProjectSolutionsByProjectId(projectId) {
            assertProjectExists(repo.getProjectById(projectId), projectId);
            return repo.listProjectSolutionsByProjectId(projectId).map((record) => toProjectSolutionItem({
                projectId: record.projectId,
                solutionId: record.solutionId,
                solutionName: record.solutionName,
                sortOrder: record.sortOrder,
            }));
        },
    };
}
//# sourceMappingURL=service.js.map