import { RelationType } from '@enums/relation-type';
import { StatusEffect } from '@interfaces/status-effect';

export interface RelatedItem {
  identifiers?: string[];
  items?: string[];
  type: RelationType;
  optional?: boolean;
  matchOnEmpty?: boolean;
  /**
   * default: true
   */
  excludeBroken?: boolean;
  excludedIdentifiers?: string[];
  msg?: string;
  statusEffects?: StatusEffect[];
}
