export class StartupBlockedError extends Error {
  readonly code = 'INTERNAL_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'StartupBlockedError';
  }
}
