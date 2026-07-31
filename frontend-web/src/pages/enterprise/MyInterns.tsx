import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Star, Eye, GraduationCap, Briefcase, Calendar, MessageSquare,
  Send, Users, Inbox, Sparkles, Filter, BookOpen, Award,
  CheckCircle, Clock, ArrowRight,
} from 'lucide-react';
import { typedGet, typedPost, typedPut } from '@/lib/api';
import { formatTime } from '@/lib/utils';
import type { InternshipMessage } from '@/lib/types';
import { INTERNSHIP_STATUS_MAP, DEFAULT_INTERNSHIP_STATUS } from '@/lib/constants';
import { toast } from 'sonner';

interface InternItem {
  id: number;
  jobId: number;
  studentName: string;
  studentMajor: string;
  position: string;
  startDate: string;
  endDate: string;
  status: number;
  rating: number;
  review: string;
}

const statusFilters = [
  { label: '全部', value: 'all', icon: Sparkles },
  { label: '实习中', value: '0', icon: Clock },
  { label: '已结束', value: '1', icon: CheckCircle },
];

export default function MyInterns() {
  const [interns, setInterns] = useState<InternItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rating, setRating] = useState('5');
  const [review, setReview] = useState('');
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<InternItem | null>(null);

  // Messages
  const [messageInternshipId, setMessageInternshipId] = useState<number | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messages, setMessages] = useState<InternshipMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const data = await typedGet('/internship/publisher');
      setInterns((data as any) || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInterns(); }, []);

  const openRate = (id: number) => {
    setSelectedId(id);
    setRating('5');
    setReview('');
    setRateDialogOpen(true);
  };

  const submitRate = async () => {
    if (!selectedId) return;
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      toast.error('评分必须在 1-5 之间');
      return;
    }
    try {
      await typedPut(`/internship/rate?internshipId=${selectedId}&rating=${ratingNum}&review=${encodeURIComponent(review)}`);
      toast.success('评分成功');
      setRateDialogOpen(false);
      fetchInterns();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openDetail = (intern: InternItem) => {
    setSelectedIntern(intern);
    setDetailOpen(true);
  };

  const openMessages = async (internshipId: number) => {
    setMessageInternshipId(internshipId);
    setMessageOpen(true);
    try {
      const data = await typedGet(`/internship/${internshipId}/messages`);
      setMessages((data as any) || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const sendMessage = async () => {
    if (!messageInternshipId || !newMessage.trim()) return;
    try {
      await typedPost(`/internship/${messageInternshipId}/message?content=${encodeURIComponent(newMessage)}`);
      setNewMessage('');
      const data = await typedGet(`/internship/${messageInternshipId}/messages`);
      setMessages((data as any) || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Filter interns based on selected status
  const filteredInterns = statusFilter === 'all'
    ? interns
    : interns.filter(i => i.status === parseInt(statusFilter));

  // Calculate stats
  const stats = {
    total: interns.length,
    active: interns.filter(i => i.status === 1).length,
    completed: interns.filter(i => i.status === 2).length,
    rated: interns.filter(i => i.rating && i.rating > 0).length,
  };

  return (
    <div className="space-y-6">
      {/* ---- Hero header ---- */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(20_12%_18%)] via-[hsl(25_10%_22%)] to-[hsl(30_8%_16%)] p-6 md:p-8 text-white transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="absolute inset-0 noise" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-[60px]" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center border border-emerald-400/30">
                <GraduationCap className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-2xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                  实习生管理
                </h2>
                <p className="text-white/40 text-sm" style={{fontFamily: 'var(--font-body)'}}>
                  管理和评价你的实习生
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.total}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>总人数</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-emerald-400" style={{fontFamily: 'var(--font-display)'}}>{stats.active}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>实习中</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.completed}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>已结束</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-amber-400" style={{fontFamily: 'var(--font-display)'}}>{stats.rated}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>已评价</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Status Filters ---- */}
      <div className={`flex items-center gap-3 flex-wrap transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white text-muted-foreground hover:text-foreground border border-[hsl(30_12%_92%)] hover:border-emerald-200'
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
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-emerald-500" />
          <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载实习生列表...</p>
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!loading && filteredInterns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Inbox className="h-10 w-10 text-emerald-300" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
              {statusFilter === 'all' ? '暂无实习生' : '暂无匹配的实习生'}
            </p>
            <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
              {statusFilter === 'all' ? '等待学生接受 offer...' : '试试切换其他状态筛选'}
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

      {/* ---- Intern list ---- */}
      {!loading && filteredInterns.length > 0 && (
        <div className="grid gap-4">
          {filteredInterns.map((item, index) => {
            const st = INTERNSHIP_STATUS_MAP[item.status] || DEFAULT_INTERNSHIP_STATUS;
            return (
              <Card
                key={item.id}
                className={`group relative rounded-xl border-[hsl(30_12%_92%)] card-lift cursor-pointer overflow-hidden bg-white hover:border-emerald-200 transition-all duration-300 ${
                  mounted ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{animationDelay: `${index * 60}ms`}}
                onClick={() => openDetail(item)}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

                <CardContent className="p-6 pl-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center shrink-0 border border-emerald-500/15">
                          <span className="text-lg font-bold text-emerald-500" style={{fontFamily: 'var(--font-display)'}}>
                            {(item.studentName || '?')[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-medium group-hover:text-emerald-600 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                              {item.studentName || '学生'}
                            </h3>
                            <Badge className={`${st.color} text-xs px-2.5 py-0.5 rounded-lg border`}>
                              {st.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <Briefcase className="h-3.5 w-3.5" />
                              {item.position || '-'}
                            </span>
                            {item.studentMajor && (
                              <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                <BookOpen className="h-3.5 w-3.5" />
                                {item.studentMajor}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <Calendar className="h-3.5 w-3.5" />
                              {item.startDate || '-'}
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
                    <div className="flex gap-2 ml-16 sm:ml-0 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openMessages(item.id)}
                        className="gap-1.5 rounded-xl"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        消息
                      </Button>
                      {(!item.rating || item.rating === 0) && (
                        <Button
                          size="sm"
                          onClick={() => openRate(item.id)}
                          className="gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          <Star className="h-3.5 w-3.5" />
                          评价
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Intern Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>实习生详情</DialogTitle>
          </DialogHeader>
          {selectedIntern && (() => {
            const st = INTERNSHIP_STATUS_MAP[selectedIntern.status] || DEFAULT_INTERNSHIP_STATUS;
            return (
              <div className="space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-[hsl(30_12%_92%)]">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center border border-emerald-500/15">
                    <GraduationCap className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{fontFamily: 'var(--font-display)'}}>
                      {selectedIntern.studentName || '学生'}
                    </h3>
                    <Badge className={`${st.color} mt-1 border`}>{st.label}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>实习信息</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>岗位</span>
                      </div>
                      <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedIntern.position || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>专业</span>
                      </div>
                      <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedIntern.studentMajor || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>开始日期</span>
                      </div>
                      <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedIntern.startDate || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>结束日期</span>
                      </div>
                      <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedIntern.endDate || '进行中'}</p>
                    </div>
                  </div>
                </div>

                {selectedIntern.rating != null && selectedIntern.rating > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>企业评价</h4>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                        <span className="text-lg font-bold text-amber-700" style={{fontFamily: 'var(--font-display)'}}>{selectedIntern.rating}</span>
                        <span className="text-xs text-amber-600" style={{fontFamily: 'var(--font-body)'}}>/5</span>
                      </div>
                      {selectedIntern.review && (
                        <p className="text-sm text-amber-800" style={{fontFamily: 'var(--font-body)'}}>{selectedIntern.review}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-[hsl(30_12%_92%)]">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 rounded-xl"
                    onClick={() => { setDetailOpen(false); openMessages(selectedIntern.id); }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    发送消息
                  </Button>
                  {(!selectedIntern.rating || selectedIntern.rating === 0) && (
                    <Button
                      className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                      onClick={() => { setDetailOpen(false); openRate(selectedIntern.id); }}
                    >
                      <Star className="h-4 w-4" />
                      评价
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Rate Dialog */}
      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>实习评分</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>评分 (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="mt-2 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>评语（可选）</Label>
              <Textarea
                placeholder="请输入评语..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
                className="mt-2 rounded-xl"
              />
            </div>
            <Button
              onClick={submitRate}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
            >
              提交评分
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Messages Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>实习沟通</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-[300px] overflow-y-auto space-y-3 p-4 bg-[hsl(30_12%_96%)] rounded-xl">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>暂无消息</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-emerald-600">
                        {(msg.senderName || '?')[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{fontFamily: 'var(--font-body)'}}>{msg.senderName || '用户'}</span>
                        <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>{formatTime(msg.createTime)}</span>
                      </div>
                      <p className="text-sm mt-1" style={{fontFamily: 'var(--font-body)'}}>{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="输入消息..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 rounded-xl"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
