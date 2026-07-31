import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Eye, Send, CheckCircle, Star, Briefcase, MapPin, Clock,
  Building2, Calendar, MessageSquare, ArrowRight, Inbox,
  TrendingUp, Filter, Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { typedGet, typedPost } from '@/lib/api';
import { formatTime } from '@/lib/utils';
import { DELIVERY_STATUS_MAP, DEFAULT_DELIVERY_STATUS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { toast } from 'sonner';

// Extended status map with "已入职" (status 5) not in shared constants
const MY_DELIVERY_STATUS_MAP = {
  ...DELIVERY_STATUS_MAP,
  5: { label: '已入职', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

interface Delivery {
  id: number;
  jobId: number;
  jobTitle: string;
  status: number;
  hrNote: string;
  createTime: string;
  updateTime: string;
  studentName: string;
  studentMajor: string;
  studentSkills: string;
  studentGpa: number;
}

const statusFilters = [
  { label: '全部', value: 'all', icon: Sparkles },
  { label: '待处理', value: '0', icon: Clock },
  { label: '已查看', value: '1', icon: Eye },
  { label: '面试邀请', value: '2', icon: MessageSquare },
  { label: '已录用', value: '3', icon: CheckCircle },
];

export default function MyDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [acceptedDeliveryIds, setAcceptedDeliveryIds] = useState<Set<number>>(new Set());
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewDeliveryId, setReviewDeliveryId] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: '5', content: '' });
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());
  const [existingReview, setExistingReview] = useState<{ rating: number; review: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const data = await typedGet('/delivery/my', { params: { page, size: 10 } });
      setDeliveries((data as any)?.records || []);
      setTotal((data as any)?.total || 0);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedInternships = async () => {
    try {
      const data = await typedGet('/internship/my');
      const internships = (data as any) || [];
      const deliveryIds = new Set<number>();
      internships.forEach((i: any) => {
        if (i.deliveryId) deliveryIds.add(i.deliveryId);
      });
      setAcceptedDeliveryIds(deliveryIds);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchDeliveries(); fetchAcceptedInternships(); }, [page]);

  // Filter deliveries based on selected status
  const filteredDeliveries = statusFilter === 'all'
    ? deliveries
    : deliveries.filter(d => {
        const filterStatus = parseInt(statusFilter);
        if (filterStatus === 3) {
          // "已录用" includes both status 3 and accepted internships
          return d.status === 3;
        }
        return d.status === filterStatus;
      });

  const handleViewDetail = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDetailOpen(true);
    setExistingReview(null);
    if (delivery.status === 3 || delivery.status === 4) {
      fetchExistingReview(delivery.id);
    }
  };

  const handleAcceptOffer = async (deliveryId: number) => {
    setAcceptingId(deliveryId);
    try {
      await typedPost(`/internship/start?deliveryId=${deliveryId}`);
      toast.success('已接受 offer，实习开始！');
      setAcceptedDeliveryIds(prev => new Set([...prev, deliveryId]));
      fetchDeliveries();
    } catch (err: any) {
      toast.error(err.message || '操作失败');
    } finally {
      setAcceptingId(null);
    }
  };

  const getDisplayStatus = (d: Delivery) => {
    if (d.status === 3 && acceptedDeliveryIds.has(d.id)) {
      return MY_DELIVERY_STATUS_MAP[5]; // 已入职
    }
    return MY_DELIVERY_STATUS_MAP[d.status] || DEFAULT_DELIVERY_STATUS;
  };

  const canReview = (d: Delivery) => {
    return (d.status === 3 || d.status === 4) && !reviewedIds.has(d.id);
  };

  const openReview = (deliveryId: number) => {
    setReviewDeliveryId(deliveryId);
    setReviewForm({ rating: '5', content: '' });
    setReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!reviewDeliveryId) return;
    try {
      await typedPost(`/delivery/rate/interview?deliveryId=${reviewDeliveryId}&rating=${reviewForm.rating}&review=${encodeURIComponent(reviewForm.content)}`);
      toast.success('评价成功');
      setReviewDialogOpen(false);
      setReviewedIds(prev => new Set([...prev, reviewDeliveryId]));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const fetchExistingReview = async (deliveryId: number) => {
    try {
      const data = await typedGet(`/delivery/rate/interview/${deliveryId}`);
      if (data) {
        setExistingReview({ rating: data.rating, review: data.review });
        setReviewedIds(prev => new Set([...prev, deliveryId]));
      }
    } catch { /* no review exists */ }
  };

  // Calculate stats
  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 0).length,
    interview: deliveries.filter(d => d.status === 2).length,
    accepted: deliveries.filter(d => d.status === 3 || acceptedDeliveryIds.has(d.id)).length,
  };

  return (
    <div className="space-y-6 page-enter">
      {/* ---- Hero header ---- */}
      <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.3),transparent_32%),linear-gradient(135deg,#0f172a,#1e293b_55%,#6366f1)] p-6 md:p-8 text-white shadow-2xl shadow-indigo-900/20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/15 border-white/20 text-white rounded-full px-3 py-1">
              <Send className="h-3.5 w-3.5 mr-1" /> My Applications
            </Badge>
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>我的投递</h1>
              <p className="mt-2 max-w-2xl text-sm text-indigo-50/80" style={{fontFamily: 'var(--font-body)'}}>
                追踪你的求职进度，管理所有投递记录。
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.total}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>总投递</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.pending}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>待处理</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.interview}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>面试中</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-emerald-400" style={{fontFamily: 'var(--font-display)'}}>{stats.accepted}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>已录用</p>
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
                  ? 'bg-[hsl(var(--primary))] text-white shadow-md shadow-[hsl(var(--primary)/0.2)]'
                  : 'bg-white text-muted-foreground hover:text-foreground border border-[hsl(30_12%_92%)] hover:border-[hsl(var(--primary)/0.3)]'
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
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-[hsl(var(--primary))]" />
          <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载投递记录...</p>
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!loading && filteredDeliveries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--primary)/0.06)] flex items-center justify-center">
            <Inbox className="h-10 w-10 text-[hsl(var(--primary)/0.3)]" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
              {statusFilter === 'all' ? '暂无投递记录' : '暂无匹配的投递记录'}
            </p>
            <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
              {statusFilter === 'all'
                ? '去岗位广场发现感兴趣的机会，开始你的求职之旅吧'
                : '试试切换其他状态筛选'}
            </p>
          </div>
          {statusFilter === 'all' ? (
            <Button
              onClick={() => window.location.href = '/app/jobs'}
              className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))]"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              浏览岗位
            </Button>
          ) : (
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

      {/* ---- Delivery list ---- */}
      {!loading && filteredDeliveries.length > 0 && (
        <div className="grid gap-4">
          {filteredDeliveries.map((d, index) => {
            const st = getDisplayStatus(d);
            const isAccepted = d.status === 3 && acceptedDeliveryIds.has(d.id);
            const canAccept = d.status === 3 && !isAccepted;
            return (
              <Card
                key={d.id}
                className="group relative rounded-xl border-[hsl(30_12%_92%)] card-lift cursor-pointer overflow-hidden bg-white hover:border-[hsl(var(--primary)/0.2)] transition-all duration-300"
                style={{animationDelay: `${300 + index * 60}ms`}}
                onClick={() => handleViewDetail(d)}
              >
                {/* Accent stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-opacity duration-300 rounded-l-xl ${
                  isAccepted ? 'bg-emerald-500' : 'bg-[hsl(var(--primary))]'
                } opacity-0 group-hover:opacity-100`} />

                <CardContent className="p-6 pl-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.08)] to-[hsl(var(--accent)/0.06)] flex items-center justify-center shrink-0 border border-[hsl(var(--primary)/0.1)]">
                          <Briefcase className="h-5 w-5 text-[hsl(var(--primary)/0.5)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium group-hover:text-[hsl(var(--primary))] transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                            {d.jobTitle || `投递 #${d.id}`}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <Calendar className="h-3.5 w-3.5" />
                              {formatTime(d.createTime)}
                            </span>
                            <Badge className={`${st.color} text-xs px-2.5 py-0.5 rounded-lg border`}>
                              {st.label}
                            </Badge>
                          </div>
                          {d.hrNote && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-1" style={{fontFamily: 'var(--font-body)'}}>
                              <MessageSquare className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                              {d.hrNote}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {canAccept && (
                        <Button
                          size="sm"
                          onClick={() => handleAcceptOffer(d.id)}
                          disabled={acceptingId === d.id}
                          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {acceptingId === d.id ? '处理中...' : '接受 offer'}
                        </Button>
                      )}
                      {canReview(d) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReview(d.id)}
                          className="gap-1.5 rounded-xl"
                        >
                          <Star className="h-3.5 w-3.5" />
                          评价
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0 rounded-xl"
                        onClick={() => handleViewDetail(d)}
                      >
                        <Eye className="h-4 w-4 text-[hsl(var(--primary))]" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage(page - 1)}
            className="rounded-xl"
          >
            上一页
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-4" style={{fontFamily: 'var(--font-body)'}}>
            第 {page} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(total / DEFAULT_PAGE_SIZE) || loading}
            onClick={() => setPage(page + 1)}
            className="rounded-xl"
          >
            下一页
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>投递详情</DialogTitle>
          </DialogHeader>
          {selectedDelivery && (() => {
            const st = getDisplayStatus(selectedDelivery);
            const isAccepted = selectedDelivery.status === 3 && acceptedDeliveryIds.has(selectedDelivery.id);
            const canAccept = selectedDelivery.status === 3 && !isAccepted;
            return (
              <div className="space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-[hsl(30_12%_92%)]">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--accent)/0.08)] flex items-center justify-center border border-[hsl(var(--primary)/0.15)]">
                    <Send className="h-6 w-6 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{fontFamily: 'var(--font-display)'}}>
                      {selectedDelivery.jobTitle || `投递 #${selectedDelivery.id}`}
                    </h3>
                    <Badge className={`${st.color} mt-1 border`}>{st.label}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>投递信息</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>投递时间</p>
                      <p className="text-sm font-medium mt-1" style={{fontFamily: 'var(--font-body)'}}>{formatTime(selectedDelivery.createTime)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>当前状态</p>
                      <Badge className={`${st.color} mt-1 border`}>{st.label}</Badge>
                    </div>
                  </div>
                </div>

                {selectedDelivery.hrNote && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>HR备注</h4>
                    <p className="text-sm p-4 bg-[hsl(var(--accent)/0.06)] rounded-xl border border-[hsl(var(--accent)/0.12)]" style={{fontFamily: 'var(--font-body)'}}>
                      {selectedDelivery.hrNote}
                    </p>
                  </div>
                )}

                {canAccept && (
                  <div className="pt-3 border-t border-[hsl(30_12%_92%)]">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">
                      <p className="text-sm text-emerald-700" style={{fontFamily: 'var(--font-body)'}}>
                        🎉 恭喜你被录用！点击下方按钮接受 offer 并开始实习。
                      </p>
                    </div>
                    <Button
                      onClick={() => { handleAcceptOffer(selectedDelivery.id); setDetailOpen(false); }}
                      disabled={acceptingId === selectedDelivery.id}
                      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {acceptingId === selectedDelivery.id ? '处理中...' : '接受 offer，开始实习'}
                    </Button>
                  </div>
                )}

                {isAccepted && (
                  <div className="pt-3 border-t border-[hsl(30_12%_92%)]">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <p className="text-sm text-emerald-700" style={{fontFamily: 'var(--font-body)'}}>
                        ✅ 你已接受此 offer，实习已开始。可在「我的实习」页面查看详情。
                      </p>
                    </div>
                  </div>
                )}

                {existingReview && (
                  <div className="pt-3 border-t border-[hsl(30_12%_92%)]">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3" style={{fontFamily: 'var(--font-body)'}}>我的面试评价</h4>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-sm">{'⭐'.repeat(existingReview.rating)}</p>
                      {existingReview.review && (
                        <p className="text-sm mt-2 text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                          {existingReview.review}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Interview Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>评价面试体验</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>面试评分 (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                className="mt-2 rounded-xl"
              />
            </div>
            <Textarea
              placeholder="分享你的面试体验..."
              value={reviewForm.content}
              onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
              rows={4}
              className="rounded-xl"
            />
            <Button
              onClick={submitReview}
              className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white rounded-xl shadow-lg shadow-[hsl(var(--primary)/0.2)]"
            >
              提交评价
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
