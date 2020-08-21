import ReactivityAdapter, { JSONAPIResource } from "./index";

describe("Exported Values", () => {
  it("Does not break the exported signature", () => {
    expect(ReactivityAdapter).toBeTruthy();

    expect(() => {
      // some basic test without much value to make sure the signature still exits on the export
      const jsonApiResource: JSONAPIResource = {
        arbitraryValue: "",
        attributes: {
          key: "value",
        },
      };
    }).not.toThrowError();
  });
});
