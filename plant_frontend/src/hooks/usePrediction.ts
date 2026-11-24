import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import type { PredictResponse } from "../lib/types";

interface UsePredictionResult {
  result: PredictResponse | null;
  loading: boolean;
  error: string | null;
  previewUrl: string | null;
  select: (file: File) => void;
  submit: (file: File, topK?: number) => Promise<void>;
  reset: () => void;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return "The scan could not be completed. Please try another photo.";
}

function createPreviewUrl(file: File): string | null {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return null;
  }
  return URL.createObjectURL(file);
}

function releasePreviewUrl(url: string | null): void {
  if (url && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}

export function usePrediction(): UsePredictionResult {
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const previewUrlRef = useRef<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const revokePreview = useCallback(() => {
    releasePreviewUrl(previewUrlRef.current);
    previewUrlRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      controllerRef.current = null;
      revokePreview();
    };
  }, [revokePreview]);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    revokePreview();

    if (mountedRef.current) {
      setResult(null);
      setError(null);
      setPreviewUrl(null);
      setLoading(false);
    }
  }, [revokePreview]);

  const select = useCallback((file: File) => {
    const nextPreviewUrl = createPreviewUrl(file);
    revokePreview();
    previewUrlRef.current = nextPreviewUrl;
    if (mountedRef.current) {
      setPreviewUrl(nextPreviewUrl);
      setResult(null);
      setError(null);
    }
  }, [revokePreview]);

  const submit = useCallback(
    async (file: File, topK?: number): Promise<void> => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const nextPreviewUrl = createPreviewUrl(file);
      revokePreview();
      previewUrlRef.current = nextPreviewUrl;

      if (mountedRef.current) {
        setPreviewUrl(nextPreviewUrl);
        setResult(null);
        setError(null);
        setLoading(true);
      }

      try {
        const data = await api.predict(file, topK, controller.signal);
        if (mountedRef.current && !controller.signal.aborted) {
          setResult(data);
        }
      } catch (reason: unknown) {
        if (mountedRef.current && !controller.signal.aborted) {
          setError(toErrorMessage(reason));
        }
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
        if (mountedRef.current && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [revokePreview],
  );

  return { result, loading, error, previewUrl, select, submit, reset };
}
