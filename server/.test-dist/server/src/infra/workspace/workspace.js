import path from 'node:path';
function normalizeAbsolutePath(targetPath) {
    const normalizedPath = path.resolve(targetPath);
    if (!path.isAbsolute(normalizedPath)) {
        throw new Error(`工作区路径必须是绝对路径：${targetPath}`);
    }
    return normalizedPath;
}
function isPathWithinRoot(targetPath, rootPath) {
    const normalizedTargetPath = normalizeAbsolutePath(targetPath);
    const normalizedRootPath = normalizeAbsolutePath(rootPath);
    const relativePath = path.relative(normalizedRootPath, normalizedTargetPath);
    return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}
function resolveRelativePath(basePath, relativePath) {
    if (path.isAbsolute(relativePath)) {
        throw new Error(`相对路径字段不允许传入绝对路径：${relativePath}`);
    }
    return path.resolve(basePath, relativePath);
}
export function createWorkspacePaths(rootPath) {
    const normalizedRootPath = normalizeAbsolutePath(rootPath);
    return {
        rootPath: normalizedRootPath,
        dbDirectoryPath: path.join(normalizedRootPath, 'db'),
        runtimeDatabasePath: path.join(normalizedRootPath, 'db', 'runtime.sqlite'),
        syncDirectoryPath: path.join(normalizedRootPath, 'dbSyncs'),
        promptsDirectoryPath: path.join(normalizedRootPath, 'prompts'),
        projectsDirectoryPath: path.join(normalizedRootPath, 'projects'),
        summaryArchivesDirectoryPath: path.join(normalizedRootPath, 'summaryArchives'),
        localConfigPath: path.join(normalizedRootPath, 'local.config.jsonc'),
    };
}
export function getWorkspaceAllowedRoots(workspacePaths) {
    return [
        workspacePaths.rootPath,
        workspacePaths.syncDirectoryPath,
        workspacePaths.promptsDirectoryPath,
        workspacePaths.projectsDirectoryPath,
        workspacePaths.summaryArchivesDirectoryPath,
    ];
}
export function assertAllowedPath(targetPath, allowedRootPaths) {
    const normalizedTargetPath = normalizeAbsolutePath(targetPath);
    if (!allowedRootPaths.some((allowedRootPath) => isPathWithinRoot(normalizedTargetPath, allowedRootPath))) {
        throw new Error(`路径超出允许根目录：${targetPath}`);
    }
    return normalizedTargetPath;
}
export function resolveWorkspacePath(workspacePaths, relativePath, baseDirectoryPath) {
    const resolvedPath = resolveRelativePath(baseDirectoryPath, relativePath);
    return assertAllowedPath(resolvedPath, getWorkspaceAllowedRoots(workspacePaths));
}
export function resolvePromptPath(workspacePaths, relativePath) {
    return resolveWorkspacePath(workspacePaths, relativePath, workspacePaths.promptsDirectoryPath);
}
export function resolveProjectPath(workspacePaths, relativePath) {
    return resolveWorkspacePath(workspacePaths, relativePath, workspacePaths.projectsDirectoryPath);
}
export function resolveSyncPath(workspacePaths, relativePath) {
    return resolveWorkspacePath(workspacePaths, relativePath, workspacePaths.syncDirectoryPath);
}
export function resolveSummaryArchivePath(workspacePaths, relativePath) {
    return resolveWorkspacePath(workspacePaths, relativePath, workspacePaths.summaryArchivesDirectoryPath);
}
//# sourceMappingURL=workspace.js.map