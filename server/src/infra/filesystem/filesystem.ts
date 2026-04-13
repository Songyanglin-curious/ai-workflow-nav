import { promises as fs } from 'node:fs';
import path from 'node:path';

export type FilesystemEntryKind = 'file' | 'directory';

export interface FilesystemEntry {
  name: string;
  absolutePath: string;
  kind: FilesystemEntryKind;
}

function assertAbsolutePath(targetPath: string): void {
  if (!path.isAbsolute(targetPath)) {
    throw new Error(`路径必须是绝对路径：${targetPath}`);
  }
}

export async function pathExists(targetPath: string): Promise<boolean> {
  assertAbsolutePath(targetPath);

  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDirectory(targetPath: string): Promise<void> {
  assertAbsolutePath(targetPath);
  await fs.mkdir(targetPath, { recursive: true });
}

export async function readTextFile(targetPath: string): Promise<string> {
  assertAbsolutePath(targetPath);
  return fs.readFile(targetPath, 'utf8');
}

export async function writeTextFile(targetPath: string, content: string): Promise<void> {
  assertAbsolutePath(targetPath);
  await fs.writeFile(targetPath, content, 'utf8');
}

export async function appendTextFile(targetPath: string, content: string): Promise<void> {
  assertAbsolutePath(targetPath);
  await fs.appendFile(targetPath, content, 'utf8');
}

export async function listDirectory(targetPath: string): Promise<FilesystemEntry[]> {
  assertAbsolutePath(targetPath);

  const entries = await fs.readdir(targetPath, {
    withFileTypes: true,
  });

  return entries
    .map((entry) => ({
      name: entry.name,
      absolutePath: path.join(targetPath, entry.name),
      kind: (entry.isDirectory() ? 'directory' : 'file') as FilesystemEntryKind,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));
}

export async function movePath(sourcePath: string, destinationPath: string): Promise<void> {
  assertAbsolutePath(sourcePath);
  assertAbsolutePath(destinationPath);
  await fs.rename(sourcePath, destinationPath);
}

export async function removePath(targetPath: string): Promise<void> {
  assertAbsolutePath(targetPath);
  await fs.rm(targetPath, {
    recursive: true,
    force: false,
  });
}
