import { NextResponse } from "next/server";

import { toApiError } from "@/lib/api/errors";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 201, ...init });
}

export function noContent(init?: ResponseInit) {
  return new NextResponse(null, { status: 204, ...init });
}

export function errorResponse(error: unknown) {
  const apiError = toApiError(error);

  return NextResponse.json(
    {
      error: {
        code: apiError.code,
        message: apiError.message,
        details: apiError.details,
      },
    },
    { status: apiError.status },
  );
}
