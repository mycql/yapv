export type ComponentRenderer<T, U, V> = (params: T, context: U) => Promise<V>;
