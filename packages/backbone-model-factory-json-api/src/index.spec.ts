import BackboneModelFactory from "./index";
import JsonApiParserBackbone from '../test-utils/test-parser-mock'
import CustomBackboneModel from '../test-utils/test-model-mock'
import CustomModelInstance from '../test-utils/test-model-instance'
import { rawCar } from "../test-utils";

describe("BackboneModelFactory", () => {
  let factory: BackboneModelFactory<typeof CustomBackboneModel>;
  beforeEach(() => {
    const parser = new JsonApiParserBackbone();
    factory = new BackboneModelFactory(
      CustomBackboneModel,
      parser.parse.bind(parser)
    );
  });

  it("Can set a resource to a raw backbone model", () => {
    const car = rawCar();
    const backboneCar = factory.toParsedBackboneModel(car);

    expect(backboneCar.get("id")).toEqual(String(car.id));
    expect(backboneCar.get("_type")).toEqual(car.type);
    expect(backboneCar.get("_self")).toEqual(car.links.self);
    expect(backboneCar.get("availableTrims")).toEqual(
      car.attributes.availableTrims
    );
    expect(backboneCar.get("color")).toEqual(car.attributes.color);
    expect(backboneCar.get("model")).toEqual(car.attributes.model);
    expect(backboneCar.get("name")).toEqual(car.attributes.name);
    expect(backboneCar.get("seats")).toEqual(car.attributes.seats);
    expect(backboneCar.get("relationships")).toEqual(car.relationships);
  });

  it("Allows for object updates (Array)", () => {
    const car = rawCar();
    const backboneCar = factory.toParsedBackboneModel(car);

    const seats = backboneCar.get("seats");

    seats.push({});
    expect(car.attributes.seats.pop()).toEqual({});

    const car2 = rawCar();
    const backboneCar2 = factory.toParsedBackboneModel(car2);

    const seats2 = backboneCar2.get("seats");
    seats2[1].style.color = "yellow";
    expect(car2.attributes.seats[1].style.color).toEqual("yellow");
  });

  it("Allows for object updates (Array) via reassignment", () => {
    const car = rawCar();
    const backboneCar = factory.toParsedBackboneModel(car);

    backboneCar.set("seats", [1, 2]);
    expect(car.attributes.seats).toEqual([1, 2]);
  });

  it("Allows for object updates (Object)", () => {
    const car: any = rawCar();
    const backboneCar = factory.toParsedBackboneModel(car);

    const availableTrims = backboneCar.get("availableTrims");

    availableTrims.xle = { a: 1 };

    expect(car.attributes.availableTrims.xle).toEqual({ a: 1 });

    availableTrims.limited = {
      fancyCar: true,
    };
    expect(car.attributes.availableTrims.limited).toEqual({
      fancyCar: true,
    });
  });

  it("Allows for object updates (Object) via reassignment", () => {
    const car = rawCar();
    const backboneCar = factory.toParsedBackboneModel(car);

    backboneCar.set("availableTrims", { a: 1 });
    expect(car.attributes.availableTrims).toEqual({ a: 1 });
  });

  /**
   * NOTE: Adding new properties to the root will NOT update the proxied to value (cache)
   * IF properties are needed, the property will need to be updated on the root
   *
   * If we ultimately need to sync newly added root properties to the root, we will need to use a Proxy, which aren't as nice to debug =/
   */
  it("Does not allow for object updates (Object) via assignment at root (use case for class models)", () => {
    const car = rawCar();
    const backboneCar = factory.toParsedBackboneModel(car);

    backboneCar.set("newProperty", { a: 1 });
    //@ts-ignore
    expect(car.attributes.newProperty).toBeUndefined();

    backboneCar.set("anotherProperty", []);
    //@ts-ignore
    expect(car.attributes.anotherProperty).toBeUndefined();

    backboneCar.set("primitive", 6);
    //@ts-ignore
    expect(car.attributes.primitive).toBeUndefined();
  });

  it("Allows for iteration/enumeration with all keys existing", () => {
    const car = rawCar();
    const backboneCar = factory.toParsedBackboneModel(car);

    const validKeys = Object.keys(car.attributes);
    validKeys.push("relationships");
    validKeys.push("id");
    validKeys.push("_self");
    validKeys.push("_type");

    Object.keys(backboneCar.attributes).forEach((key) => {
      expect(validKeys.includes(key)).toEqual(true);
    });
  });

  it("formats objects to JSON correctly (relationships)", () => {
    const car = rawCar();
    const backboneCar = factory.toParsedBackboneModel(car);

    const printedCar = {
      id: car.id,
      _self: car.links.self,
      _type: car.type,
      ...car.attributes,
      relationships: car.relationships,
    };
    expect(JSON.parse(JSON.stringify(backboneCar))).toEqual(printedCar);
  });

  it("does not explode when a parser function is nopt provided", () => {
    factory = new BackboneModelFactory(CustomBackboneModel);
    const car = rawCar();

    expect(() => {
      factory.toParsedBackboneModel(car);
    }).not.toThrowError();
  });

  describe("forced model updating", () => {
    it("updates an existing model via reference", () => {
      const car = rawCar();
      const backboneCar = factory.toParsedBackboneModel(car);
      const previousCarValue = JSON.parse(JSON.stringify(car));

      const car2 = rawCar();
      car2.attributes.name = "TEST";
      car2.attributes.color = "green";

      const backboneCar2 = factory.toParsedBackboneModel(car2, backboneCar);
      const newCarValue = JSON.parse(JSON.stringify(backboneCar2));

      expect(backboneCar2 === backboneCar).toBe(true);
      expect(backboneCar.get("name")).toEqual("TEST");
      expect(backboneCar.get("color")).toEqual("green");
      expect(previousCarValue).not.toEqual(newCarValue);
    });
  });

  describe("model registration", () => {
    it("registers Models appropriately if existing", () => {
      const car = rawCar();
      factory.register("car", CustomModelInstance);

      const backboneCar = factory.toParsedBackboneModel(car);

      expect(backboneCar.get("id")).toEqual(String(car.id));
      expect(backboneCar.get("_type")).toEqual(car.type);
      expect(backboneCar.get("_self")).toEqual(car.links.self);
      expect(backboneCar.get("availableTrims")).toEqual(
        car.attributes.availableTrims
      );
      expect(backboneCar.get("color")).toEqual(car.attributes.color);
      expect(backboneCar.get("model")).toEqual(car.attributes.model);
      expect(backboneCar.get("name")).toEqual(car.attributes.name);
      expect(backboneCar.get("seats")).toEqual(car.attributes.seats);
      expect(backboneCar.get("relationships")).toEqual(car.relationships);

      expect(backboneCar.get("modelFormat")).toEqual(`Caravan, WOAH!`);
      expect(backboneCar.formatList()).toEqual([true, true, false, false]);
      expect(backboneCar.relationships).toEqual({
        wheels: "wheel",
        driver: "driver",
      });
    });
  });

  describe('update handler registration', () => {
    it('registers an update handler and is invoked appropriate when the model updates', () => {
      const car = rawCar();
      const updateHandler = jest.fn()
      factory.registerUpdateHandler(updateHandler);

      const backboneCar = factory.toParsedBackboneModel(car);

      backboneCar.set('color', "green")
      
      expect(updateHandler).toHaveBeenCalledTimes(1)
      expect(updateHandler).toHaveBeenCalledWith( backboneCar.get("_type"), backboneCar.id, "color", "green")
    })
  })
});
