export interface PredictionItem {
  class_name: string;
  display_name: string;
  confidence: number;
}

export interface PredictionResult {
  class_name: string;
  display_name: string;
  crop: string;
  disease: string;
  is_healthy: boolean;
  confidence: number;
  symptoms: string;
  treatment: string;
  prevention: string;
}

export interface PredictResponse {
  success: boolean;
  prediction: PredictionResult;
  alternatives: PredictionItem[];
  model: Record<string, unknown>;
  processing_time_ms: number;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  version: string;
}

export interface ModelInfo {
  architecture?: string;
  framework?: string;
  tf_version?: string;
  num_classes?: number;
  class_names?: string[];
  input_size?: number[];
  val_accuracy?: number;
  test_accuracy?: number;
  trained_on?: string;
  epochs_head?: number;
  epochs_fine?: number;
  date_trained?: string;
  [key: string]: unknown;
}

export interface DiseaseEntry {
  class_name: string;
  display_name: string;
  crop: string;
  disease: string;
  is_healthy: boolean;
  symptoms: string;
  treatment: string;
  prevention: string;
}

export interface DiseaseListResponse {
  count: number;
  diseases: DiseaseEntry[];
}
