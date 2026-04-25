import { useCallback, useState } from "react";

/**
 * Lightweight client-side stub of "secrets manager".
 * The real list of project secrets is server-only; this hook exposes a
 * placeholder list that the page can grow over time. It is intentionally
 * inert — no network call — so admins can wire it to a future
 * `list-project-secrets` edge function without changing call-sites.
 */
export interface SecretRef {
  name: string;
  source: "env" | "secret";
}

export function useSecretsManager() {
  const [secrets, setSecrets] = useState<SecretRef[]>([]);
  const [loading, setLoading] = useState(false);

  const list = useCallback(async () => {
    setLoading(true);
    try {
      // No-op for now. When `list-project-secrets` exists, fetch and set here.
      setSecrets((prev) => prev);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = list;

  return { secrets, loading, list, refresh };
}
