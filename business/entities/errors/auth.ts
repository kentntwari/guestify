import { H3Error } from "h3";

export class CallbackError extends H3Error {
  constructor() {
    super("CALLBACK ERROR");

    this.statusCode = 500;
  }
}

export class LoginError extends H3Error {
  constructor() {
    super("LOGIN ERROR");

    this.statusCode = 500;
  }
}

export class LogoutError extends H3Error {
  constructor() {
    super("LOGOUT ERROR");
    this.statusCode = 500;
  }
}

export class RegisterError extends H3Error {
  constructor() {
    super("REGISTER ERROR");
    this.statusCode = 500;
  }
}
