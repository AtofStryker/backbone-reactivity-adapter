import ReactivityAdapter from "./index";
import ResourceFactory from '@atofstryker/pojo-model-factory-json-api'
import BackboneFactory from '@atofstryker/backbone-model-factory-json-api'
import { ResourceModel as RawResourceModel } from "@atofstryker/json-api-types";
import JsonApiParserBackbone from '../../test-utils/test-parser-mock'
import CustomBackboneModel from '../../test-utils/test-model-mock'

describe("Reactivity Adapter", () => {
  it("Demonstrates reactive properties between Backbone Model and Resource Model", () => {
    const modelFactory = new ResourceFactory();

    const jsonApiParserBackbone = new JsonApiParserBackbone();
    const backboneFactory = new BackboneFactory<typeof CustomBackboneModel>(
      CustomBackboneModel,
      jsonApiParserBackbone.parse.bind(jsonApiParserBackbone)
    );

    const reactivityAdapter = new ReactivityAdapter<
      RawResourceModel,
      typeof CustomBackboneModel,
      Object
    >(
      backboneFactory.toParsedBackboneModel.bind(backboneFactory),
      modelFactory.toParsedResourceModel.bind(modelFactory)
    );

    let jsonApiData: RawResourceModel = {
      id: "37",
      type: "cat",
      attributes: {
        name: "Garfield",
      },
      links: {
        self: "/api/cat/37/",
      },
      relationships: {
        owner: {
          data: {
            id: "84",
            type: "owner",
          },
          links: {
            related: "/api/cat/37/owner/",
            self: "/api/cat/37/relationships/owner/",
          },
        },
        paws: {
          data: [
            {
              id: "1",
              type: "paw",
            },
            {
              id: "2",
              type: "paw",
            },
            {
              id: "3",
              type: "paw",
            },
            {
              id: "4",
              type: "paw",
            },
          ],
          links: {
            related: "/api/cat/37/paws/",
            self: "/api/cat/37/relationships/paws/",
          },
        },
      },
    };
    let backboneProxy = reactivityAdapter.BackboneModel(jsonApiData);

    expect(jsonApiData.attributes.name).toEqual("Garfield");
    expect(backboneProxy.attributes.name).toEqual("Garfield");

    backboneProxy.set("name", "HelloKitty");

    expect(jsonApiData.attributes.name).toEqual("HelloKitty");

    //@ts-ignore
    expect(backboneProxy._previousAttributes.name).toEqual("Garfield");
    expect(backboneProxy.attributes.name).toEqual("HelloKitty");
    //@ts-ignore
    expect(backboneProxy.changed.name).toEqual("HelloKitty");

    backboneProxy.set("name", "GrumpyCat");

    expect(jsonApiData.attributes.name).toEqual("GrumpyCat");

    //@ts-ignore
    expect(backboneProxy._previousAttributes.name).toEqual("HelloKitty");
    expect(backboneProxy.attributes.name).toEqual("GrumpyCat");
    //@ts-ignore
    expect(backboneProxy.changed.name).toEqual("GrumpyCat");

    let backboneProxy2 = reactivityAdapter.BackboneModel(jsonApiData);

    expect(backboneProxy2).toStrictEqual(backboneProxy);

    backboneProxy2.set("name", "KeyboardCat");

    expect(jsonApiData.attributes.name).toEqual("KeyboardCat");

    //@ts-ignore
    expect(backboneProxy._previousAttributes.name).toEqual("GrumpyCat");
    expect(backboneProxy.attributes.name).toEqual("KeyboardCat");
    //@ts-ignore
    expect(backboneProxy.changed.name).toEqual("KeyboardCat");

    //@ts-ignore
    expect(backboneProxy2._previousAttributes.name).toEqual("GrumpyCat");
    expect(backboneProxy2.attributes.name).toEqual("KeyboardCat");
    //@ts-ignore
    expect(backboneProxy2.changed.name).toEqual("KeyboardCat");

    let pojoResource = reactivityAdapter.ResourceModel(jsonApiData) as any;

    pojoResource.name = "Nermal";

    expect(jsonApiData.attributes.name).toEqual("Nermal");

    //@ts-ignore
    expect(backboneProxy._previousAttributes.name).toEqual("KeyboardCat");
    expect(backboneProxy.attributes.name).toEqual("Nermal");
    //@ts-ignore
    expect(backboneProxy.changed.name).toEqual("Nermal");

    //@ts-ignore
    expect(backboneProxy2._previousAttributes.name).toEqual("KeyboardCat");
    expect(backboneProxy2.attributes.name).toEqual("Nermal");
    //@ts-ignore
    expect(backboneProxy2.changed.name).toEqual("Nermal");

    let pojoResource2 = reactivityAdapter.ResourceModel(jsonApiData) as any;

    expect(pojoResource2).toStrictEqual(pojoResource);

    pojoResource2.name = "Sylvester";

    expect(pojoResource.name).toEqual("Sylvester");
    expect(jsonApiData.attributes.name).toEqual("Sylvester");

    //@ts-ignore
    expect(backboneProxy._previousAttributes.name).toEqual("Nermal");
    expect(backboneProxy.attributes.name).toEqual("Sylvester");
    //@ts-ignore
    expect(backboneProxy.changed.name).toEqual("Sylvester");

    //@ts-ignore
    expect(backboneProxy2._previousAttributes.name).toEqual("Nermal");
    expect(backboneProxy2.attributes.name).toEqual("Sylvester");
    //@ts-ignore
    expect(backboneProxy2.changed.name).toEqual("Sylvester");
  });

  it("Sync models on updates to the cache with forceFullUpdate set to true on BackboneModel function", () => {
    const modelFactory = new ResourceFactory();

    const jsonApiParserBackbone = new JsonApiParserBackbone();
    const backboneFactory = new BackboneFactory<typeof CustomBackboneModel>(
      CustomBackboneModel,
      jsonApiParserBackbone.parse.bind(jsonApiParserBackbone)
    );

    const reactivityAdapter = new ReactivityAdapter<
      RawResourceModel,
      typeof CustomBackboneModel,
      Object
    >(
      backboneFactory.toParsedBackboneModel.bind(backboneFactory),
      modelFactory.toParsedResourceModel.bind(modelFactory)
    );

    let jsonApiData: RawResourceModel = {
      id: "37",
      type: "cat",
      attributes: {
        name: "Garfield",
        likesCatFood: true,
        numberOfLives: 9,
      },
      links: {
        self: "/api/cat/37/",
      },
      relationships: {
        owner: {
          data: {
            id: "84",
            type: "owner",
          },
          links: {
            related: "/api/cat/37/owner/",
            self: "/api/cat/37/relationships/owner/",
          },
        },
        paws: {
          data: [
            {
              id: "1",
              type: "paw",
            },
            {
              id: "2",
              type: "paw",
            },
            {
              id: "3",
              type: "paw",
            },
            {
              id: "4",
              type: "paw",
            },
          ],
          links: {
            related: "/api/cat/37/paws/",
            self: "/api/cat/37/relationships/paws/",
          },
        },
      },
    };

    let jsonApiDataCopy = { ...jsonApiData };

    let JsonApiDataUpdate = {
      ...jsonApiData,
      attributes: {
        name: "Nermal",
        numberOfLives: 7,
      },
    };
    let backboneProxy = reactivityAdapter.BackboneModel(jsonApiDataCopy);
    let pojoResource = reactivityAdapter.ResourceModel(jsonApiDataCopy) as any;

    // assign updates via reference
    Object.assign(jsonApiDataCopy, JsonApiDataUpdate);

    const updatedBackbone = reactivityAdapter.BackboneModel(
      jsonApiDataCopy,
      true
    );
    expect(backboneProxy.get("name")).toEqual("Nermal");
    expect(backboneProxy.get("numberOfLives")).toEqual(7);
    expect(pojoResource.name).toEqual("Nermal");
    expect(pojoResource.numberOfLives).toEqual(7);

    expect(backboneProxy == updatedBackbone).toEqual(true);

    let JsonApiDataUpdate2 = {
      ...jsonApiData,
      attributes: {
        name: "KittyCat",
        someObject: {
          prop1: 1,
          prop2: 2,
        },
      },
    };

    Object.assign(jsonApiDataCopy, JsonApiDataUpdate2);

    const updatedResouce = reactivityAdapter.ResourceModel(
      jsonApiDataCopy,
      true
    ) as any;
    expect(updatedBackbone.get("name")).toEqual("KittyCat");
    expect(updatedBackbone.get("someObject")).toEqual({
      prop1: 1,
      prop2: 2,
    });
    expect(backboneProxy.get("name")).toEqual("KittyCat");
    expect(backboneProxy.get("someObject")).toEqual({
      prop1: 1,
      prop2: 2,
    });
    expect(pojoResource.name).toEqual("KittyCat");
    expect(pojoResource.someObject).toEqual({
      prop1: 1,
      prop2: 2,
    });
    expect(updatedResouce.name).toEqual("KittyCat");
    expect(updatedResouce.someObject).toEqual({
      prop1: 1,
      prop2: 2,
    });

    expect(pojoResource == updatedResouce).toEqual(true);
  });

  it("Should NOT garbage collect the proxy cache to the RawResourceModel as a reference is still stored in memory", async () => {
    if (!global.gc) {
      return;
    }

    const modelFactory = new ResourceFactory();

    const jsonApiParserBackbone = new JsonApiParserBackbone();
    const backboneFactory = new BackboneFactory<typeof CustomBackboneModel>(
      CustomBackboneModel,
      jsonApiParserBackbone.parse.bind(jsonApiParserBackbone)
    );

    const reactivityAdapter = new ReactivityAdapter<
      RawResourceModel,
      typeof CustomBackboneModel,
      Object
    >(
      backboneFactory.toParsedBackboneModel.bind(backboneFactory),
      modelFactory.toParsedResourceModel.bind(modelFactory)
    );

    // use this to store a reference to the RawResourceModel within  `testGarbageCollection`
    const someCacheMap = new Map();

    function testGarbageCollection() {
      let jsonApiData: RawResourceModel = {
        id: "37",
        type: "cat",
        attributes: {
          name: "foo",
        },
        links: {
          self: "/api/cat/37/",
        },
        relationships: {
          owner: {
            data: {
              id: "84",
              type: "owner",
            },
            links: {
              related: "/api/cat/37/owner/",
              self: "/api/cat/37/relationships/owner/",
            },
          },
          paws: {
            data: [
              {
                id: "1",
                type: "paw",
              },
              {
                id: "2",
                type: "paw",
              },
              {
                id: "3",
                type: "paw",
              },
              {
                id: "4",
                type: "paw",
              },
            ],
            links: {
              related: "/api/cat/37/paws/",
              self: "/api/cat/37/relationships/paws/",
            },
          },
        },
      };

      // store the jsonAPIData object in this Map to act as a inMemCache
      someCacheMap.set("someHash", jsonApiData);

      let backboneProxy = reactivityAdapter.BackboneModel(jsonApiData);

      expect(jsonApiData.attributes.name).toEqual("foo");
      expect(backboneProxy.attributes.name).toEqual("foo");

      backboneProxy.set("name", "bar");

      expect(jsonApiData.attributes.name).toEqual("bar");

      //@ts-ignore
      expect(backboneProxy._previousAttributes.name).toEqual("foo");
      expect(backboneProxy.attributes.name).toEqual("bar");
      //@ts-ignore
      expect(backboneProxy.changed.name).toEqual("bar");

      backboneProxy.set("name", "baz");

      expect(jsonApiData.attributes.name).toEqual("baz");

      //@ts-ignore
      expect(backboneProxy._previousAttributes.name).toEqual("bar");
      expect(backboneProxy.attributes.name).toEqual("baz");
      //@ts-ignore
      expect(backboneProxy.changed.name).toEqual("baz");

      let pojoResource = reactivityAdapter.ResourceModel(jsonApiData) as any;

      pojoResource.name = "buzz";

      expect(jsonApiData.attributes.name).toEqual("buzz");

      //@ts-ignore
      expect(backboneProxy._previousAttributes.name).toEqual("baz");
      expect(backboneProxy.attributes.name).toEqual("buzz");
      //@ts-ignore
      expect(backboneProxy.changed.name).toEqual("buzz");
    }

    testGarbageCollection();
    // invoke the garbage collector
    global.gc();
    await setTimeout(() => {});
    // This test does not serve any automation purposes, only for debugging purposes.
    // since the RawResourceModel / jsonApiData is stored in memory via a Map, we can see the WeakMap holds one value still
    // When the reference to the RawResourceModel / jsonApiData is destroyed, the WeakMap record will also be destroyed

    // note the [[Entries]] Private symbol on reactivityAdapter._proxyCache._resourceModelCache to show an Array with a length of 1
    //@ts-ignore
    reactivityAdapter._proxyCache._resourceModelCache;
  });

  it("Should garbage collect the proxy cache to the RawResourceModel as there are no longer any references still stored in memory", async () => {
    if (!global.gc) {
      return;
    }

    const modelFactory = new ResourceFactory();

    const jsonApiParserBackbone = new JsonApiParserBackbone();
    const backboneFactory = new BackboneFactory<typeof CustomBackboneModel>(
      CustomBackboneModel,
      jsonApiParserBackbone.parse.bind(jsonApiParserBackbone)
    );

    const reactivityAdapter = new ReactivityAdapter<
      RawResourceModel,
      typeof CustomBackboneModel,
      Object
    >(
      backboneFactory.toParsedBackboneModel.bind(backboneFactory),
      modelFactory.toParsedResourceModel.bind(modelFactory)
    );

    function testGarbageCollection() {
      let jsonApiData: RawResourceModel = {
        id: "37",
        type: "cat",
        attributes: {
          name: "foo",
        },
        links: {
          self: "/api/cat/37/",
        },
        relationships: {
          owner: {
            data: {
              id: "84",
              type: "owner",
            },
            links: {
              related: "/api/cat/37/owner/",
              self: "/api/cat/37/relationships/owner/",
            },
          },
          paws: {
            data: [
              {
                id: "1",
                type: "paw",
              },
              {
                id: "2",
                type: "paw",
              },
              {
                id: "3",
                type: "paw",
              },
              {
                id: "4",
                type: "paw",
              },
            ],
            links: {
              related: "/api/cat/37/paws/",
              self: "/api/cat/37/relationships/paws/",
            },
          },
        },
      };

      let backboneProxy = reactivityAdapter.BackboneModel(jsonApiData);

      expect(jsonApiData.attributes.name).toEqual("foo");
      expect(backboneProxy.attributes.name).toEqual("foo");

      backboneProxy.set("name", "bar");

      expect(jsonApiData.attributes.name).toEqual("bar");

      //@ts-ignore
      expect(backboneProxy._previousAttributes.name).toEqual("foo");
      expect(backboneProxy.attributes.name).toEqual("bar");
      //@ts-ignore
      expect(backboneProxy.changed.name).toEqual("bar");

      backboneProxy.set("name", "baz");

      expect(jsonApiData.attributes.name).toEqual("baz");

      //@ts-ignore
      expect(backboneProxy._previousAttributes.name).toEqual("bar");
      expect(backboneProxy.attributes.name).toEqual("baz");
      //@ts-ignore
      expect(backboneProxy.changed.name).toEqual("baz");

      let pojoResource = reactivityAdapter.ResourceModel(jsonApiData) as any;

      pojoResource.name = "buzz";

      expect(jsonApiData.attributes.name).toEqual("buzz");

      //@ts-ignore
      expect(backboneProxy._previousAttributes.name).toEqual("baz");
      expect(backboneProxy.attributes.name).toEqual("buzz");
      //@ts-ignore
      expect(backboneProxy.changed.name).toEqual("buzz");
    }

    testGarbageCollection();
    // invoke the garbage collector
    global.gc();
    await setTimeout(() => {});

    // This test does not serve any automation purposes, only for debugging purposes.
    // since the RawResourceModel / jsonApiData is NOT stored in memory via a Map, the entry to the WeakMap is destroyed and should be empty

    // note the [[Entries]] Private symbol on reactivityAdapter._proxyCache._resourceModelCache to show an Array with a length of 0
    //@ts-ignore
    reactivityAdapter._proxyCache._resourceModelCache;
  });

  describe("Backbone Events", () => {
    it("calls backbone events when model resource model changes", () => {
      const modelFactory = new ResourceFactory();

      const jsonApiParserBackbone = new JsonApiParserBackbone();
      const backboneFactory = new BackboneFactory<typeof CustomBackboneModel>(
        CustomBackboneModel,
        jsonApiParserBackbone.parse.bind(jsonApiParserBackbone)
      );

      const reactivityAdapter = new ReactivityAdapter<
        RawResourceModel,
        typeof CustomBackboneModel,
        Object
      >(
        backboneFactory.toParsedBackboneModel.bind(backboneFactory),
        modelFactory.toParsedResourceModel.bind(modelFactory)
      );

      let jsonApiData: RawResourceModel = {
        id: "37",
        type: "cat",
        attributes: {
          name: "Garfield",
        },
        links: {
          self: "/api/cat/37/",
        },
        relationships: {
          owner: {
            data: {
              id: "84",
              type: "owner",
            },
            links: {
              related: "/api/cat/37/owner/",
              self: "/api/cat/37/relationships/owner/",
            },
          },
          paws: {
            data: [
              {
                id: "1",
                type: "paw",
              },
              {
                id: "2",
                type: "paw",
              },
              {
                id: "3",
                type: "paw",
              },
              {
                id: "4",
                type: "paw",
              },
            ],
            links: {
              related: "/api/cat/37/paws/",
              self: "/api/cat/37/relationships/paws/",
            },
          },
        },
      };
      let backboneProxy = reactivityAdapter.BackboneModel(jsonApiData);

      let mockChangeFunction = jest
        .fn()
        .mockImplementation(
          (backboneProxyReference: any, propChange: string) => {
            // cant get jest mocks toHaveBeenCalledWith to properly work here
            expect(backboneProxy == backboneProxyReference).toEqual(true);
            expect(propChange).toEqual("KITTYCAT");
          }
        );

      backboneProxy.on("change:name", mockChangeFunction);

      let pojoResource = reactivityAdapter.ResourceModel(jsonApiData) as any;
      pojoResource.name = "KITTYCAT";

      expect(mockChangeFunction).toHaveBeenCalledTimes(1);
    });

    it("calls backbone events when model resource model changes for multiple registrations", () => {
      const modelFactory = new ResourceFactory();

      const jsonApiParserBackbone = new JsonApiParserBackbone();
      const backboneFactory = new BackboneFactory<typeof CustomBackboneModel>(
        CustomBackboneModel,
        jsonApiParserBackbone.parse.bind(jsonApiParserBackbone)
      );

      const reactivityAdapter = new ReactivityAdapter<
        RawResourceModel,
        typeof CustomBackboneModel,
        Object
      >(
        backboneFactory.toParsedBackboneModel.bind(backboneFactory),
        modelFactory.toParsedResourceModel.bind(modelFactory)
      );

      let jsonApiData: RawResourceModel = {
        id: "37",
        type: "cat",
        attributes: {
          name: "Garfield",
          children: ["timmy", "johnny"],
        },
        links: {
          self: "/api/cat/37/",
        },
        relationships: {
          owner: {
            data: {
              id: "84",
              type: "owner",
            },
            links: {
              related: "/api/cat/37/owner/",
              self: "/api/cat/37/relationships/owner/",
            },
          },
          paws: {
            data: [
              {
                id: "1",
                type: "paw",
              },
              {
                id: "2",
                type: "paw",
              },
              {
                id: "3",
                type: "paw",
              },
              {
                id: "4",
                type: "paw",
              },
            ],
            links: {
              related: "/api/cat/37/paws/",
              self: "/api/cat/37/relationships/paws/",
            },
          },
        },
      };
      let backboneProxy = reactivityAdapter.BackboneModel(jsonApiData);

      let mockChangeFunction = jest.fn();

      mockChangeFunction.mockImplementation(
        (backboneProxyReference: any, propChange: string) => {
          // cant get jest mocks toHaveBeenCalledWith to properly work here
          expect(backboneProxy == backboneProxyReference).toEqual(true);
          expect(propChange).toEqual("KITTYCAT");
        }
      );

      backboneProxy.on("change:name change:children", mockChangeFunction);

      let pojoResource = reactivityAdapter.ResourceModel(jsonApiData) as any;
      pojoResource.name = "KITTYCAT";

      expect(mockChangeFunction).toHaveBeenCalledTimes(1);

      mockChangeFunction.mockImplementation(
        (backboneProxyReference: any, propChange: string) => {
          // cant get jest mocks toHaveBeenCalledWith to properly work here
          expect(backboneProxy == backboneProxyReference).toEqual(true);
          expect(propChange).toEqual(["tommy", "cathy"]);
        }
      );

      pojoResource.children = ["tommy", "cathy"];
      expect(mockChangeFunction).toHaveBeenCalledTimes(2);
    });
  });
});
