import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  const digest = typeof error === "object" && error && "digest" in error ? String(error.digest) : undefined;

  console.error("Keepnoto server request error", {
    message: normalizedError.message,
    digest,
    method: request.method,
    path: request.path,
    routePath: context.routePath,
    routeType: context.routeType,
  });
};
