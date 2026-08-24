import { useContext } from "react";
import { CredentialsSourceContext } from "./CredentialsSourceContext";

/**
 * Hook to use the credentials source filter context.
 */
export const useCredentialsSource = () => {
  const ctx = useContext(CredentialsSourceContext);
  if (!ctx) throw new Error("useCredentialsSource must be used inside CredentialsSourceFilterProvider");
  return ctx;
};
