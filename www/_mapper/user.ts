import { BaseMapper } from "./_base";
import { UserEntity } from "_entities/user";
import { BackendCreateUserApiResponseSchema } from "utils/schemas.zod";
import type { TBackendCreateUserApiResponse } from "utils/schemas.zod";
import { ZodError } from "zod";

/**
 * Maps backend API responses to UserEntity instances.
 */
export class UserMapper extends BaseMapper {
  /**
   * Converts a validated backend user DTO to a UserEntity.
   * @param userDto - The user data object from the backend API response
   * @returns A new UserEntity instance
   */
  static fromBackendDto(
    userDto: NonNullable<TBackendCreateUserApiResponse["data"]>
  ): UserEntity {
    return new UserEntity(
      userDto.id,
      userDto.firstName,
      userDto.lastName,
      userDto.email,
      userDto.imageUrl ?? ""
    );
  }

  /**
   * Validates and maps a backend API response to a UserEntity.
   * @param apiResponse - The full backend API response
   * @returns A new UserEntity instance
   * @throws {UserMapperError} If validation fails or data is null
   */
  static fromBackendResponse(apiResponse: unknown): UserEntity {
    const result = BackendCreateUserApiResponseSchema.safeParse(apiResponse);
    
    if (!result.success) {
      throw new UserMapperError(
        "Failed to validate backend API response",
        result.error
      );
    }

    if (!result.data.data) {
      throw new UserMapperError("Backend API response data is null");
    }

    return this.fromBackendDto(result.data.data);
  }
}

/**
 * Error thrown when user mapping fails.
 */
export class UserMapperError extends Error {
  public readonly zodError?: ZodError;
  public readonly code = "USER_MAPPER_ERROR";

  constructor(message: string, zodError?: ZodError) {
    super(message);
    this.name = "UserMapperError";
    this.zodError = zodError;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserMapperError);
    }
  }
}
