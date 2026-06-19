import React, { type ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

/**
 * HOC wrapper around <ErrorBoundary>. Lives in its own module so that
 * react-refresh can Fast-Refresh ErrorBoundary cleanly.
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode,
) {
  const WithErrorBoundary = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  WithErrorBoundary.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;
  return WithErrorBoundary;
}
