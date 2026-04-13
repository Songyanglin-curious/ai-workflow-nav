import { appendTextFile, ensureDirectory, listDirectory, pathExists, writeTextFile, } from '../../../infra/filesystem/index.js';
import { resolveProjectPath } from '../../../infra/workspace/index.js';
import { ProjectNodeNotFoundError } from '../project-nodes/errors.js';
import { createProjectNodeRepo } from '../project-nodes/repo.js';
import { DeliberationsConflictError, DeliberationsRecordNotFoundError, DeliberationsValidationFailedError, } from './errors.js';
import { createDeliberationsRepo } from './repo.js';
const compliantFileNamePattern = /^(?<date>\d{8})-(?<time>\d{6})__(?<title>.+)\.md$/;
const forbiddenFileNameCharacters = /[<>:"/\\|?*]/;
function extractCompliantTimestamp(fileName) {
    const match = fileName.match(compliantFileNamePattern);
    return match ? `${match.groups?.date}-${match.groups?.time}` : null;
}
function assertDeliberationsTitle(title) {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
        throw new DeliberationsValidationFailedError('Deliberations 文件标题不能为空。');
    }
    if (forbiddenFileNameCharacters.test(trimmedTitle)) {
        throw new DeliberationsValidationFailedError(`Deliberations 文件标题包含非法字符：${trimmedTitle}`);
    }
    if (trimmedTitle.endsWith(' ') || trimmedTitle.endsWith('.')) {
        throw new DeliberationsValidationFailedError(`Deliberations 文件标题不能以空格或点号结尾：${trimmedTitle}`);
    }
    return trimmedTitle;
}
function createTimestampPrefix() {
    const now = new Date();
    const pad = (value) => value.toString().padStart(2, '0');
    return [
        now.getUTCFullYear().toString(),
        pad(now.getUTCMonth() + 1),
        pad(now.getUTCDate()),
    ].join('') + `-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;
}
function buildDeliberationsFileName(title) {
    return `${createTimestampPrefix()}__${title}.md`;
}
function compareDeliberationsFiles(left, right) {
    const leftTimestamp = extractCompliantTimestamp(left);
    const rightTimestamp = extractCompliantTimestamp(right);
    if (leftTimestamp && rightTimestamp) {
        return rightTimestamp.localeCompare(leftTimestamp, 'en');
    }
    if (leftTimestamp) {
        return -1;
    }
    if (rightTimestamp) {
        return 1;
    }
    return left.localeCompare(right, 'zh-CN');
}
export function createDeliberationsService(database, workspacePaths) {
    const projectNodeRepo = createProjectNodeRepo(database);
    const repo = createDeliberationsRepo(database);
    async function getFolderContext(projectNodeId) {
        const projectNode = projectNodeRepo.getProjectNodeEntityById(projectNodeId);
        if (!projectNode) {
            throw new ProjectNodeNotFoundError(projectNodeId);
        }
        const record = repo.getDeliberationsRecordByProjectNodeId(projectNodeId);
        if (!record) {
            throw new DeliberationsRecordNotFoundError(projectNodeId);
        }
        return {
            folderPath: record.folderPath,
            absoluteFolderPath: resolveProjectPath(workspacePaths, record.folderPath),
            projectNodeName: projectNode.name,
        };
    }
    async function listFiles(projectNodeId) {
        const { absoluteFolderPath } = await getFolderContext(projectNodeId);
        if (!(await pathExists(absoluteFolderPath))) {
            return [];
        }
        const fileNames = (await listDirectory(absoluteFolderPath))
            .filter((entry) => entry.kind === 'file')
            .map((entry) => entry.name)
            .sort(compareDeliberationsFiles);
        const latestWritableFileName = fileNames.find((fileName) => extractCompliantTimestamp(fileName) !== null) ?? null;
        return fileNames.map((fileName) => ({
            fileName,
            isNameCompliant: extractCompliantTimestamp(fileName) !== null,
            isLatestWritable: latestWritableFileName === fileName,
        }));
    }
    return {
        async getDeliberationsRecordFolderInfo(projectNodeId) {
            const { absoluteFolderPath } = await getFolderContext(projectNodeId);
            const files = await listFiles(projectNodeId);
            return {
                projectNodeId,
                exists: await pathExists(absoluteFolderPath),
                fileCount: files.length,
                latestWritableFileName: files.find((file) => file.isLatestWritable)?.fileName ?? null,
            };
        },
        async listDeliberationsRecordFiles(projectNodeId) {
            return listFiles(projectNodeId);
        },
        async appendLatestDeliberations(projectNodeId, input) {
            const context = await getFolderContext(projectNodeId);
            await ensureDirectory(context.absoluteFolderPath);
            const files = await listFiles(projectNodeId);
            let fileName = files.find((file) => file.isLatestWritable)?.fileName;
            let createdNewFile = false;
            if (!fileName) {
                fileName = buildDeliberationsFileName(assertDeliberationsTitle(context.projectNodeName));
                await writeTextFile(resolveProjectPath(workspacePaths, `${context.folderPath}/${fileName}`), '');
                createdNewFile = true;
            }
            await appendTextFile(resolveProjectPath(workspacePaths, `${context.folderPath}/${fileName}`), input.content);
            return {
                fileName,
                createdNewFile,
            };
        },
        async createDeliberationsFile(projectNodeId, input = {}) {
            const context = await getFolderContext(projectNodeId);
            await ensureDirectory(context.absoluteFolderPath);
            const fileName = buildDeliberationsFileName(assertDeliberationsTitle(input.title ?? '未命名'));
            const absoluteFilePath = resolveProjectPath(workspacePaths, `${context.folderPath}/${fileName}`);
            if (await pathExists(absoluteFilePath)) {
                throw new DeliberationsConflictError(fileName);
            }
            await writeTextFile(absoluteFilePath, '');
            return {
                fileName,
            };
        },
    };
}
//# sourceMappingURL=service.js.map