import type { AppConfig } from '../../config/configSchema.js';
import { resolveWorkspacePath } from '../../infra/paths/workspacePaths.js';
import type { TestEchoBody, TestResolvePathBody } from './test.schemas.js';

export function getTestStatus() {
  return {
    module: 'test' as const,
    ok: true as const,
  };
}

export function echoTestMessage(body: TestEchoBody) {
  return {
    echoed: body.message,
  };
}

export function resolveTestPath(config: AppConfig, body: TestResolvePathBody) {
  return {
    relativePath: body.relativePath,
    absolutePath: resolveWorkspacePath(config, body.relativePath),
  };
}
