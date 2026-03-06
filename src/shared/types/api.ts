export interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface ApiSuccess<TData> {
  ok: true;
  data: TData;
}

export interface ApiFailure {
  ok: false;
  error: ApiErrorPayload;
}

export type ApiEnvelope<TData> = ApiSuccess<TData> | ApiFailure;
