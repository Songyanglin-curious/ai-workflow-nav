import { listDirectory, pathExists } from '../../../infra/filesystem/index.js';
import { resolveProjectPath } from '../../../infra/workspace/index.js';
import { ProjectNodeNotFoundError } from '../project-nodes/errors.js';
import { createProjectNodeRepo } from '../project-nodes/repo.js';
import { SummaryRecordNotFoundError } from './errors.js';
import { createSummaryRepo } from './repo.js';
export function createSummaryService(database, workspacePaths) {
    const projectNodeRepo = createProjectNodeRepo(database);
    const repo = createSummaryRepo(database);
    async function getFolderPath(projectNodeId) {
        if (!projectNodeRepo.getProjectNodeEntityById(projectNodeId)) {
            throw new ProjectNodeNotFoundError(projectNodeId);
        }
        const record = repo.getSummaryRecordByProjectNodeId(projectNodeId);
        if (!record) {
            throw new SummaryRecordNotFoundError(projectNodeId);
        }
        return resolveProjectPath(workspacePaths, record.folderPath);
    }
    return {
        async getSummaryFolderInfo(projectNodeId) {
            const absoluteFolderPath = await getFolderPath(projectNodeId);
            if (!(await pathExists(absoluteFolderPath))) {
                return {
                    projectNodeId,
                    exists: false,
                    fileCount: 0,
                    isEmpty: true,
                };
            }
            const files = (await listDirectory(absoluteFolderPath))
                .filter((entry) => entry.kind === 'file')
                .map((entry) => entry.name);
            return {
                projectNodeId,
                exists: true,
                fileCount: files.length,
                isEmpty: files.length === 0,
            };
        },
        async listSummaryFiles(projectNodeId) {
            const absoluteFolderPath = await getFolderPath(projectNodeId);
            if (!(await pathExists(absoluteFolderPath))) {
                return [];
            }
            return (await listDirectory(absoluteFolderPath))
                .filter((entry) => entry.kind === 'file')
                .map((entry) => entry.name)
                .sort((left, right) => left.localeCompare(right, 'zh-CN'))
                .map((fileName) => ({
                fileName,
            }));
        },
    };
}
//# sourceMappingURL=service.js.map