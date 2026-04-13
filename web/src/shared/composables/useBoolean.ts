import { ref } from 'vue';

export function useBoolean(initialValue = false) {
  const value = ref(initialValue);

  function set(nextValue: boolean) {
    value.value = nextValue;
  }

  function on() {
    value.value = true;
  }

  function off() {
    value.value = false;
  }

  function toggle() {
    value.value = !value.value;
  }

  return {
    value,
    set,
    on,
    off,
    toggle,
  };
}

