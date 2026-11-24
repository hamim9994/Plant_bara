import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { DiseaseEntry } from "../lib/types";

interface UseDiseasesResult {
  diseases: DiseaseEntry[];
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
  return "Could not load the disease library. Please try again.";
}

export function useDiseases(): UseDiseasesResult {
  const [diseases, setDiseases] = useState<DiseaseEntry[]>([]);
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
      .getDiseases(controller.signal)
      .then((data) => {
        if (active && !controller.signal.aborted) {
          setDiseases(Array.isArray(data.diseases) ? data.diseases : []);
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

  return { diseases, loading, error, refresh };
}
