import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  /** 是否正在加载 */
  loading: boolean;
  /** 数据是否为空 */
  empty: boolean;
  /** 空状态提示文案 */
  emptyText?: string;
  /** 加载中提示文案 */
  loadingText?: string;
  /** 子元素（数据非空且非加载时渲染） */
  children: React.ReactNode;
}

/**
 * 通用加载/空状态组件
 * 替代所有列表页面中的 loading/empty 条件渲染
 *
 * @example
 * <LoadingState loading={loading} empty={items.length === 0} emptyText="暂无数据">
 *   {items.map(item => <Item key={item.id} {...item} />)}
 * </LoadingState>
 */
export function LoadingState({
  loading,
  empty,
  emptyText = '暂无数据',
  loadingText = '加载中...',
  children,
}: LoadingStateProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">{emptyText}</p>
      </div>
    );
  }

  return <>{children}</>;
}
