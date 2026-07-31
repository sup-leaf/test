import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  BookOpen, FileText, MessageSquare, Send, Star, Download,
  GraduationCap, Calendar, CheckCircle, Clock, Inbox,
  Sparkles, Filter, Award, Loader2,
} from 'lucide-react';
import { typedGet, typedPost, typedPut } from '@/lib/api';
import { formatTime } from '@/lib/utils';
import { getAPIBaseURL } from '@/lib/config';
import type { Internship, InternshipLog, InternshipMessage } from '@/lib/types';
import { INTERNSHIP_STATUS_MAP, DEFAULT_INTERNSHIP_STATUS } from '@/lib/constants';
import { toast } from 'sonner';

const statusFilters = [
  { label: '全部', value: 'all', icon: Sparkles },
  { label: '进行中', value: '0', icon: Clock },
  { label: '已完成', value: '1', icon: CheckCircle },
  { label: '提前终止', value: '2', icon: Award },
];

export default function MyInternships() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [logs, setLogs] = useState<InternshipLog[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [logForm, setLogForm] = useState({ weekNum: '', content: '' });
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmEndId, setConfirmEndId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Messages
  const [messageInternshipId, setMessageInternshipId] = useState<number | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messages, setMessages] = useState<InternshipMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Student review
  const [reviewInternshipId, setReviewInternshipId] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: '5', content: '' });

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const data = await typedGet<Internship[]>('/internship/my');
      setInternships(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInternships(); }, []);

  const viewLogs = async (internshipId: number) => {
    setSelectedId(internshipId);
    try {
      const data = await typedGet<InternshipLog[]>('/internship/logs', { params: { internshipId } });
      setLogs(data || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const submitLog = async () => {
    if (!selectedId || !logForm.weekNum || !logForm.content) {
      toast.error('请填写完整');
      return;
    }
    try {
      await typedPost(`/internship/log?internshipId=${selectedId}&weekNum=${logForm.weekNum}&content=${encodeURIComponent(logForm.content)}`);
      toast.success('日志提交成功');
      setLogDialogOpen(false);
      setLogForm({ weekNum: '', content: '' });
      viewLogs(selectedId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const endInternship = async (id: number) => {
    try {
      await typedPut(`/internship/end?internshipId=${id}`);
      toast.success('实习已结束');
      setConfirmEndId(null);
      fetchInternships();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openMessages = async (internshipId: number) => {
    setMessageInternshipId(internshipId);
    setMessageOpen(true);
    try {
      const data = await typedGet<InternshipMessage[]>(`/internship/${internshipId}/messages`);
      setMessages(data || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const sendMessage = async () => {
    if (!messageInternshipId || !newMessage.trim()) return;
    try {
      await typedPost(`/internship/${messageInternshipId}/message?content=${encodeURIComponent(newMessage)}`);
      setNewMessage('');
      const data = await typedGet<InternshipMessage[]>(`/internship/${messageInternshipId}/messages`);
      setMessages(data || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openReview = (internshipId: number) => {
    setReviewInternshipId(internshipId);
    setReviewForm({ rating: '5', content: '' });
    setReviewOpen(true);
  };

  const submitReview = async () => {
    if (!reviewInternshipId) return;
    try {
      await typedPost(`/internship/rate/student?internshipId=${reviewInternshipId}&rating=${reviewForm.rating}&review=${encodeURIComponent(reviewForm.content)}`);
      toast.success('评价成功');
      setReviewOpen(false);
      fetchInternships();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const downloadCertificate = async (internshipId: number) => {
    try {
      const baseURL = getAPIBaseURL().replace('/api', '');
      const token = localStorage.getItem('token');
      const url = `${baseURL}/api/internship/certificate/${internshipId}/pdf`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('下载失败');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `实习证明_${internshipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('证明下载成功');
    } catch (err: any) {
      toast.error(err.message || '下载失败');
    }
  };

  // Filter
  const filteredInternships = statusFilter === 'all'
    ? internships
    : internships.filter(i => i.status === parseInt(statusFilter));

  // Stats
  const stats = {
    total: internships.length,
    active: internships.filter(i => i.status === 0).length,
    completed: internships.filter(i => i.status === 1).length,
    terminated: internships.filter(i => i.status === 2).length,
  };

  return (
    <div className="space-y-6">
      {/* ---- Hero header ---- */}
      <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,.3),transparent_32%),linear-gradient(135deg,#0f172a,#164e63_55%,#06b6d4)] p-6 md:p-8 text-white shadow-2xl shadow-cyan-900/20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/15 border-white/20 text-white rounded-full px-3 py-1">
              <GraduationCap className="h-3.5 w-3.5 mr-1" /> My Internships
            </Badge>
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>我的实习</h1>
              <p className="mt-2 max-w-2xl text-sm text-cyan-50/80" style={{fontFamily: 'var(--font-body)'}}>
                追踪实习进度，记录成长历程。
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.total}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>总实习</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-cyan-400" style={{fontFamily: 'var(--font-display)'}}>{stats.active}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>进行中</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-emerald-400" style={{fontFamily: 'var(--font-display)'}}>{stats.completed}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>已完成</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Status Filters ---- */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 mr-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>状态：</span>
        </div>
        {statusFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                statusFilter === filter.value
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-white text-muted-foreground hover:text-foreground border border-[hsl(30_12%_92%)] hover:border-cyan-200'
              }`}
              style={{fontFamily: 'var(--font-body)'}}
            >
              <Icon className="h-4 w-4" />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* ---- Loading ---- */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-cyan-500" />
          <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载实习记录...</p>
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!loading && filteredInternships.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-cyan-50 flex items-center justify-center">
            <Inbox className="h-10 w-10 text-cyan-300" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
              {statusFilter === 'all' ? '暂无实习记录' : '暂无匹配的实习记录'}
            </p>
            <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
              {statusFilter === 'all' ? '接受 offer 后将自动创建实习记录' : '试试切换其他状态筛选'}
            </p>
          </div>
          {statusFilter !== 'all' && (
            <Button
              variant="outline"
              onClick={() => setStatusFilter('all')}
              className="rounded-xl"
            >
              清除筛选
            </Button>
          )}
        </div>
      )}

      {/* ---- Internship list ---- */}
      {!loading && filteredInternships.length > 0 && (
        <div className="grid gap-4">
          {filteredInternships.map((item, index) => {
            const st = INTERNSHIP_STATUS_MAP[item.status] || DEFAULT_INTERNSHIP_STATUS;
            return (
              <Card
                key={item.id}
                className="group relative rounded-xl border-[hsl(30_12%_92%)] card-lift overflow-hidden bg-white hover:border-cyan-200 transition-all duration-300"
                style={{animationDelay: `${index * 60}ms`}}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-cyan-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

                <CardContent className="p-6 pl-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 flex items-center justify-center shrink-0 border border-cyan-500/15">
                          <GraduationCap className="h-5 w-5 text-cyan-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-medium group-hover:text-cyan-600 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                              {item.position || '实习岗位'}
                            </h3>
                            <Badge className={`${st.color} text-xs px-2.5 py-0.5 rounded-lg border`}>
                              {st.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <BookOpen className="h-3.5 w-3.5" />
                              {item.companyName || '-'}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <Calendar className="h-3.5 w-3.5" />
                              {item.startDate || '-'} ~ {item.endDate || '至今'}
                            </span>
                          </div>
                          {item.rating != null && item.rating > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-medium text-amber-700" style={{fontFamily: 'var(--font-body)'}}>{item.rating}</span>
                              </div>
                              {item.review && (
                                <span className="text-xs text-muted-foreground line-clamp-1" style={{fontFamily: 'var(--font-body)'}}>
                                  {item.review}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 ml-16 sm:ml-0 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" onClick={() => viewLogs(item.id)} className="gap-1.5 rounded-xl">
                        <FileText className="h-3.5 w-3.5" />日志
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openMessages(item.id)} className="gap-1.5 rounded-xl">
                        <MessageSquare className="h-3.5 w-3.5" />消息
                      </Button>
                      {item.status === 1 && (
                        <>
                          {(!item.rating || item.rating === 0) && (
                            <Button variant="outline" size="sm" onClick={() => openReview(item.id)} className="gap-1.5 rounded-xl">
                              <Star className="h-3.5 w-3.5" />评价
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => downloadCertificate(item.id)} className="gap-1.5 rounded-xl">
                            <Download className="h-3.5 w-3.5" />证明
                          </Button>
                        </>
                      )}
                      {item.status === 0 && (
                        <>
                          <Dialog open={logDialogOpen && selectedId === item.id} onOpenChange={(open) => { setLogDialogOpen(open); if (open) setSelectedId(item.id); }}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white">
                                <FileText className="h-3.5 w-3.5" />提交日志
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-2xl">
                              <DialogHeader className="dialog-header-gradient"><DialogTitle>提交周日志</DialogTitle></DialogHeader>
                              <div className="space-y-4">
                                <Input type="number" placeholder="第几周" value={logForm.weekNum} onChange={(e) => setLogForm({ ...logForm, weekNum: e.target.value })} />
                                <Textarea placeholder="本周工作内容..." value={logForm.content} onChange={(e) => setLogForm({ ...logForm, content: e.target.value })} rows={4} />
                                <Button onClick={submitLog} className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white">提交</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Dialog open={confirmEndId === item.id} onOpenChange={(open) => { if (!open) setConfirmEndId(null); }}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={() => setConfirmEndId(item.id)} className="gap-1.5 rounded-xl">
                                结束实习
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-2xl">
                              <DialogHeader className="dialog-header-gradient"><DialogTitle>确认结束实习</DialogTitle></DialogHeader>
                              <p className="text-sm text-muted-foreground">确定要结束在 {item.companyName} 的实习吗？此操作不可撤销。</p>
                              <div className="flex gap-2 justify-end mt-4">
                                <Button variant="outline" onClick={() => setConfirmEndId(null)} className="rounded-xl">取消</Button>
                                <Button variant="destructive" onClick={() => endInternship(item.id)} className="rounded-xl">确认结束</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Logs display */}
      {selectedId && logs.length > 0 && (
        <Card className="rounded-xl border-[hsl(30_12%_92%)] overflow-hidden bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4" style={{fontFamily: 'var(--font-display)'}}>实习日志</h3>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border-l-2 border-cyan-400/40 pl-4 py-2">
                  <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>第 {log.weekNum} 周</p>
                  <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>{log.content}</p>
                  <p className="text-xs text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>{formatTime(log.createTime)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col rounded-2xl">
          <DialogHeader className="dialog-header-gradient"><DialogTitle>实习沟通</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 min-h-0 max-h-60">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>暂无消息</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="p-3 bg-[hsl(30_12%_96%)] rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm" style={{fontFamily: 'var(--font-body)'}}>{msg.senderName || '用户'}</span>
                    <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>{formatTime(msg.createTime)}</span>
                  </div>
                  <p className="text-sm" style={{fontFamily: 'var(--font-body)'}}>{msg.content}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2 pt-2 border-t border-[hsl(30_12%_92%)]">
            <Input
              placeholder="输入消息..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 rounded-xl"
            />
            <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()} className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader className="dialog-header-gradient"><DialogTitle>评价实习</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>评分 (1-5)</label>
              <Input type="number" min="1" max="5" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })} className="mt-2 rounded-xl" />
            </div>
            <Textarea placeholder="评价内容..." value={reviewForm.content} onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })} rows={4} className="rounded-xl" />
            <Button onClick={submitReview} className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white">提交评价</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
