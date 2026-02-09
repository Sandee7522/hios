import { NextResponse } from "next/server";

export const apiResponse = (status = 200, message = "Success", data = {}) => {
  return NextResponse.json(
    {
      status,
      message,
      data,
    },
    { status },
  );
};

// predefined helpers
export const success = (message, data = {}) => apiResponse(200, message, data);

export const created = (message, data = {}) => apiResponse(201, message, data);

export const validationError = (errors) =>
  apiResponse(400, Array.isArray(errors) ? errors.join(", ") : errors, {});

export const unauthorized = (message = "Unauthorized access") =>
  apiResponse(401, message);

export const forbidden = (message = "Access denied") =>
  apiResponse(403, message);

export const serverError = (message = "Internal server error") =>
  apiResponse(500, message);
