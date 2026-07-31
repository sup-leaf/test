import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { PaginatedData } from '@/lib/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

interface UsePaginatedListOptions<T> {
  /** 获取数据的函数，接收分页参数，返回 PaginatedData<T> */
  fetchFn: (params: { page: number; size: number; [key: string]: unknown }) => Promise<PaginatedData<T>>;
  /** 额外的筛选参数（变化时自动重置到第 1 页并重新请求） */
  filters?: Record<string, unknown>;
  /** 每页条数，默认 10 */
  pageSize?: number;
  /** 是否在挂载时自动请求，默认 true */
  autoFetch?: boolean;
  /** 错误提示文案 */
  errorMessage?: string;
}

interface UsePaginatedListReturn<T> {
  /** 当前页数据列表 */
  items: T[];
  /** 总条数 */
  total: number;
  /** 当前页码（从 1 开始） */
  page: number;
  /** 总页数 */
  totalPages: number;
  /** 是否正在加载 */
  loading: boolean;
  /** 设置页码 */
  setPage: (page: number) => void;
  /** 手动刷新当前页 */
  refetch: () => void;
}

/**
 * 分页列表通用 Hook
 * 封装了每个列表页面中重复的六件套：
 * useState(items) + useState(total) + useState(page) + useState(loading) + useCallback(fetch) + useEffect
 *
 * @example
 * const { items: jobs, total, page, loading, setPage } = usePaginatedList({
 *   fetchFn: (params) => typedGet('/job/list', { params }),
 *   filters: { keyword, jobType },
 * });
 */
export function usePaginatedList<T>({
  fetchFn,
  filters = {},
  pageSize = DEFAULT_PAGE_SIZE,
  autoFetch = true,
  errorMessage = '加载失败',
}: UsePaginatedListOptions<T>): UsePaginatedListReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 用 ref 持有最新的 fetchFn 和 filters，避免它们成为 useEffect 依赖
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // 用 ref 跟踪上一次的 filtersKey，避免初始渲染触发 setPage(1)
  const prevFiltersKeyRef = useRef<string>('');

  const fetchData = useCallback(async (pageToFetch: number) => {
    setLoading(true);
    try {
      const params = { page: pageToFetch, size: pageSize, ...filtersRef.current };
      const data = await fetchFnRef.current(params);
      setItems(data.records || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : errorMessage;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [pageSize, errorMessage]);

  // filters 变化时重置到第 1 页并重新请求
  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    if (prevFiltersKeyRef.current !== '' && prevFiltersKeyRef.current !== filtersKey) {
      setPage(1);
      fetchData(1);
    }
    prevFiltersKeyRef.current = filtersKey;
  }, [filtersKey, fetchData]);

  // page 变化时请求数据
  useEffect(() => {
    if (autoFetch) {
      fetchData(page);
    }
  }, [page, autoFetch, fetchData]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    items,
    total,
    page,
    totalPages,
    loading,
    setPage,
    refetch: () => fetchData(page),
  };
}
