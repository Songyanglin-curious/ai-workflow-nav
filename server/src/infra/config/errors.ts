export class ConfigFileNotFoundError extends Error {
  constructor(configPath: string) {
    super(`配置文件不存在：${configPath}`);
    this.name = 'ConfigFileNotFoundError';
  }
}

export class ConfigParseError extends Error {
  constructor(configPath: string, cause: unknown) {
    super(`配置文件解析失败：${configPath}`, { cause });
    this.name = 'ConfigParseError';
  }
}

export class ConfigValidationError extends Error {
  constructor(configPath: string, cause: unknown) {
    super(`配置文件校验失败：${configPath}`, { cause });
    this.name = 'ConfigValidationError';
  }
}
