import { ref, Ref } from 'vue';

import { fromEvent, take, Subject, takeUntil } from 'rxjs';

import { useUntilDestroyed } from '@compositions/use-until-destroyed';
import { isNotNilOrEmpty } from '@utils/object-utils';

export function useHighlightItem(animationClassName: string): {
  highlightItem: Ref<string | undefined>;
  highLightOneItem: (identifier: string) => void;
} {
  const untilDestroyed = useUntilDestroyed();
  const highlightItem = ref<string>();
  const nextHeightLight$$ = new Subject<void>();

  function highLightOneItem(identifier: string): void {
    highlightItem.value = identifier;
    nextHeightLight$$.next();
    const targetElement = document.getElementById(identifier);
    if (!targetElement) {
      console.warn('Cannot find animationEnd event source element');
      return;
    }
    Array.from(document.getElementsByClassName(animationClassName))
      .map((element) => element.getAnimations()[0])
      .filter(isNotNilOrEmpty)
      .filter((animation) => animation.playState === 'running')
      .forEach((runningAnimation) => {
        runningAnimation.cancel();
        runningAnimation.play();
      });

    fromEvent(targetElement, 'animationend')
      .pipe(take(1), takeUntil(nextHeightLight$$), untilDestroyed())
      .subscribe(() => (highlightItem.value = undefined));
  }
  return { highlightItem, highLightOneItem };
}
