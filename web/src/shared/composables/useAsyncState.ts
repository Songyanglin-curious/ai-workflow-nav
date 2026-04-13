import { readonly, ref, shallowRef } from 'vue';

export interface AsyncStateOptions<TValue> {
  initialValue?: TValue;
}

export function useAsyncState<TValue>(options: AsyncStateOptions<TValue> = {}) {
  const value = ref<TValue | undefined>(options.initialValue);
  const pending = ref(false);
  const error = shallowRef<Error | null>(null);

  async function run<TNext = TValue>(task: Promise<TNext> | (() => Promise<TNext>)): Promise<TNext> {
    pending.value = true;
    error.value = null;

    try {
      const promise = typeof task === 'function' ? task() : task;
      const nextValue = await promise;
      value.value = nextValue as TValue;
      return nextValue;
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('异步任务失败');
      throw error.value;
    } finally {
      pending.value = false;
    }
  }

  function reset(nextValue?: TValue) {
    value.value = nextValue ?? options.initialValue;
    error.value = null;
    pending.value = false;
  }

  return {
    value: readonly(value),
    pending: readonly(pending),
    error: readonly(error),
    run,
    reset,
  };
}

