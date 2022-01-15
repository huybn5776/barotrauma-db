import { ContentPackageEntry } from '@interfaces/content-package-entry';

export async function loadContentPackage(files: Record<string, File>): Promise<ContentPackageEntry | undefined> {
  const contentPackageXml = Object.entries(files).find(([path]) => path.match(/Vanilla\s\d.+.xml/));
  if (!contentPackageXml) {
    return undefined;
  }

  const contentPackageFile = contentPackageXml[1];
  const contentPackageDocument = await readXmlFile(contentPackageFile);
  return {
    items: Array.from(contentPackageDocument.getElementsByTagName('Item'))
      .map((element) => element.getAttribute('file') || '')
      .filter((filePath) => filePath.startsWith('Content/Items/')),
    texts: Array.from(contentPackageDocument.getElementsByTagName('Text'))
      .map((element) => element.getAttribute('file') || '')
      .filter((filePath) => filePath.startsWith('Content/Texts/')),
  };
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
  const items = content ? loadFiles(files, content.items, 'Content/Items/') : undefined;
  const texts = content ? loadFiles(files, content.texts, 'Content/Texts/') : undefined;
  return { contentPackage: content, items, texts };
}

export function readXmlFile(file: File): Promise<Document> {
  return new Promise<Document>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new DOMParser().parseFromString(reader.result as string, 'text/xml'));
    reader.readAsText(file);
  });
}

function loadFiles(
  files: Record<string, File>,
  requiredPaths: string[],
  removePath: string,
): Record<string, File> | undefined {
  const textFileMap: Record<string, File> = {};
  const fileEntries = Object.entries(files);
  requiredPaths.forEach(async (filePath) => {
    const path = filePath.replace(removePath, '');
    const file = fileEntries.find(([p]) => p.match(`(^|/)${path}`))?.[1];
    if (file) {
      textFileMap[filePath] = file;
    }
  });
  return textFileMap;
}
