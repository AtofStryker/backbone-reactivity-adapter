import { Model as BackboneModel } from "backbone";
import {
  defaults as _defaults,
  extend,
  uniqueId,
  result,
  clone,
  mapValues,
} from "lodash";

function attributesWithDefaults(attributes: any, defaults: any) {
  return _defaults(extend({}, defaults, attributes), defaults);
}

// our custom Backbone Model
export default BackboneModel.extend({
  constructor: function (attributes: any) {
    _defaults(this, {
      defaults: {},
      attributes: {},
      computed: {},
      changed: {},
    });

    extend(this, {
      cid: uniqueId(this.cidPrefix),
    });

    const defaults: any = result(this, "defaults");

    this.set(attributesWithDefaults(attributes, defaults));

    this.initialize.apply(this, arguments);
  },
  toJSON() {
    const attributes = clone(this.attributes);
    const computed = mapValues(this.computed, (cp) => cp.call(this));
    return extend(attributes, computed);
  },
  get(attr: any) {
    if (this.attributes.hasOwnProperty(attr)) return this.attributes[attr];
    if (this.computed.hasOwnProperty(attr))
      return this.computed[attr].call(this);
    return undefined;
  },
  getRelationshipLink(relationName: string) {},
  getRelationship(relationName: any, strict = true) {},
  getRelationshipData(relationName: string, strict = true) {},
  getRelationshipType(relationName: string) {},
  hasRelated(relationName: string) {},
  getRelated(relationName: string, queryObj: Object) {},
  fetchRelated(relationName: String, queryObj: Object) {},
});
