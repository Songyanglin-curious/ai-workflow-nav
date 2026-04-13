import type { App } from 'vue';

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

export function installAppErrorHandler(app: App): void {
  app.config.errorHandler = (error, _instance, info) => {
    console.error('[web] 应用运行异常', {
      info,
      error: formatError(error),
    });
  };

  window.addEventListener('error', (event) => {
    console.error('[web] 未捕获异常', formatError(event.error));
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[web] 未处理的异步异常', formatError(event.reason));
  });
}
