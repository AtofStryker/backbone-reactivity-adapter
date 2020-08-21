import { ResourceModel as RawResourceModel } from "@atofstryker/json-api-types";
import { Model } from "backbone";
import { isEqual } from "lodash";

export default class BackboneModelFactory<T extends Model> {
  private _backboneModelContructor: new (...args: any) => T;
  // backbone.store parser.parse function
  private _parserFunc: Function | null;
  private _modelDefinitions: { [index: string]: any };
  private _updateHandler: Function = () => {};

  constructor(
    backboneModelContructor: new (...args: any) => T,
    parserFunc?: Function
  ) {
    this._backboneModelContructor = backboneModelContructor;
    this._parserFunc = parserFunc || null;
    this._modelDefinitions = {};
  }

  registerUpdateHandler(handler: Function) {
    this._updateHandler = handler;
  }

  register(modelName: string, definition: { [index: string]: any } = {}) {
    this._modelDefinitions[modelName] = definition;
  }

  private _assignProperties(
    resource: { [key: string]: any },
    rootProxy: { [key: string]: any },
    type: string,
    id: string | null
  ): void {
    const update = this._updateHandler;
    Object.getOwnPropertyNames(rootProxy).forEach((key) => {
      Object.defineProperty(resource, key, {
        configurable: true, // eventually need to overwrite properties on object recreation
        enumerable: true, // support for Object.keys and other items that require enumerable props
        get() {
          return rootProxy[key];
        },
        set(value) {
          if (rootProxy[key] !== undefined && !isEqual(rootProxy[key], value)) {
            update(type, id, key, value);
            rootProxy[key] = value;
          }
        },
      });
    });
  }

  toParsedBackboneModel(rootProxy: RawResourceModel, existingModel?: T): T {
    let resource;

    if (this._parserFunc) {
      resource = this._parserFunc(rootProxy);
    } else {
      resource = rootProxy;
    }

    let backboneModel;
    if (existingModel) {
      const { relationships, ...propsToDelete } = existingModel.attributes;
      existingModel.set(propsToDelete, {
        unset: true,
      });
      existingModel.set(resource);
      this._assignProperties(
        existingModel.attributes,
        rootProxy.attributes,
        rootProxy.type,
        rootProxy.id
      );
      backboneModel = existingModel;
    } else {
      let modelDefinition = this._modelDefinitions[rootProxy.type];
      const modelConstructor = !modelDefinition
        ? this._backboneModelContructor
        : //@ts-ignore
          this._backboneModelContructor.extend(modelDefinition);
      backboneModel = new modelConstructor(resource);
      this._assignProperties(
        backboneModel.attributes,
        rootProxy.attributes,
        rootProxy.type,
        rootProxy.id
      );
    }
    return backboneModel;
  }
}
