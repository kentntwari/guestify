export type IBaseService<K extends {}, R> = {
  [P in keyof K]: () => R | Promise<R>;
};

export abstract class Base {
  protected abstract mapError(...params: any[]): any;
}
