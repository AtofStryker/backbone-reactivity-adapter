import ProxyCache from "./index";

describe("Proxy Cache Testing Suite", () => {
  it("Returns null when fetched items from proxy cache do not exist", () => {
    const proxyCacheTest = new ProxyCache<Object, string, string>();

    const objectRef = {};

    expect(proxyCacheTest.getModelFromCache(objectRef, 0)).toBe(null);
    expect(proxyCacheTest.getModelFromCache(objectRef, 1)).toBe(null);
    expect(proxyCacheTest.getModelFromCache(objectRef, 2)).toBe(null);
  });

  it("Instantiate the cached triple with same effect as being empty", () => {
    const proxyCacheTest = new ProxyCache<Object, string, string>();

    const objectRef = {};

    proxyCacheTest.setModelInCache(objectRef, 0);

    expect(proxyCacheTest.getModelFromCache(objectRef, 0)).toBe(null);
    expect(proxyCacheTest.getModelFromCache(objectRef, 1)).toBe(null);
    expect(proxyCacheTest.getModelFromCache(objectRef, 2)).toBe(null);
  });

  it("Instantiate the cached triple with same effect as being empty. An index must be specified", () => {
    const proxyCacheTest = new ProxyCache<Object, string, string>();

    const objectRef = {};

    proxyCacheTest.setModelInCache(objectRef, "cat");

    expect(proxyCacheTest.getModelFromCache(objectRef, 0)).toBe(null);
    expect(proxyCacheTest.getModelFromCache(objectRef, 1)).toBe(null);
    expect(proxyCacheTest.getModelFromCache(objectRef, 2)).toBe(null);
  });

  it("Instantiate the cached triple with same effect as being empty. An index must be specified", () => {
    const proxyCacheTest = new ProxyCache<Object, string, string>();

    const objectRef = {};

    proxyCacheTest.setModelInCache(objectRef, "cat", 1);

    expect(proxyCacheTest.getModelFromCache(objectRef, 0)).toBe(null);
    expect(proxyCacheTest.getModelFromCache(objectRef, 1)).toBe("cat");
    expect(proxyCacheTest.getModelFromCache(objectRef, 2)).toBe(null);
  });

  it("Instantiate the cached triple with same effect as being empty. An index must be specified", () => {
    const proxyCacheTest = new ProxyCache<Object, string, string>();

    const objectRef = {};
    const anotherObjectRef = {};
    proxyCacheTest.setModelInCache(objectRef, anotherObjectRef, 0);
    proxyCacheTest.setModelInCache(objectRef, "cat", 1);
    proxyCacheTest.setModelInCache(objectRef, "dog", 2);

    // check by reference
    expect(proxyCacheTest.getModelFromCache(objectRef, 0)).toEqual(
      anotherObjectRef
    );
    expect(proxyCacheTest.getModelFromCache(objectRef, 1)).toBe("cat");
    expect(proxyCacheTest.getModelFromCache(objectRef, 2)).toBe("dog");
  });

  it("Keeps fetched values in memory even though theym ay no longer be a part of the WeakMap", () => {
    const proxyCacheTest = new ProxyCache<any, any, any>();

    let objectRef: Object | null = {};
    const anotherObjectRef0 = {
      a: 1,
    };
    const anothjerObjectRef1 = {
      b: 2,
    };
    const anothjerObjectRef2 = {
      c: 3,
    };
    proxyCacheTest.setModelInCache(objectRef, anotherObjectRef0, 0);
    proxyCacheTest.setModelInCache(objectRef, anothjerObjectRef1, 1);
    proxyCacheTest.setModelInCache(objectRef, anothjerObjectRef2, 2);

    const ref1 = proxyCacheTest.getModelFromCache(objectRef, 1);
    const ref2 = proxyCacheTest.getModelFromCache(objectRef, 2);

    objectRef = null;

    expect(ref1).toBe(anothjerObjectRef1);
    expect(ref2).toBe(anothjerObjectRef2);

    expect(proxyCacheTest.getModelFromCache(objectRef, 0)).toBe(null);
    expect(proxyCacheTest.getModelFromCache(objectRef, 1)).toBe(null);
    expect(proxyCacheTest.getModelFromCache(objectRef, 2)).toBe(null);
  });

  it("Should NOT garbage collect the proxy cache as a reference is still stored in memory", async () => {
    if (!global.gc) {
      return;
    }

    const proxyCacheTest = new ProxyCache<Object, string, string>();

    // use this to store a reference to the objectRef within  `testGarbageCollection`
    const someCacheMap = new Set();

    function testGarbageCollection() {
      const objectRef = {};

      // store another reference in memory
      someCacheMap.add(objectRef);

      const anotherObjectRef = {};
      proxyCacheTest.setModelInCache(objectRef, anotherObjectRef, 0);
      proxyCacheTest.setModelInCache(objectRef, "cat", 1);
      proxyCacheTest.setModelInCache(objectRef, "dog", 2);
    }

    testGarbageCollection();
    // invoke the garbage collector
    global.gc();
    await setTimeout(() => {});
    // note the [[Entries]] Private symbol on proxyCacheTeste to show an Array with a length of 1
    //@ts-ignore
    proxyCacheTest;
  });

  it("Should garbage collect the proxy cache as there are no longer any references still stored in memory", async () => {
    if (!global.gc) {
      return;
    }

    const proxyCacheTest = new ProxyCache<Object, string, string>();

    function testGarbageCollection() {
      const objectRef = {};

      const anotherObjectRef = {};
      proxyCacheTest.setModelInCache(objectRef, anotherObjectRef, 0);
      proxyCacheTest.setModelInCache(objectRef, "cat", 1);
      proxyCacheTest.setModelInCache(objectRef, "dog", 2);
    }

    testGarbageCollection();
    // invoke the garbage collector
    global.gc();
    await setTimeout(() => {});
    // note the [[Entries]] Private symbol on proxyCacheTeste to show an Array with a length of 0
    //@ts-ignore
    proxyCacheTest;
  });
});
