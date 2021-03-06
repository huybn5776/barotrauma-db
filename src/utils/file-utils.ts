import { indexBy } from 'ramda';

export async function getFilesFromDataTransfer(
  dataTransfer: DataTransfer,
  filter?: (fileName: string) => boolean,
): Promise<Record<string, File>> {
  const itemEntries = Array.from(dataTransfer.items).map((item) => item.webkitGetAsEntry() as FileSystemEntry);
  return (await Promise.all(itemEntries.map((entry) => scanFiles(entry, filter)))).reduce((filesMap, newFiles) => ({
    ...filesMap,
    ...newFiles,
  }));
}

function scanFiles(itemEntry: FileSystemEntry, filter?: (fileName: string) => boolean): Promise<Record<string, File>> {
  if (itemEntry.isDirectory) {
    return scanDirectory(itemEntry as FileSystemDirectoryEntry, filter);
  }
  const fileEntry = itemEntry as FileSystemFileEntry;
  if (filter?.(fileEntry.name) === false) {
    return Promise.resolve({});
  }
  return new Promise((resolve, reject) => {
    fileEntry.file((file) => resolve({ [file.name]: file }), reject);
  });
}

async function scanDirectory(
  itemEntry: FileSystemDirectoryEntry,
  filter?: (fileName: string) => boolean,
): Promise<Record<string, File>> {
  const files: Record<string, File> = {};
  const reader = itemEntry.createReader();

  const readDirectory = (): Promise<void> => {
    return new Promise<void>((resolve) => {
      reader.readEntries(async (entries) => {
        if (!entries.length) {
          resolve();
          return;
        }
        const directoryFilesArray = await Promise.all(entries.map((entry) => scanFiles(entry, filter)));
        directoryFilesArray.forEach((directoryFiles) => {
          Object.entries(directoryFiles).forEach(([directoryFilePath, file]) => {
            const filePath = `${itemEntry.name}/${directoryFilePath}`;
            files[filePath] = file;
          });
        });
        await readDirectory();
        resolve();
      });
    });
  };
  await readDirectory();

  return files;
}

export function saveDataToJsonFile(data: unknown, config: { fileName?: string; space?: number }): void {
  const json = config.space ? JSON.stringify(data, null, config.space) : JSON.stringify(data);
  const blob = new Blob([`${json}\n`], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  downloadFile(url, `${config.fileName}.json`);
}

export function downloadFile(url: string, fileName: string): void {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.href = url;
  a.download = fileName;
  a.click();

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  });
}

export function selectFile(config?: {
  fileType?: string;
  multiple?: boolean;
  directory?: boolean;
}): Promise<Record<string, File>> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = config?.fileType ? `.${config.fileType}` : '';
    input.multiple = config?.multiple || input.multiple;
    input.webkitdirectory = config?.directory || input.webkitdirectory;
    input.onchange = () => {
      const files = Array.from(input.files || []);
      if (config?.directory) {
        const filesMap = indexBy((file) => file.webkitRelativePath, files);
        resolve(filesMap);
      } else {
        const file = files[0];
        resolve({ [file.name]: file });
      }
    };
    input.click();
  });
}
