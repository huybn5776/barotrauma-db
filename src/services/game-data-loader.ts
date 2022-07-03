import { ContentPackageEntry } from '@interfaces/content-package-entry';
import { getAttrValue } from '@utils/element-utils';

export async function loadContentPackage(files: Record<string, File>): Promise<ContentPackageEntry | undefined> {
  const contentPackageXmlFiles = Object.entries(files).filter(
    ([path]) => path.match(/Vanilla\s*\d*.xml/) || path.match(/(^|\/)filelist\.xml/),
  );
  if (!contentPackageXmlFiles.length) {
    return undefined;
  }

  const contentPackageFile = contentPackageXmlFiles.map(([, file]) => file);
  const contentPackageDocuments = await Promise.all(contentPackageFile.map(readXmlFile));
  const contentPackageEntries = contentPackageDocuments.map((contentPackageDocument) => {
    const contentPackageElement = contentPackageDocument.getElementsByTagName('contentpackage')[0];
    const path = getAttrValue(contentPackageElement, 'path');
    const isMod = getAttrValue(contentPackageElement, 'corePackage') || path?.startsWith('Mods');

    return {
      items: Array.from(contentPackageDocument.getElementsByTagName('Item'))
        .map((element) => element.getAttribute('file') || '')
        .filter((filePath) => isMod || filePath.startsWith('Content/Items/')),
      texts: Array.from(contentPackageDocument.getElementsByTagName('Text')).map(
        (element) => element.getAttribute('file') || '',
      ),
    };
  });

  const allItems = contentPackageEntries.flatMap(({ items }) => items);
  const allTexts = contentPackageEntries.flatMap(({ texts }) => texts);
  return { items: allItems, texts: allTexts };
}

export async function loadGameData(
  files: Record<string, File>,
  contentPackage?: ContentPackageEntry,
): Promise<{
  contentPackage: ContentPackageEntry | undefined;
  items: Record<string, File> | undefined;
  texts: Record<string, File> | undefined;
}> {
  const content = (await loadContentPackage(files)) || contentPackage;
  const items = content ? loadFiles(files, content.items) : undefined;
  const texts = content ? loadFiles(files, content.texts) : undefined;
  return { contentPackage: content, items, texts };
}

export function readXmlFile(file: File): Promise<Document> {
  return new Promise<Document>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new DOMParser().parseFromString(reader.result as string, 'text/xml'));
    reader.readAsText(file);
  });
}

function loadFiles(files: Record<string, File>, requiredPaths: string[]): Record<string, File> | undefined {
  const pathsToRemove = ['Content/Items/', 'Content/Texts/', 'Mods/'];

  const textFileMap: Record<string, File> = {};
  const fileEntries = Object.entries(files);
  requiredPaths.forEach(async (filePath) => {
    const path = pathsToRemove.reduce((p, pathToRemove) => p.replace(pathToRemove, ''), filePath);
    const file = fileEntries.find(([p]) => p.match(`(^|/)${path}`))?.[1];
    if (file) {
      textFileMap[filePath] = file;
    }
  });

  return textFileMap;
}
