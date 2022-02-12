import { isNilOrEmpty } from '@utils/object-utils';

export function getAttrValue(element: Element | undefined, attributeName: string): string | undefined {
  if (!element) {
    return undefined;
  }
  const lowerAttributeName = attributeName.toLowerCase();
  return Array.from(element.attributes).find((attribute) => attribute.name.toLowerCase() === lowerAttributeName)?.value;
}

export function getNumberValue(element: Element | undefined, attributeName: string): number | undefined {
  const value = getAttrValue(element, attributeName);
  if (isNilOrEmpty(value)) {
    return undefined;
  }
  return +value;
}

export function getBooleanValue(element: Element | undefined, attributeName: string): boolean | undefined {
  const value = getAttrValue(element, attributeName);
  if (isNilOrEmpty(value)) {
    return undefined;
  }
  return value === 'true';
}

export function getNumberArray(element: Element | undefined, attributeName: string): number[] | undefined {
  const value = getAttrValue(element, attributeName);
  if (isNilOrEmpty(value)) {
    return undefined;
  }
  return value
    .split(',')
    .map((v) => +v)
    .filter((number) => !Number.isNaN(number));
}
