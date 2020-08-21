import { camelCase, isFunction, isEqual } from "lodash";
import {
  ResourceModel as RawResourceModel,
  ParsedResourceModel,
  RelationshipModel,
  ResourceBaseModel,
  LinkRelationship,
} from "@atofstryker/json-api-types";

// create a unique symbol to house the proxy attributes, which can be only accessed in the scope of this file
// symbols cannot be accessed outside directly, but can be read on the object when debugging or using Object.getOwnPropertySymbols
const proxyAttrs: any = Symbol("[[proxyAttrs]]");

const camelToPascal = (camelCaseString: string): string => {
  return camelCaseString.charAt(0).toUpperCase() + camelCaseString.slice(1);
};

const traverse = (obj: any) => {
  let copy: { [index: string]: any } = {};

  Object.keys(obj).forEach((prop) => {
    if (isFunction(obj[prop]) && /[A-Z]/.test(prop[0])) {
      copy[prop] = obj[prop](relationshipHandlerInterceptor);
    } else {
      copy[prop] = obj[prop];
    }
  });

  return copy;
};

class BaseResourceModel {
  toJSON() {
    return traverse(this);
  }
}

// used to transform print objects as well as transform async function calls to raw objects
class RelationshipHandlerInterceptor {
  _relationshipHandler(data: ResourceBaseModel, links: LinkRelationship) {
    return {
      data,
      links,
    };
  }
}
const relationshipHandlerInterceptor = new RelationshipHandlerInterceptor();

export default class ResourceModelFactory {
  private _classRegistry: typeof Object[];
  private _relationshipHandler: Function;
  private _updateHandler: Function = () => {};

  constructor() {
    this._classRegistry = [];
    this._relationshipHandler = () => {};
  }

  registerUpdateHandler(handler: Function) {
    this._updateHandler = handler;
  }

  register(modelClass: any) {
    // extend the BaseResourceModel to get inherited methods
    modelClass.prototype.toJSON = BaseResourceModel.prototype.toJSON;
    modelClass.prototype;
    this._classRegistry.push(modelClass);
  }

  registerRelationshipHandler(handler: Function) {
    this._relationshipHandler = handler;
  }

  private _assignProperties(
    resource: { [key: string]: any },
    rootProxy: { [key: string]: any },
    blacklist: string[] = []
  ): void {
    const update = this._updateHandler;
    Object.getOwnPropertyNames(rootProxy).forEach((key) => {
      if (!blacklist.includes(key)) {
        Object.defineProperty(resource, key, {
          configurable: true, // eventually need to overwrite properties on object recreation
          enumerable: true, // support for Object.keys and other items that require enumerable props
          get() {
            return rootProxy[key];
          },
          set(value) {
            if (rootProxy[key] !== undefined && !isEqual(rootProxy[key],value)) {
              update(resource.type, resource.id, key, value);
              rootProxy[key] = value;
            }
          },
        });
      }
    });
  }

  private _assignRelationships(
    resource: { [key: string]: any },
    relationships: { [key: string]: RelationshipModel }
  ) {
    var factory = this;
    for (let key in relationships) {
      Object.defineProperty(resource, camelToPascal(camelCase(key)), {
        configurable: true,
        enumerable: true,
        value: (options?: { [key: string]: any }): Function => {
          const { data, links } = relationships[key];
          return options?._relationshipHandler
            ? options?._relationshipHandler(data, links)
            : factory._relationshipHandler(data, links, options);
          // check the cache to see if anything exists
          // if so, return it,
          // otherwise, fetch it and put it in the cache
        },
      });
    }
  }

  private _buildAttributes(
    parsedResource: ParsedResourceModel,
    blacklist: string[] = []
  ) {
    const attributes: any = {};
    Object.keys(parsedResource).forEach((key) => {
      if (/[a-z]/.test(key[0])) {
        // its a attribute
        if (!blacklist.includes(key)) {
          attributes[camelCase(key)] = parsedResource[key];
        }
      }
    });

    return attributes;
  }

  private _buildRelationships(parsedResource: ParsedResourceModel) {
    const relationships: any = {};
    for (let key in parsedResource) {
      if (/[A-Z]/.test(key[0])) {
        // its a relationship
        const data: Object[] | Object | Promise<any> = parsedResource[key];

        if (isFunction(data)) {
          relationships[camelCase(key)] = data(relationshipHandlerInterceptor);
        } else {
          relationships[camelCase(key)] = { data };
        }
      }
    }
    return relationships;
  }

  toParsedResourceModel(
    rootProxy: RawResourceModel,
    existingModel?: any
  ): ParsedResourceModel {
    let resource: { [key: string]: any };
    let ResourceClass = this._classRegistry.find((classes) => {
      return classes.name.toLowerCase() == rootProxy.type.toLowerCase();
    });

    if (!existingModel) {
      if (ResourceClass) {
        resource = new ResourceClass(rootProxy);
      } else {
        resource = new BaseResourceModel();
      }
    } else {
      resource = existingModel;

      // delete all the keys be reference
      Object.getOwnPropertyNames(resource).forEach((key) => {
        delete resource[key];
      });

      // if a registered class, make a new instance with the new proxy object and assign it to the previous object via reference
      if (ResourceClass) {
        resource = Object.assign(resource, new ResourceClass(rootProxy));
      }
    }
    // mutate the object
    // mutate object by reference (bad practice), but internally encapsulated to the factory
    this._assignProperties(resource, rootProxy, [
      "relationships",
      "attributes",
    ]);
    this._assignProperties(resource, rootProxy.attributes);
    this._assignRelationships(resource, rootProxy.relationships);

    Object.defineProperty(resource, proxyAttrs, {
      enumerable: false,
      writable: true,
      value: rootProxy.attributes,
    });

    return resource as ParsedResourceModel;
  }

  toRawResourceModel(
    parsedResource: ParsedResourceModel,
    serializeModelFields: boolean = false
  ): RawResourceModel {
    const blacklist = ["id", "type", "links"];

    let resourceToParse: ParsedResourceModel = parsedResource;
    if (!serializeModelFields) {
      //@ts-ignore
      let proxyKeys = parsedResource[proxyAttrs]
        ? Object.keys(parsedResource[proxyAttrs])
        : [];
      // if proxyKeys are available, iterate and remove from the model
      if (proxyKeys && proxyKeys.length > 0) {
        let copyObj: { [index: string]: any } = {};
        proxyKeys.forEach((key: string) => {
          copyObj[key] = parsedResource[key];
        });

        resourceToParse = copyObj as ParsedResourceModel;
      }
    }

    const relationships = this._buildRelationships(parsedResource);
    const attributes = this._buildAttributes(resourceToParse, blacklist);

    const rawResource: { [index: string]: any } = {
      attributes,
      relationships,
    };

    blacklist.forEach((key) => {
      if (parsedResource[key]) {
        rawResource[key] = parsedResource[key];
      }
    });

    return rawResource as RawResourceModel;
  }
}
