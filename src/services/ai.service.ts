/**
 * Admin / internal helpers for local AI (Ollama + Qdrant).
 * Public chat uses POST /cms-api/chat — these call authenticated assistant routes.
 */
import { adminApi } from "@/lib/admin-api";

export type KnowledgeStats = {
  collection: string;
  points: number;
  ollama_base: string;
};

/** Calls Ollama embeddings via server (same pipeline as RAG). */
export async function createEmbedding(assistantId: string, text: string): Promise<{ embedding: number[] }> {
  const { data } = await adminApi.post<{ embedding: number[] }>(`/assistants/${assistantId}/rag/embed`, { text });
  return data;
}

/** Search Qdrant (debug / admin). */
export async function searchContext(
  assistantId: string,
  text: string,
): Promise<{ hits: { text: string; score?: number; source?: unknown }[] }> {
  const { data } = await adminApi.post<{ hits: { text: string; score?: number; source?: unknown }[] }>(
    `/assistants/${assistantId}/rag/search`,
    { text },
  );
  return data;
}

/** Full generation is only via public POST /chat; kept for typing. */
export async function generateResponse(_assistantId: string, _messages: { role: string; content: string }[]): Promise<never> {
  throw new Error("Use chatComplete() from @/lib/cms-api (public /chat, active assistant)");
}

export async function ingestKnowledgeText(assistantId: string, text: string): Promise<{ ok: boolean; upserted: number }> {
  const { data } = await adminApi.post<{ ok: boolean; upserted: number }>(`/assistants/${assistantId}/knowledge/text`, {
    text,
  });
  return data;
}

export async function ingestKnowledgeFile(assistantId: string, file: File): Promise<{ ok: boolean; upserted: number; filename?: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await adminApi.post<{ ok: boolean; upserted: number; filename?: string }>(
    `/assistants/${assistantId}/knowledge/upload`,
    fd,
  );
  return data;
}

export async function clearKnowledge(assistantId: string): Promise<{ ok: boolean; cleared: string }> {
  const { data } = await adminApi.delete<{ ok: boolean; cleared: string }>(`/assistants/${assistantId}/knowledge`);
  return data;
}

export async function getKnowledgeStats(assistantId: string): Promise<KnowledgeStats> {
  const { data } = await adminApi.get<KnowledgeStats>(`/assistants/${assistantId}/knowledge/stats`);
  return data;
}
