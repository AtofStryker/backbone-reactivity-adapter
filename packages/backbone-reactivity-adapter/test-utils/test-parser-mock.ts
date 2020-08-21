import _ from "lodash";
import { ResourceModel as RawResourceModel } from "@atofstryker/json-api-types";

function camelize(str: string) {
  return str.replace(/-([a-z0-9])/g, (match) => match[1].toUpperCase());
}

export default class JsonApiParser {
  parse(resource: RawResourceModel) {
    let result: { [index: string]: any } = {};
    if (resource.attributes) {
      _.extend(result, resource.attributes);
    }
    result.id = resource.id;
    result._type = resource.type;
    if (resource.links && resource.links.self) {
      result._self = resource.links.self;
    }
    if (resource.relationships) {
      result.relationships = resource.relationships;
    }

    return this._parseWithNames(result);
  }

  _parseWithNames(obj: { [index: string]: any }) {
    return Object.keys(obj).reduce(
      (result: { [index: string]: any }, key: string) => {
        let value = obj[key];
        let newKey = camelize(key);

        if (_.isArray(value)) {
          value = value.map((item) => {
            if (_.isObject(item)) return this._parseWithNames(item);
            else return item;
          });
        } else if (_.isObject(value)) {
          value = this._parseWithNames(value);
        }

        result[newKey] = value;
        return result;
      },
      {}
    );
  }
}
