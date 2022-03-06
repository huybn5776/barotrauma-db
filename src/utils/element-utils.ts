import { toLower } from 'ramda';

import { isNilOrEmpty, isNotNilOrEmpty } from '@utils/object-utils';
import { OmitFirstArg } from '@utils/type-utils';

export function createElementValueAccessor(element: Element): {
  string: OmitFirstArg<typeof getStringValue>;
  number: OmitFirstArg<typeof getNumberValue>;
  boolean: OmitFirstArg<typeof getBooleanValue>;
  numberArray: OmitFirstArg<typeof getNumberArray>;
  stringArray: OmitFirstArg<typeof getStringArray>;
  firstChildrenFor: <T>(tagName: string | string[], parser: (element: Element) => T | undefined) => T | undefined;
  multiChildrenFor: <T>(tagName: string | string[], parser: (element: Element) => T | undefined) => T[] | undefined;
} {
  return {
    string: (attributeName: string) => getStringValue(element, attributeName),
    number: (attributeName: string) => getNumberValue(element, attributeName),
    boolean: (attributeName: string) => getBooleanValue(element, attributeName),
    numberArray: (attributeName: string) => getNumberArray(element, attributeName),
    stringArray: (attributeName: string) => getStringArray(element, attributeName),
    firstChildrenFor: <T>(tagName: string | string[], parser: (element: Element) => T | undefined) =>
      getFirstChildrenFor<T>(element, tagName, parser),
    multiChildrenFor: <T>(tagName: string | string[], parser: (element: Element) => T | undefined) =>
      getMultiChildrenFor(element, tagName, parser),
  };
}

export function getAttrValue(element: Element | undefined, attributeName: string): string | undefined {
  if (!element) {
    return undefined;
  }
  const lowerAttributeName = attributeName.toLowerCase();
  return Array.from(element.attributes).find((attribute) => attribute.name.toLowerCase() === lowerAttributeName)?.value;
}

export function getStringValue(element: Element | undefined, attributeName: string): string | undefined {
  return getAttrValue(element, attributeName) || undefined;
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

export function getStringArray(element: Element | undefined, attributeName: string): string[] | undefined {
  const value = getAttrValue(element, attributeName);
  if (isNilOrEmpty(value)) {
    return undefined;
  }
  return value
    .split(',')
    .filter((str) => str)
    .map((str) => str.trim());
}

export function getFirstChildrenFor<T>(
  node: ParentNode,
  tagName: string | string[],
  parser: (element: Element) => T | undefined,
): T | undefined {
  const firstChild = getChildrenOf(node, tagName)[0];
  return firstChild ? parser(firstChild) : undefined;
}

export function getMultiChildrenFor<T>(
  node: ParentNode,
  tagName: string | string[],
  parser: (element: Element) => T | undefined,
): T[] | undefined {
  const children = getChildrenOf(node, tagName);
  if (!children.length) {
    return undefined;
  }
  const parseResults = children.map(parser).filter(isNotNilOrEmpty);
  return parseResults.length ? parseResults : undefined;
}

export function getChildrenOf(node: ParentNode, tagName: string | string[]): Element[] {
  const tagNames = (Array.isArray(tagName) ? tagName : [tagName]).map(toLower);
  return Array.from(node.children).filter((e) => {
    const lowerTagName = e.tagName.toLowerCase();
    return tagNames.some((name) => name === lowerTagName);
  });
}
