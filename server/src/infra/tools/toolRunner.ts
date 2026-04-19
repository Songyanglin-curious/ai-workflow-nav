import { spawn } from 'node:child_process';

export type ToolCommand = {
  command: string;
  args?: string[];
};

export function runTool(command: ToolCommand) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command.command, command.args ?? [], {
      stdio: 'ignore',
      detached: false,
    });

    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`外部工具执行失败: ${code}`));
    });
  });
}
