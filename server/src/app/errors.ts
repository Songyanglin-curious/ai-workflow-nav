export class AppBootstrapError extends Error {
  constructor(cause: unknown) {
    super('应用启动失败。', { cause });
    this.name = 'AppBootstrapError';
  }
}
