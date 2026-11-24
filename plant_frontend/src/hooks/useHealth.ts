import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { HealthResponse } from "../lib/types";

interface UseHealthResult {
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return "Could not check the service status. Please try again.";
}

export function useHealth(): UseHealthResult {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const refresh = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    api
      .getHealth(controller.signal)
      .then((data) => {
        if (active && !controller.signal.aborted) {
          setHealth(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((reason: unknown) => {
        if (active && !controller.signal.aborted) {
          setError(toErrorMessage(reason));
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  return { health, loading, error, refresh };
}
