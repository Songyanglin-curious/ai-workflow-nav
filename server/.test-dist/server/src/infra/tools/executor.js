import { execFile } from 'node:child_process';
export class ToolExecutionError extends Error {
    constructor(exePath, args, cause) {
        super(`工具执行失败：${exePath} ${args.join(' ')}`, { cause });
        this.name = 'ToolExecutionError';
    }
}
export async function executeTool(input) {
    const { exePath, args, cwd } = input;
    return new Promise((resolve, reject) => {
        execFile(exePath, args, {
            cwd,
            windowsHide: true,
        }, (error, stdout, stderr) => {
            if (error) {
                reject(new ToolExecutionError(exePath, args, error));
                return;
            }
            resolve({
                exitCode: 0,
                stdout,
                stderr,
            });
        });
    });
}
//# sourceMappingURL=executor.js.map