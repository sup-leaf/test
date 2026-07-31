import { Button } from '@/components/ui/button';

interface SimplePaginationProps {
  /** 当前页码（从 1 开始） */
  page: number;
  /** 总条数 */
  total: number;
  /** 每页条数，默认 10 */
  pageSize?: number;
  /** 是否正在加载 */
  loading?: boolean;
  /** 页码变化回调 */
  onPageChange: (page: number) => void;
}

/**
 * 简单分页组件（上一页/下一页）
 * 替代 9 个文件中重复的分页 UI 块
 *
 * @example
 * <SimplePagination
 *   page={page}
 *   total={total}
 *   loading={loading}
 *   onPageChange={setPage}
 * />
 */
export function SimplePagination({ page, total, pageSize = 10, loading = false, onPageChange }: SimplePaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (total <= pageSize) return null;

  return (
    <div className="flex justify-center gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1 || loading}
        onClick={() => onPageChange(page - 1)}
      >
        上一页
      </Button>
      <span className="flex items-center text-sm text-muted-foreground">
        第 {page} 页 / 共 {totalPages} 页
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages || loading}
        onClick={() => onPageChange(page + 1)}
      >
        下一页
      </Button>
    </div>
  );
}
