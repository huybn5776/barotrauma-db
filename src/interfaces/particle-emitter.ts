export interface ParticleEmitter {
  particle: string;
  angleMin?: number;
  angleMax?: number;
  distanceMin?: number;
  distanceMax?: number;
  velocityMin?: number;
  velocityMax?: number;
  /**
   * default: 1
   */
  scaleMin?: number;
  /**
   * default: 1
   */
  scaleMax?: number;
  /**
   * default: 1.1
   */
  scaleMultiplier?: number[];
  emitInterval?: number;
  /**
   * The number of particles to spawn per frame, or every x seconds if EmitInterval is set.
   */
  particleAmount?: number;
  particlesPerSecond?: number;
  /**
   * If larger than 0, a particle is spawned every x pixels across the ray cast by a hitscan weapon.
   */
  emitAcrossRayInterval?: number;
  /**
   * Delay before the emitter becomes active after being created.
   */
  initialDelay?: number;
  drawOnTop?: boolean;
  copyEntityAngle?: boolean;
  /**
   * default: 1,1,1,1
   */
  colorMultiplier?: number[];
}
