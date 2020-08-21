import { Model } from "backbone";
import ProxyCache from "../proxy-cache";

export interface JSONAPIResource {
  [index: string]: any;
  attributes: { [index: string]: any };
}
export default class ReactivityAdapter<
  X extends JSONAPIResource,
  T extends Model,
  Y extends Object
> {
  private _proxyCache: ProxyCache<X, T, Y>;
  private _backboneConstructor: (...args: any[]) => T;
  private _resourceModelConstructor: (...args: any[]) => Y;

  constructor(
    backboneConstructor: (...args: any[]) => T,
    resourceModelConstructor: (...args: any[]) => Y
  ) {
    this._proxyCache = new ProxyCache<X, T, Y>();
    this._backboneConstructor = backboneConstructor;
    this._resourceModelConstructor = resourceModelConstructor;
  }

  private _makeOrGetResourceModelReactive(root: X): X {
    const proxyRef = this._proxyCache;
    let cachedAttrsModel = proxyRef.getModelFromCache(root, 0) as X;

    if (!cachedAttrsModel) {
      var validator: ProxyHandler<any> = {
        // provide a deep proxy watcher to get attribute mutations
        get(target, key) {
          if (typeof target[key] === "object" && target[key] !== null) {
            return new Proxy(target[key], validator);
          } else {
            return target[key];
          }
        },
        set(target, key: string, value, receiver) {
          const backboneModel = proxyRef.getModelFromCache(root, 1) as T;
          // sync the backbone model when attrs are updated from a third-party source
          if (
            backboneModel &&
            backboneModel.changed &&
            backboneModel.attributes[key] !== undefined &&
            backboneModel.changed[key] !== value
          ) {
            backboneModel.set(key, value);
          }

          return Reflect.set(target, key, value, receiver);
        },
      };

      cachedAttrsModel = new Proxy(root, validator);
      proxyRef.setModelInCache(root, cachedAttrsModel, 0);
    }

    return cachedAttrsModel;
  }

  private _forceFullUpdate(root: X, returnBackboneModel: boolean = false) {
    let rootProxy = this._makeOrGetResourceModelReactive(root) as X;
    let cachedRootBackboneModel = this._proxyCache.getModelFromCache(root, 1);
    let cachedRootObjectModel = this._proxyCache.getModelFromCache(root, 2);
    let resourceModel, backboneModel;

    if (cachedRootObjectModel) {
      resourceModel = this._resourceModelConstructor(
        rootProxy,
        cachedRootObjectModel
      );
      this._proxyCache.setModelInCache(root, resourceModel, 2);
    }

    if (cachedRootBackboneModel) {
      backboneModel = this._backboneConstructor(
        rootProxy,
        cachedRootBackboneModel
      );
      this._proxyCache.setModelInCache(root, backboneModel, 1);
    }

    return returnBackboneModel ? (backboneModel as T) : (resourceModel as Y);
  }

  BackboneModel(root: X, forceFullUpdate: boolean = false): T {
    let rootProxy = this._makeOrGetResourceModelReactive(root) as X;
    let cachedRootBackboneModel = this._proxyCache.getModelFromCache(root, 1);

    let backboneModel: T;
    if (cachedRootBackboneModel) {
      if (forceFullUpdate) {
        return this._forceFullUpdate(root, true) as T;
      } else {
        backboneModel = cachedRootBackboneModel as T;
      }
    } else {
      backboneModel = this._backboneConstructor(rootProxy);
      this._proxyCache.setModelInCache(root, backboneModel, 1);
    }
    return backboneModel;
  }

  // only need to use forceFullUpdate when performing an update from models being merged in from the server
  ResourceModel(root: X, forceFullUpdate: boolean = false): Y {
    let rootProxy = this._makeOrGetResourceModelReactive(root) as X;
    let cachedRootObjectModel = this._proxyCache.getModelFromCache(root, 2);

    let model: Y;
    if (cachedRootObjectModel) {
      if (forceFullUpdate) {
        return this._forceFullUpdate(root, false) as Y;
      } else {
        model = cachedRootObjectModel as Y;
      }
    } else {
      model = this._resourceModelConstructor(rootProxy);
      this._proxyCache.setModelInCache(root, model, 2);
    }
    return model;
  }
}
