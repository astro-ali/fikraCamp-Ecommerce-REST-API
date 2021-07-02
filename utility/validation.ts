export default class Validate {
  constructor(parameters) {}

  static register = (must = true) => ({
    name: {
      presence: must,
      type: "string",
    },
    phone: {
      presence: must,
      type: "string",
    },
    password: {
      presence: must,
      type: "string",
    },
    birthDate: {
      presence: false,
      type: "string",
    },
  });
}
