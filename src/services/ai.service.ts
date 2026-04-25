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

export async function fetchOpenAiModels(input: {
  apiKey: string;
  baseUrl?: string;
}): Promise<{ models: string[] }> {
  const { data } = await adminApi.post<{ models: string[] }>("/assistants/models/openai", {
    api_key: input.apiKey,
    base_url: input.baseUrl || null,
  });
  return data;
}

export async function askKnowledgeHelper(input: {
  assistantId: string;
  question: string;
  points?: number;
}): Promise<{ answer: string }> {
  const { data } = await adminApi.post<{ answer: string }>(`/assistants/${input.assistantId}/knowledge/help`, {
    question: input.question,
    points: input.points ?? 0,
  });
  return data;
}

export async function listKnowledgeChunks(assistantId: string, limit = 24): Promise<{ chunks: { id: string; text: string; source: string }[] }> {
  const { data } = await adminApi.get<{ chunks: { id: string; text: string; source: string }[] }>(
    `/assistants/${assistantId}/knowledge/chunks?limit=${encodeURIComponent(String(limit))}`,
  );
  return data;
}

export type KnowledgeGraphNode = {
  id: string;
  title: string;
  source: string;
  category: string;
  section: string;
  tags: string[];
  snippet?: string;
};

export type KnowledgeGraphEdge = {
  id: string;
  from: string;
  to: string;
};

export async function getKnowledgeGraph(
  assistantId: string,
  filters?: { category?: string; section?: string; tag?: string },
): Promise<{
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  facets: { categories: string[]; sections: string[]; tags: string[] };
}> {
  const q = new URLSearchParams();
  if (filters?.category) q.set("category", filters.category);
  if (filters?.section) q.set("section", filters.section);
  if (filters?.tag) q.set("tag", filters.tag);
  const qs = q.toString();
  const { data } = await adminApi.get<{
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
    facets: { categories: string[]; sections: string[]; tags: string[] };
  }>(`/assistants/${assistantId}/knowledge/graph${qs ? `?${qs}` : ""}`);
  return data;
}

export async function askKnowledgeCoach(input: {
  assistantId: string;
  goal?: string;
  answers: Record<string, string>;
}): Promise<{ next_question: string; draft: string; is_ready: boolean }> {
  const { data } = await adminApi.post<{ next_question: string; draft: string; is_ready: boolean }>(
    `/assistants/${input.assistantId}/knowledge/coach`,
    { goal: input.goal || "", answers: input.answers },
  );
  return data;
}
