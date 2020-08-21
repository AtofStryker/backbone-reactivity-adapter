export function rawCar() {
  return {
    id: "1",
    type: "car",
    attributes: {
      name: "Dodge",
      model: "Caravan",
      year: 1994,
      color: "grey",
      seats: [
        {
          isBucket: true,
          style: { color: "black" },
          primitives: [1, "2", false],
        },
        {
          isBucket: true,
          style: { color: "black" },
          primitives: [1, "2", false],
        },
        {
          isBucket: false,
          style: { color: "blue" },
          primitives: [0, "test", true],
        },
        {
          isBucket: false,
          style: { color: "blue" },
          primitives: [0, "test", true],
        },
      ],
      availableTrims: {
        le: {
          numberAvailable: 4,
          popularity: "medium",
        },
        xle: {
          numberAvailable: 0,
          popularity: "hot",
        },
        se: {
          numberAvailable: 7,
          popularity: "low",
        },
      },
    },
    links: {
      self: "/car/1/",
    },
    relationships: {
      driver: {
        data: {
          id: "8",
          type: "driver",
        },
        links: {
          related: "/car/1/driver/",
          self: "/car/1/relationships/driver/",
        },
      },
      wheels: {
        data: [
          {
            id: "1",
            type: "wheel",
          },
          {
            id: "2",
            type: "wheel",
          },
          {
            id: "3",
            type: "wheel",
          },
          {
            id: "4",
            type: "wheel",
          },
        ],
        links: {
          related: "/car/1/wheels/",
          self: "/car/1/relationships/wheels/",
        },
      },
    },
  };
}

export function resourceCar() {
  return {
    id: "1",
    type: "car",
    name: "Dodge",
    model: "Caravan",
    year: 1994,
    color: "grey",
    seats: [
      {
        isBucket: true,
        style: { color: "black" },
        primitives: [1, "2", false],
      },
      {
        isBucket: true,
        style: { color: "black" },
        primitives: [1, "2", false],
      },
      {
        isBucket: false,
        style: { color: "blue" },
        primitives: [0, "test", true],
      },
      {
        isBucket: false,
        style: { color: "blue" },
        primitives: [0, "test", true],
      },
    ],
    availableTrims: {
      le: {
        numberAvailable: 4,
        popularity: "medium",
      },
      xle: {
        numberAvailable: 0,
        popularity: "hot",
      },
      se: {
        numberAvailable: 7,
        popularity: "low",
      },
    },
    links: {
      self: "/car/1/",
    },
    Driver: {
      data: {
        id: "8",
        type: "driver",
      },
      links: {
        related: "/car/1/driver/",
        self: "/car/1/relationships/driver/",
      },
    },
    Wheels: {
      data: [
        {
          id: "1",
          type: "wheel",
        },
        {
          id: "2",
          type: "wheel",
        },
        {
          id: "3",
          type: "wheel",
        },
        {
          id: "4",
          type: "wheel",
        },
      ],
      links: {
        related: "/car/1/wheels/",
        self: "/car/1/relationships/wheels/",
      },
    },
  };
}
