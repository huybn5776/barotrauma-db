import { StatusEffect } from '@interfaces/status-effect';

export interface ItemComponent {
  /**
   * default: true
   */
  characterUsable?: boolean;
  statusEffects?: StatusEffect[];
}
