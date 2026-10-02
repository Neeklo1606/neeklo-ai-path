import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { cmsJson } from "@/lib/cms-api";

/**
 * Единая точка чтения публичного API.
 *
 * Раньше страницы ходили в API тремя способами (useQuery, голый fetch в useEffect,
 * axios через adminApi), и ошибки у каждого обрабатывались по-своему — чаще всего
 * никак: при недоступном API блок просто оставался пустым без объяснения.
 */
export function useCmsQuery<T>(
  key: readonly unknown[],
  path: string,
  options?: Omit<UseQueryOptions<T, Error, T, readonly unknown[]>, "queryKey" | "queryFn">,
) {
  return useQuery<T, Error, T, readonly unknown[]>({
    queryKey: key,
    queryFn: () => cmsJson<T>(path),
    staleTime: 60_000,
    retry: 1,
    ...options,
  });
}
