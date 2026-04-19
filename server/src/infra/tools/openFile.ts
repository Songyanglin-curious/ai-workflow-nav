import type { AppConfig } from '../../config/configSchema.js';
import { runTool } from './toolRunner.js';

export async function openFile(config: AppConfig, filePath: string) {
  const opener = config.tools?.fileOpener;

  if (!opener) {
    throw new Error('fileOpener 未配置');
  }

  await runTool({
    command: opener.command,
    args: [...opener.args, filePath],
  });
}
