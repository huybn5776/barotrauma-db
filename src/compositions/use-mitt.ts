import { onUnmounted } from 'vue';

import mitt, { Emitter, EventType } from 'mitt';

const emitter = mitt();

export function useMitt(): { emitter: Emitter<Record<EventType, unknown>>; onEvent: typeof onEvent } {
  const mittSubscriptions: { eventType: string; callback: () => void }[] = [];

  onUnmounted(() => mittSubscriptions.forEach(({ eventType, callback }) => emitter.off(eventType, callback)));

  function onEvent(eventType: string, callback: () => void): void {
    emitter.on(eventType, callback);
    mittSubscriptions.push({ eventType, callback });
  }

  return { emitter, onEvent };
}
