export interface Locale {
  language: string;
  name: string;
  entityNames: Record<string, string>;
  entityDescriptions: Record<string, string>;
  displayNames: Record<string, string>;
}
