import { InjectionKey } from 'vue';

export const provideGetLocaleFileKey: InjectionKey<(path: string) => Promise<string | null>> =
  Symbol('provideGetLocaleFileKey');
