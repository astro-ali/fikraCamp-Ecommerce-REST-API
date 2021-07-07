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

  static login = (must = true) => ({
    phone: {
      presence: must,
      type: "string",
    },
    password: {
      presence: must,
      type: "string",
    },
  });
  static rest = (must = true) => ({
    password: {
      presence: must,
      type: "string",
    },
    new_password: {
      presence: must,
      type: "string",
    },
  });

  static phone = (must = true) => ({
    phone: {
      presence: must,
      type: "string",
    }
  });
  static otp = (must = true) => ({
    otp: {
      presence: must,
      type: "string",
    },
  });
  static password = (must = true) => ({
    password: {
      presence: must,
      type: "string",
    },
  });
  static query = (must = true) => ({
    page: {
      presence: false,
      type: "number"
    },
    perPage: {
      presence: false,
      type: "number"
    }
  });
  static category = (must = true) => ({
    name: {
      presence: must,
      type: "string"
    },
    nameAr: {
      presence: must,
      type: "string"
    }
  });

}
