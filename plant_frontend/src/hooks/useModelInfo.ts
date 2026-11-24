import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { ModelInfo } from "../lib/types";

interface UseModelInfoResult {
  info: ModelInfo | null;
  loading: boolean;
  error: string | null;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return "Could not load model information. Please try again.";
}

export function useModelInfo(): UseModelInfoResult {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    api
      .getModelInfo(controller.signal)
      .then((data) => {
        if (active && !controller.signal.aborted) {
          setInfo(data);
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
  }, []);

  return { info, loading, error };
}
