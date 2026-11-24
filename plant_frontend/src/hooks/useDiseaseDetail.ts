import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { DiseaseEntry } from "../lib/types";

interface UseDiseaseDetailResult {
  disease: DiseaseEntry | null;
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
  return "Could not load this disease entry. Please try again.";
}

export function useDiseaseDetail(className: string | undefined): UseDiseaseDetailResult {
  const [disease, setDisease] = useState<DiseaseEntry | null>(null);
  const [loading, setLoading] = useState(Boolean(className));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    if (!className) {
      setDisease(null);
      setError(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setDisease(null);
    setLoading(true);
    setError(null);

    api
      .getDisease(className, controller.signal)
      .then((data) => {
        if (active && !controller.signal.aborted) {
          setDisease(data);
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
  }, [className]);

  return { disease, loading, error };
}
