import ResourceModelFactory from "./index";
import { rawCar, resourceCar } from "../test-utils";

import { intersection } from "lodash";
// make a car class to test against on model registration
class Car {
  hotRod: boolean = true;
  name: string = "default_name";
  list: any[] = [{ name: "rodHot" }, { name: "schweet" }];
  speed: number = 180;

  get speedFormat() {
    return `${this.speed}mph! WOAH!`;
  }

  formatList() {
    return this.list.map((item) => {
      return item.name;
    });
  }
}

describe("ResourceModelFactory", () => {
  let factory: ResourceModelFactory;
  beforeEach(() => {
    factory = new ResourceModelFactory();
  });

  it("can parse a resourceModel", () => {
    const resourceModel = resourceCar();
    const rawResource = rawCar();
    const car = factory.toParsedResourceModel(rawResource);

    expect(typeof car.Driver).toBe("function");
    expect(typeof car.Wheels).toBe("function");

    const { Driver, Wheels, ...carWithoutRelationships } = car;

    const {
      Driver: resourceModelOwner,
      Wheels: resourceModelWheel,
      ...resourceModelWithoutRelationships
    } = resourceModel;

    expect(carWithoutRelationships).toEqual(resourceModelWithoutRelationships);
  });

  it("Can unwind a ResourceModel", () => {
    const rawResource = rawCar();
    const car = factory.toParsedResourceModel(rawResource);

    const unwindCar = factory.toRawResourceModel(car);
    expect(unwindCar).toEqual(rawResource);
  });

  it("Allows for object updates (Array)", () => {
    const rawResource = rawCar();
    const car = factory.toParsedResourceModel(rawResource);

    car.seats.push({});
    expect(rawResource.attributes.seats.pop()).toEqual({});

    car.seats[1].style.color = "yellow";
    expect(rawResource.attributes.seats[1].style.color).toEqual("yellow");
  });

  it("Allows for object updates (Array) via reassignment", () => {
    const rawResource = rawCar();
    const car = factory.toParsedResourceModel(rawResource);

    car.seats = ["a"];
    expect(rawResource.attributes.seats).toEqual(["a"]);
  });

  it("Allows for object updates (Object)", () => {
    const rawResource: any = rawCar();
    const car = factory.toParsedResourceModel(rawResource);

    car.availableTrims.xle = { a: 1 };
    expect(rawResource.attributes.availableTrims.xle).toEqual({ a: 1 });

    car.availableTrims.limited = {
      fancyCar: true,
    };
    expect(rawResource.attributes.availableTrims.limited).toEqual({
      fancyCar: true,
    });
  });

  it("Allows for object updates (Object) via reassignment", () => {
    const rawResource = rawCar();
    const car = factory.toParsedResourceModel(rawResource);

    car.availableTrims = { a: 1 };
    expect(rawResource.attributes.availableTrims).toEqual({ a: 1 });
  });

  /**
   * NOTE: Adding new properties to the root will NOT update the proxied to value (cache)
   * IF properties are needed, the property will need to be updated on the root ($store.update)
   * Or added to a model via 'register'
   *
   * If we ultimately need to sync newly added root properties to the root, we will need to use a Proxy, which aren't as nice to debug =/
   */
  it("Does not allow for object updates (Object) via assignment at root (use case for class models)", () => {
    const rawResource = rawCar();
    const car = factory.toParsedResourceModel(rawResource);

    car.newProperty = { a: 1 };
    //@ts-ignore
    expect(rawResource.attributes.newProperty).toBeUndefined();

    car.anotherProperty = [];
    //@ts-ignore
    expect(rawResource.attributes.anotherProperty).toBeUndefined();

    car.primitive = 6;
    //@ts-ignore
    expect(rawResource.attributes.primitive).toBeUndefined();
  });

  it("Allows for iteration/enumeration with all keys existing", () => {
    const resourceModel = resourceCar();
    const rawResource = rawCar();
    const car = factory.toParsedResourceModel(rawResource);

    // when no class/model is registered via factory.register
    expect(Object.keys(resourceModel).sort()).toEqual(Object.keys(car).sort());
  });

  it("formats objects to JSON correctly (relationships)", () => {
    const resourceModel = resourceCar();
    const rawResource = rawCar();
    const car = factory.toParsedResourceModel(rawResource);

    expect(typeof car.Driver).toBe("function");
    expect(typeof car.Wheels).toBe("function");
    expect(JSON.parse(JSON.stringify(car))).toEqual(resourceModel);
  });

  it("invokes relationship handler when relationship is requested", async () => {
    const relHandler = jest.fn();

    factory.registerRelationshipHandler(relHandler);

    const rawResource = rawCar();
    const car = factory.toParsedResourceModel(rawResource);
    expect(typeof car.Driver).toBe("function");
    expect(typeof car.Wheels).toBe("function");

    relHandler.mockImplementation((data: any, links: any, options: any) => {
      expect(data).toEqual(rawResource.relationships.driver.data);
      expect(links).toEqual(rawResource.relationships.driver.links);
      expect(options).toBeUndefined;
      return Promise.resolve({ driver: true });
    });
    const driver = await car.Driver();
    expect(driver).toEqual({ driver: true });
    expect(relHandler).toHaveBeenCalledTimes(1);

    relHandler.mockImplementation((data: any, links: any, options: any) => {
      expect(data).toEqual(rawResource.relationships.wheels.data);
      expect(links).toEqual(rawResource.relationships.wheels.links);
      expect(options).toBeUndefined;
      return Promise.resolve([1, 2, 3, 4]);
    });

    const wheels = await car.Wheels();
    expect(wheels).toEqual([1, 2, 3, 4]);
    expect(relHandler).toHaveBeenCalledTimes(2);
  });

  it("Allows for custom handler to be passed in via options (used internally) without options being propagated", async () => {
    const relHandler = jest.fn();

    const rawResource = rawCar();
    const car = factory.toParsedResourceModel(rawResource);

    relHandler.mockImplementation((data: any, links: any, options: any) => {
      expect(options).toBeUndefined();
      return Promise.resolve();
    });
    await car.Driver({
      _relationshipHandler: relHandler,
    });
  });

  it("Does not explode when a custom handler is not passed in", async () => {
    const rawResource = rawCar();
    const car = factory.toParsedResourceModel(rawResource);

    expect(async () => {
      await car.Driver();
    }).not.toThrowError();
  });

  describe("resourceClasses", () => {
    it("allows for registration of resource classes and instantiate types as that class, mapping class name to JSON API object type", () => {
      factory.register(Car);
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      const factory2 = new ResourceModelFactory();
      const rawResource2 = rawCar();
      const car2 = factory2.toParsedResourceModel(rawResource2);

      expect(JSON.parse(JSON.stringify(car))).toMatchObject(
        JSON.parse(JSON.stringify(car2))
      );
    });

    it("has defaults properties, some which are overwritten on model parse if existing on resource", () => {
      factory.register(Car);
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      expect(car.name).toEqual("Dodge");
      expect(car.hotRod).toEqual(true);
      expect(car.speed).toEqual(180);
      expect(car.speedFormat).toEqual("180mph! WOAH!");
      expect(car.list).toEqual([{ name: "rodHot" }, { name: "schweet" }]);
      expect(typeof car.formatList).toEqual("function");

      const factory2 = new ResourceModelFactory();
      const rawResource2 = rawCar();
      const car2 = factory2.toParsedResourceModel(rawResource2);

      expect(car2.name).toEqual("Dodge");
      expect(car2.hotRod).toBeUndefined();
      expect(car2.speed).toBeUndefined();
      expect(car2.speedFormat).toBeUndefined();
      expect(car2.list).toBeUndefined();
      expect(typeof car2.formatList).toEqual("undefined");

      const rawResource3 = rawCar();
      delete rawResource3.attributes.name;

      const car3 = factory.toParsedResourceModel(rawResource3);

      expect(car3.name).toEqual("default_name");
    });

    it("can parse a resourceModel", () => {
      factory.register(Car);
      const resourceModel = resourceCar();
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      expect(typeof car.Driver).toBe("function");
      expect(typeof car.Wheels).toBe("function");

      const { Driver, Wheels, ...carWithoutRelationships } = car;

      const {
        Driver: resourceModelOwner,
        Wheels: resourceModelWheel,
        ...resourceModelWithoutRelationships
      } = resourceModel;

      expect(carWithoutRelationships).toMatchObject(
        resourceModelWithoutRelationships
      );
    });

    it("Can unwind a ResourceModel class instance to the rootKeys ", () => {
      factory.register(Car);
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      const unwindCar = factory.toRawResourceModel(car);
      expect(unwindCar).toEqual(rawResource);
      expect(unwindCar.attributes.hotRod).toBeUndefined();
      expect(unwindCar.attributes.string).not.toEqual("default_name");
      expect(unwindCar.attributes.list).toBeUndefined();
      expect(unwindCar.attributes.speed).toBeUndefined();
    });

    it("Can unwind a ResourceModel class instance to the rootKeys, as well as serializing model properties", () => {
      factory.register(Car);
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      const unwindCar = factory.toRawResourceModel(car, true);
      expect(unwindCar).toMatchObject(rawResource);
      expect(unwindCar.attributes.hotRod).toEqual(true);
      expect(unwindCar.attributes.string).not.toEqual("default_name");
      expect(unwindCar.attributes.list).toEqual([
        { name: "rodHot" },
        { name: "schweet" },
      ]);
      expect(unwindCar.attributes.speed).toEqual(180);
    });

    it("Allows for object updates (Array)", () => {
      factory.register(Car);
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      car.seats.push({});
      expect(rawResource.attributes.seats.pop()).toEqual({});

      car.seats[1].style.color = "yellow";
      expect(rawResource.attributes.seats[1].style.color).toEqual("yellow");
    });

    it("Allows for object updates (Array) via reassignment", () => {
      factory.register(Car);
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      car.seats = ["a"];
      expect(rawResource.attributes.seats).toEqual(["a"]);
    });

    it("Allows for object updates (Object)", () => {
      factory.register(Car);
      const rawResource: any = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      car.availableTrims.xle = { a: 1 };
      expect(rawResource.attributes.availableTrims.xle).toEqual({ a: 1 });

      car.availableTrims.limited = {
        fancyCar: true,
      };
      expect(rawResource.attributes.availableTrims.limited).toEqual({
        fancyCar: true,
      });
    });

    it("Allows for object updates (Object) via reassignment", () => {
      factory.register(Car);
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      car.availableTrims = { a: 1 };
      expect(rawResource.attributes.availableTrims).toEqual({ a: 1 });
    });

    /**
     * See above for updating object root via assignment
     */
    it("Does not allow for object updates (Object) via assignment at root (use case for class models)", () => {
      factory.register(Car);
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      car.newProperty = { a: 1 };
      //@ts-ignore
      expect(rawResource.attributes.newProperty).toBeUndefined();

      car.anotherProperty = [];
      //@ts-ignore
      expect(rawResource.attributes.anotherProperty).toBeUndefined();

      car.primitive = 6;
      //@ts-ignore
      expect(rawResource.attributes.primitive).toBeUndefined();
    });

    /**
     * See above for updating object root via assignment
     */
    it("Does not allow for object updates (Object) via assignment at root For calculated model properties", () => {
      factory.register(Car);
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      car.list = [1, 2, 3, 4];
      //@ts-ignore
      expect(rawResource.attributes.newProperty).toBeUndefined();
    });

    it("Allows for iteration/enumeration with all keys existing", () => {
      factory.register(Car);
      const resourceModel = resourceCar();
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      // when a class is registered, it should contain all the keys the base resource would contain
      const matchedKeys = intersection(
        Object.keys(car).sort(),
        Object.keys(resourceModel).sort()
      );
      expect(matchedKeys).toEqual(Object.keys(resourceModel).sort());
    });

    it("formats objects to JSON correctly (relationships)", () => {
      factory.register(Car);
      const resourceModel = resourceCar();
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);

      expect(typeof car.Driver).toBe("function");
      expect(typeof car.Wheels).toBe("function");
      expect(JSON.parse(JSON.stringify(car))).toMatchObject(resourceModel);
    });
  });

  describe("forced model updating", () => {
    it("updates an existing model via reference", () => {
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);
      const previousCarValue = JSON.parse(JSON.stringify(car));

      const rawResource2 = rawCar();
      rawResource2.attributes.name = "TEST";
      rawResource2.attributes.color = "green";
      const car2 = factory.toParsedResourceModel(rawResource2, car);
      const newCarValue = JSON.parse(JSON.stringify(car));

      expect(car2 === car).toBe(true);
      expect(car.name).toEqual("TEST");
      expect(car.color).toEqual("green");
      expect(previousCarValue).not.toEqual(newCarValue);
    });

    it("updates an existing model with registered class via reference", () => {
      factory.register(Car);
      const rawResource = rawCar();
      const car = factory.toParsedResourceModel(rawResource);
      const previousCarValue = JSON.parse(JSON.stringify(car));

      const rawResource2 = rawCar();
      rawResource2.attributes.name = "TEST";
      rawResource2.attributes.color = "green";
      const car2 = factory.toParsedResourceModel(rawResource2, car);
      const newCarValue = JSON.parse(JSON.stringify(car));

      expect(car2 === car).toBe(true);
      expect(car.name).toEqual("TEST");
      expect(car.color).toEqual("green");
      expect(previousCarValue).not.toEqual(newCarValue);
    });
  });

  describe('update handler registration', () => {
    it('registers an update handler and is invoked appropriate when the model updates', () => {
      const car = rawCar();
      const updateHandler = jest.fn()
      factory.registerUpdateHandler(updateHandler);

      const rawResource = factory.toParsedResourceModel(car);

      rawResource.color = "green"
      
      expect(updateHandler).toHaveBeenCalledTimes(1)
      expect(updateHandler).toHaveBeenCalledWith(rawResource.type, rawResource.id, "color", "green")
    })
  })
});
