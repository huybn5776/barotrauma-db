import { Ref, watch } from 'vue';

import { Subscription, fromEvent, merge, take, filter } from 'rxjs';

import { useUntilDestroyed } from '@compositions/use-until-destroyed';

interface ClickOutsideOptions {
  containerElement?: Ref<HTMLElement>;
  element: Ref<HTMLElement | undefined>;
  whenToListen: Ref<boolean>;
  clickOutsideCallback: (event: MouseEvent) => void;
}

export function useClickOutside(options: ClickOutsideOptions): void {
  let subscription: Subscription | undefined;
  const untilDestroyed = useUntilDestroyed();

  watch(options.whenToListen, () => {
    if (options.whenToListen.value) {
      subscription = subscriptToClickOutsideEvents();
    } else {
      subscription?.unsubscribe();
    }
  });

  function subscriptToClickOutsideEvents(): Subscription {
    const containerElement = options.containerElement?.value || document.body;
    const { element } = options;
    return merge(
      fromEvent<MouseEvent>(containerElement, 'mousedown'),
      fromEvent<MouseEvent>(containerElement, 'touchdown'),
    )
      .pipe(
        filter((event) => !element.value?.contains(event.target as HTMLElement)),
        take(1),
        untilDestroyed(),
      )
      .subscribe(options.clickOutsideCallback);
  }
}
