export default class ProxyCache<X extends Object, Y, Z> {
  private _resourceModelCache: WeakMap<X, [X | null, Y | null, Z | null]>;

  constructor() {
    this._resourceModelCache = new WeakMap<X, [X | null, Y | null, Z | null]>();
  }

  getModelFromCache(root: X, index: number): X | Y | Z | null {
    let cachedTriple = this._resourceModelCache.get(root);
    return cachedTriple ? cachedTriple[index] : null;
  }

  setModelInCache(root: X, value: X | Y | Z, index?: number) {
    let cachedTriple = this._resourceModelCache.get(root);

    if (!cachedTriple) {
      cachedTriple = [null, null, null];
    }
    if (index != null) {
      cachedTriple[index] = value;
    }
    this._resourceModelCache.set(root, cachedTriple);
  }
}
