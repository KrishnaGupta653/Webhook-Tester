export interface WebhookEvent {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
  params: Record<string, string | string[] | undefined>;
  ip: string;
  userAgent?: string;
  contentLength?: string | null;
  origin?: string | null;
  referer?: string | null;
  body: unknown;
  rawBody?: string | null;
  time: string;
}