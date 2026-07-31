import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { StatusBadge } from '@/lib/constants';

interface DetailDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 打开状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 标题 */
  title: string;
  /** 图标组件 */
  icon?: React.ReactNode;
  /** 状态徽章 */
  badge?: StatusBadge;
  /** 最大宽度 */
  maxWidth?: string;
  /** 子元素 */
  children: React.ReactNode;
}

/**
 * 通用详情对话框
 * 替代 10+ 文件中重复的详情弹窗结构
 *
 * @example
 * <DetailDialog
 *   open={detailOpen}
 *   onOpenChange={setDetailOpen}
 *   title="岗位详情"
 *   icon={<Briefcase className="h-6 w-6 text-blue-600" />}
 *   badge={{ label: '全职', color: 'bg-blue-100 text-blue-800' }}
 * >
 *   <p>岗位描述...</p>
 * </DetailDialog>
 */
export function DetailDialog({
  open,
  onOpenChange,
  title,
  icon,
  badge,
  maxWidth = 'max-w-md',
  children,
}: DetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-left">{title}</DialogTitle>
              {badge && (
                <Badge className={`mt-1 ${badge.color}`}>{badge.label}</Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 详情区块：带标题的内容区域
 */
export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
      <div className="text-sm">{children}</div>
    </div>
  );
}

/**
 * 详情网格：2 列的 key-value 布局
 */
export function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 text-sm">{children}</div>;
}

/**
 * 详情项：单个 key-value
 */
export function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      {value}
    </div>
  );
}
