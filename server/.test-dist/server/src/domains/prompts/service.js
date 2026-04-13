import { randomBytes } from 'node:crypto';
import { pathExists, readTextFile, removePath, writeTextFile } from '../../infra/filesystem/index.js';
import { runInTransaction } from '../../infra/db/index.js';
import { resolvePromptPath } from '../../infra/workspace/index.js';
import { PromptFileMissingError, PromptFilePathConflictError, PromptNotFoundError, PromptValidationFailedError, } from './errors.js';
import { createPromptRepo } from './repo.js';
const forbiddenFileNameCharacters = /[<>:"/\\|?*]/;
const reservedFileNames = new Set([
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
]);
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
function createShortId(id) {
    return id.replaceAll('-', '').slice(0, 8);
}
function createTimestamp() {
    return new Date().toISOString();
}
function assertPromptName(name) {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
        throw new PromptValidationFailedError('Prompt 名称不能为空。');
    }
    if (forbiddenFileNameCharacters.test(trimmedName)) {
        throw new PromptValidationFailedError(`Prompt 名称包含非法文件名字符：${trimmedName}`);
    }
    if (trimmedName.endsWith(' ') || trimmedName.endsWith('.')) {
        throw new PromptValidationFailedError(`Prompt 名称不能以空格或点号结尾：${trimmedName}`);
    }
    if (reservedFileNames.has(trimmedName.toUpperCase())) {
        throw new PromptValidationFailedError(`Prompt 名称不能使用系统保留名：${trimmedName}`);
    }
    return trimmedName;
}
function buildPromptFilePath(name, id) {
    return `${name}__${createShortId(id)}.md`;
}
function toPromptSummary(record) {
    return {
        id: record.id,
        name: record.name,
        description: record.description,
        tags: record.tags,
        category: record.category,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}
async function readPromptContent(workspacePaths, record) {
    const absoluteFilePath = resolvePromptPath(workspacePaths, record.contentFilePath);
    if (!(await pathExists(absoluteFilePath))) {
        throw new PromptFileMissingError(record.contentFilePath);
    }
    return readTextFile(absoluteFilePath);
}
export function createPromptService(database, workspacePaths) {
    const repo = createPromptRepo(database);
    return {
        listPrompts(query = {}) {
            return repo.listPrompts(query).map(toPromptSummary);
        },
        async getPromptById(id) {
            const record = repo.getPromptById(id);
            if (!record) {
                throw new PromptNotFoundError(id);
            }
            return {
                ...toPromptSummary(record),
                content: await readPromptContent(workspacePaths, record),
            };
        },
        async createPrompt(input) {
            const id = createUuidV7();
            const name = assertPromptName(input.name);
            const now = createTimestamp();
            const contentFilePath = buildPromptFilePath(name, id);
            if (repo.promptFilePathExists(contentFilePath)) {
                throw new PromptFilePathConflictError(contentFilePath);
            }
            const record = {
                id,
                name,
                description: input.description ?? '',
                tags: input.tags ?? '',
                category: input.category ?? '',
                contentFilePath,
                createdAt: now,
                updatedAt: now,
            };
            const absoluteFilePath = resolvePromptPath(workspacePaths, contentFilePath);
            const content = input.content ?? '';
            await writeTextFile(absoluteFilePath, content);
            try {
                runInTransaction(database, () => repo.createPrompt(record));
            }
            catch (error) {
                await removePath(absoluteFilePath).catch(() => undefined);
                throw error;
            }
            return {
                ...toPromptSummary(record),
                content,
            };
        },
        async updatePrompt(id, patch) {
            const currentRecord = repo.getPromptById(id);
            if (!currentRecord) {
                throw new PromptNotFoundError(id);
            }
            const absoluteFilePath = resolvePromptPath(workspacePaths, currentRecord.contentFilePath);
            const previousContent = await readPromptContent(workspacePaths, currentRecord);
            const nextRecord = {
                ...currentRecord,
                name: patch.name ? assertPromptName(patch.name) : currentRecord.name,
                description: patch.description ?? currentRecord.description,
                tags: patch.tags ?? currentRecord.tags,
                category: patch.category ?? currentRecord.category,
                updatedAt: createTimestamp(),
            };
            const nextContent = patch.content ?? previousContent;
            if (patch.content !== undefined) {
                await writeTextFile(absoluteFilePath, nextContent);
            }
            try {
                runInTransaction(database, () => repo.updatePrompt(nextRecord));
            }
            catch (error) {
                if (patch.content !== undefined) {
                    await writeTextFile(absoluteFilePath, previousContent);
                }
                throw error;
            }
            return {
                ...toPromptSummary(nextRecord),
                content: nextContent,
            };
        },
        async deletePromptById(id) {
            const record = repo.getPromptById(id);
            if (!record) {
                throw new PromptNotFoundError(id);
            }
            const absoluteFilePath = resolvePromptPath(workspacePaths, record.contentFilePath);
            const previousContent = await readPromptContent(workspacePaths, record);
            await removePath(absoluteFilePath);
            try {
                runInTransaction(database, () => repo.deletePromptById(id));
            }
            catch (error) {
                await writeTextFile(absoluteFilePath, previousContent);
                throw error;
            }
            return {
                deleted: true,
            };
        },
    };
}
//# sourceMappingURL=service.js.map