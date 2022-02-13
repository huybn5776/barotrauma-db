import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { prop } from 'ramda';

import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import { distinctArray } from '@utils/array-utils';
import { isNotNil, indexWith } from '@utils/object-utils';

const dbName = 'data-source-db';
const dbItemsStore = 'items-store';
const dbLocaleStore = 'locales-store';
const dbFiledStore = 'files-store';

interface DataSourceDb extends DBSchema {
  [dbItemsStore]: {
    key: string;
    value: ItemPrefab;
  };
  [dbLocaleStore]: {
    key: string;
    value: Locale;
  };
  [dbFiledStore]: {
    key: string;
    value: {
      id: string;
      mimeType: string;
      dataURL: string;
    };
  };
}

export async function saveItemsToDb(items: ItemPrefab[]): Promise<void> {
  const db = await openDataSourceDb();
  const tx = db.transaction(dbItemsStore, 'readwrite');
  const store = tx.objectStore(dbItemsStore);
  await Promise.all(items.filter((item) => item.identifier).map((item) => store.put(item)));
  await tx.done;
}

export async function getItemsFromDb(): Promise<ItemPrefab[]> {
  const db = await openDataSourceDb();
  return db.getAll(dbItemsStore);
}

export async function saveLocalesToDb(locales: Locale[]): Promise<void> {
  const db = await openDataSourceDb();

  await Promise.all(
    locales.map((locale) => {
      const id = locale.language.replace(' ', '-').toLocaleLowerCase();
      return db.put(dbLocaleStore, { ...locale }, id);
    }),
  );
}

export async function getLocaleFromDb(language: string): Promise<Locale | undefined> {
  const db = await openDataSourceDb();
  return db.get(dbLocaleStore, language);
}

export async function saveFileToDb(path: string, file: Blob): Promise<void> {
  const db = await openDataSourceDb();
  const dataURL = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  await db.put(dbFiledStore, { id: path, mimeType: file.type, dataURL });
}

export async function getTexturesInDb(items: ItemPrefab[]): Promise<Record<string, string>> {
  const requiredTextures = distinctArray(
    items.flatMap((item) =>
      [item.sprite, item.infectedIcon, ...(item.containedSprites || []), ...(item.decorativeSprite || [])]
        .filter(isNotNil)
        .map(prop('texture')),
    ),
  );

  const texturesUrl = (
    await Promise.all(
      requiredTextures.map(async (texture) => {
        const url = await getFileURLFromDb(texture);
        if (!url) {
          return null;
        }
        return { texture, url };
      }),
    )
  ).filter(isNotNil);
  return indexWith(texturesUrl, prop('texture'), prop('url'));
}

export async function getFileURLFromDb(path: string): Promise<string | null> {
  const db = await openDataSourceDb();
  const fileData = await db.get(dbFiledStore, path);
  if (!fileData) {
    return null;
  }
  const blob = await (await fetch(fileData.dataURL)).blob();
  return URL.createObjectURL(blob);
}

function openDataSourceDb(): Promise<IDBPDatabase<DataSourceDb>> {
  return openDB<DataSourceDb>(dbName, 1, { upgrade });
}

function upgrade(db: IDBPDatabase<DataSourceDb>): void {
  db.createObjectStore(dbItemsStore, { keyPath: 'identifier' });
  db.createObjectStore(dbLocaleStore);
  db.createObjectStore(dbFiledStore, { keyPath: 'id' });
}

export async function getExtraItems(): Promise<ItemPrefab[]> {
  return [];
}
