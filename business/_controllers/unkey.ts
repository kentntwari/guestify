import { H3Error, type H3Event } from "h3";

import { ZodError } from "zod";

import {
  ApiResponse,
  BadRequestResponse,
  Base as BaseController,
  InternalServerErrorResponse,
  NotImplementedResponse,
  ValidationErrorResponse,
} from "./_base";

import { UnkeyService, UnkeyServiceError } from "@/_services/unkey";
import { ApplicationError } from "@/errors/application";
import { NetworkError } from "@/errors/network";

export class UnkeyController extends BaseController {
  constructor(
    event: H3Event,
    public unkeyService: UnkeyService = new UnkeyService()
  ) {
    super(event);
  }

  public async get() {
    return new NotImplementedResponse();
  }
  public async create() {
    return new NotImplementedResponse();
  }
  public async update() {
    return new NotImplementedResponse();
  }
  public async delete() {
    return new NotImplementedResponse();
  }

  public mapErrorResponse(error: unknown) {
    if (error instanceof UnkeyServiceError)
      return ApiResponse.error(undefined, error.message);

    if (error instanceof ApplicationError)
      return new InternalServerErrorResponse(error.message);

    if (error instanceof NetworkError)
      return new InternalServerErrorResponse(error.message);

    if (error instanceof ZodError) return new ValidationErrorResponse(error);

    return ApiResponse.error(
      "INTERNAL_SERVER_ERROR",
      "Unexpected error occurred"
    );
  }
}
