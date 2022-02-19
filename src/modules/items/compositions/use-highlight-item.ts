import { ref, Ref } from 'vue';

import { fromEvent, take, Subject, takeUntil } from 'rxjs';

import { useUntilDestroyed } from '@compositions/use-until-destroyed';
import { isElementVisible } from '@utils/dom-utils';
import { isNotNilOrEmpty } from '@utils/object-utils';

export function useHighlightItem(animationClassName: string): {
  highlightItem: Ref<string | undefined>;
  highLightOneItem: (event: MouseEvent, identifier: string) => void;
} {
  const untilDestroyed = useUntilDestroyed();
  const highlightItem = ref<string>();
  const nextHeightLight$$ = new Subject<void>();

  function highLightOneItem(event: MouseEvent, identifier: string): void {
    highlightItem.value = identifier;
    nextHeightLight$$.next();
    const targetElement = document.getElementById(identifier);
    if (!targetElement) {
      console.warn('Cannot find animationEnd event source element');
      return;
    }
    event.preventDefault();

    scrollToCenterOfPageIfNotVisible(targetElement);
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

function scrollToCenterOfPageIfNotVisible(targetElement: HTMLElement): void {
  const scrollContainer = document.getElementsByClassName('app')[0] as HTMLElement;
  if (isElementVisible(targetElement, scrollContainer)) {
    return;
  }
  scrollContainer.scrollTop =
    targetElement.offsetTop + (-scrollContainer.offsetHeight + targetElement.offsetHeight) / 2;
}
