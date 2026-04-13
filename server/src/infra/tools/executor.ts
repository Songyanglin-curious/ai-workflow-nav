import { execFile } from 'node:child_process';

export interface ToolExecutionInput {
  exePath: string;
  args: string[];
  cwd?: string;
}

export interface ToolExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export class ToolExecutionError extends Error {
  constructor(exePath: string, args: string[], cause: unknown) {
    super(`工具执行失败：${exePath} ${args.join(' ')}`, { cause });
    this.name = 'ToolExecutionError';
  }
}

export async function executeTool(input: ToolExecutionInput): Promise<ToolExecutionResult> {
  const { exePath, args, cwd } = input;

  return new Promise<ToolExecutionResult>((resolve, reject) => {
    execFile(
      exePath,
      args,
      {
        cwd,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new ToolExecutionError(exePath, args, error));
          return;
        }

        resolve({
          exitCode: 0,
          stdout,
          stderr,
        });
      },
    );
  });
}
