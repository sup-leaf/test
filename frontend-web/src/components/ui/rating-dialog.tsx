import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

interface RatingDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 打开状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 标题 */
  title?: string;
  /** 提交回调 */
  onSubmit: (rating: number, content: string) => Promise<void>;
  /** 默认评分 */
  defaultRating?: number;
}

/**
 * 通用评分对话框
 * 替代 MyDeliveries/MyInterns 中重复的评分弹窗
 *
 * @example
 * <RatingDialog
 *   open={ratingOpen}
 *   onOpenChange={setRatingOpen}
 *   title="评价实习"
 *   onSubmit={async (rating, content) => { await submitReview(rating, content); }}
 * />
 */
export function RatingDialog({
  open,
  onOpenChange,
  title = '评价',
  onSubmit,
  defaultRating = 5,
}: RatingDialogProps) {
  const [rating, setRating] = useState(String(defaultRating));
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const r = parseInt(rating);
    if (isNaN(r) || r < 1 || r > 5) return;
    setSubmitting(true);
    try {
      await onSubmit(r, content);
      onOpenChange(false);
      setContent('');
      setRating(String(defaultRating));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">评分 (1-5)</label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-20"
              />
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 cursor-pointer ${
                      i <= parseInt(rating) || 0
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                    onClick={() => setRating(String(i))}
                  />
                ))}
              </div>
            </div>
          </div>
          <Textarea
            placeholder="评价内容..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? '提交中...' : '提交评价'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
