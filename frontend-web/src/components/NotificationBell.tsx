import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { typedGet, typedPut } from '@/lib/api';
import { formatTime } from '@/lib/utils';
import type { Notification } from '@/lib/types';
import { toast } from 'sonner';


export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const count = await typedGet<number>('/notification/unread/count');
      setUnreadCount(count ?? 0);
    } catch { /* ignore */ }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const list = await typedGet<Notification[]>('/notification/unread');
      setNotifications(list ?? []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    fetchNotifications();
  };

  const markAsRead = async (id: number) => {
    try {
      await typedPut(`/notification/read/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(notifications.map(n => typedPut(`/notification/read/${n.id}`)));
      setNotifications([]);
      setUnreadCount(0);
      toast.success('全部已读');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="relative" onClick={handleOpen}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>通知消息</DialogTitle>
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-1 text-xs">
                  <CheckCheck className="h-3.5 w-3.5" />全部已读
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">加载中...</p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">暂无未读通知</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{n.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{formatTime(n.createTime)}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={() => markAsRead(n.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
