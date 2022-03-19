import { StatusEffect } from '@interfaces/status-effect';

export interface Throwable {
  slots: string[];
  /**
   * The impulse applied to the physics body of the item when thrown. Higher values make the item be thrown faster.
   * default: 1
   */
  throwForce: number;
  characterUsable?: boolean;
  canBeCombined?: boolean;
  removeOnCombined?: boolean;
  msg?: string;
  statusEffects?: StatusEffect[];
}
