export interface Explosion {
  range: number;
  force: number;
  /**
   * default: true
   */
  showEffects?: boolean;
  /**
   * default: true
   */
  shockwave?: boolean;
  /**
   * default: true
   */
  smoke?: boolean;
  /**
   * default: true
   */
  flames?: boolean;
  /**
   * default: true
   */
  sparks?: boolean;
  /**
   * default: true
   */
  underwaterBubble?: boolean;
  cameraShake?: number;
  /**
   * default: true
   */
  flash?: boolean;
  structureDamage?: number;
  /**
   * default: true
   */
  applyFireEffects?: boolean;
}
