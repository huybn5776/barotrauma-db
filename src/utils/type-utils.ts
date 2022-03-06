export type OmitFirstArg<F> = F extends (x: never, ...args: infer P) => infer R ? (...args: P) => R : never;
