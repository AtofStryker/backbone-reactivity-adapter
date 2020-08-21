export default {
  computed: {
    modelFormat(): any {
      //@ts-ignore
      return `${this.get("model")}, WOAH!`;
    },
  },

  formatList(): any {
    //@ts-ignore
    var list = this.get("seats") || [];
    //@ts-ignore
    return list.map((item) => {
      return item ? item.isBucket : false;
    });
  },

  relationships: {
    wheels: "wheel",
    driver: "driver",
  },
};
