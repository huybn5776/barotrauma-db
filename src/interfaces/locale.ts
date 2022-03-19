export interface Locale {
  language: string;
  name: string;
  entityNames: Record<string, string>;
  entityDescriptions: Record<string, string>;
  displayNames: Record<string, string>;
  afflictionNames: Record<string, string>;
  afflictionDescriptions: Record<string, string>;
}
