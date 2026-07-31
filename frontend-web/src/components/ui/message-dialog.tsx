import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface Message {
  id: number;
  senderId?: number;
  senderName?: string;
  content: string;
  createTime: string;
}

interface MessageDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 打开状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 标题 */
  title?: string;
  /** 消息列表 */
  messages: Message[];
  /** 发送消息回调 */
  onSend: (content: string) => Promise<void>;
  /** 是否正在加载消息 */
  loading?: boolean;
}

/**
 * 通用消息对话框
 * 替代 Competition/MyInternships/MyInterns 中重复的消息弹窗
 *
 * @example
 * <MessageDialog
 *   open={messageOpen}
 *   onOpenChange={setMessageOpen}
 *   title="队伍留言"
 *   messages={messages}
 *   onSend={async (content) => { await sendMessage(content); }}
 * />
 */
export function MessageDialog({
  open,
  onOpenChange,
  title = '消息',
  messages,
  onSend,
  loading = false,
}: MessageDialogProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await onSend(newMessage.trim());
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 max-h-60">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">加载中...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">暂无消息</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{msg.senderName || '用户'}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(msg.createTime)}</span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Input
            placeholder="输入消息..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={!newMessage.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
