import { provide } from 'vue';

import { provideGetLocaleFileKey } from '@/symbols';
import { getFileURLFromDb } from '@services/locale-data-source-service';

export const provideLocaleFile = 'localeFileProvider';

export function useProvideLocaleFile(): void {
  const pathFileUrlMap: Record<string, Promise<string | null>> = {};

  async function getLocaleFileURL(path: string): Promise<string | null> {
    return pathFileUrlMap[path] ?? (pathFileUrlMap[path] = getFileURLFromDb(path));
  }

  provide(provideGetLocaleFileKey, getLocaleFileURL);
}
