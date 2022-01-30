export function isElementVisible(element: HTMLElement, containerElement: HTMLElement = document.body): boolean {
  const { top, bottom, height } = element.getBoundingClientRect();
  const holderRect = containerElement.getBoundingClientRect();
  return top <= holderRect.top ? holderRect.top - top <= height : bottom - holderRect.bottom <= height;
}
