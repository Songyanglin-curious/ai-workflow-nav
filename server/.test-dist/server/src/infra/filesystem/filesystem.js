import { promises as fs } from 'node:fs';
import path from 'node:path';
function assertAbsolutePath(targetPath) {
    if (!path.isAbsolute(targetPath)) {
        throw new Error(`路径必须是绝对路径：${targetPath}`);
    }
}
export async function pathExists(targetPath) {
    assertAbsolutePath(targetPath);
    try {
        await fs.access(targetPath);
        return true;
    }
    catch {
        return false;
    }
}
export async function ensureDirectory(targetPath) {
    assertAbsolutePath(targetPath);
    await fs.mkdir(targetPath, { recursive: true });
}
export async function readTextFile(targetPath) {
    assertAbsolutePath(targetPath);
    return fs.readFile(targetPath, 'utf8');
}
export async function writeTextFile(targetPath, content) {
    assertAbsolutePath(targetPath);
    await fs.writeFile(targetPath, content, 'utf8');
}
export async function appendTextFile(targetPath, content) {
    assertAbsolutePath(targetPath);
    await fs.appendFile(targetPath, content, 'utf8');
}
export async function listDirectory(targetPath) {
    assertAbsolutePath(targetPath);
    const entries = await fs.readdir(targetPath, {
        withFileTypes: true,
    });
    return entries
        .map((entry) => ({
        name: entry.name,
        absolutePath: path.join(targetPath, entry.name),
        kind: (entry.isDirectory() ? 'directory' : 'file'),
    }))
        .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));
}
export async function movePath(sourcePath, destinationPath) {
    assertAbsolutePath(sourcePath);
    assertAbsolutePath(destinationPath);
    await fs.rename(sourcePath, destinationPath);
}
export async function removePath(targetPath) {
    assertAbsolutePath(targetPath);
    await fs.rm(targetPath, {
        recursive: true,
        force: false,
    });
}
//# sourceMappingURL=filesystem.js.map