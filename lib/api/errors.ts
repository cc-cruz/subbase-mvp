import { ZodError } from "zod";

export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "internal_error";

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  details?: unknown;

  constructor(code: ApiErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown) {
  return new ApiError("bad_request", message, 400, details);
}

export function unauthorized(message = "Unauthorized.") {
  return new ApiError("unauthorized", message, 401);
}

export function forbidden(message = "Forbidden.") {
  return new ApiError("forbidden", message, 403);
}

export function notFound(message = "Not found.") {
  return new ApiError("not_found", message, 404);
}

export function conflict(message: string, details?: unknown) {
  return new ApiError("conflict", message, 409, details);
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof ZodError) {
    return badRequest("Validation failed.", error.flatten());
  }

  if (error instanceof Error) {
    return new ApiError("internal_error", error.message, 500);
  }

  return new ApiError("internal_error", "An unexpected error occurred.", 500);
}
