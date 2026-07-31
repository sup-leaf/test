import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Eye, FileText, Mail, Phone, Users, GraduationCap,
  Briefcase, Calendar, MessageSquare, Filter, Search,
  Inbox, Sparkles, MapPin, Award, BookOpen, Star,
} from 'lucide-react';
import { typedGet, typedPut } from '@/lib/api';
import { formatTime, getFileURL } from '@/lib/utils';
import { DELIVERY_STATUS_MAP, DEFAULT_DELIVERY_STATUS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { toast } from 'sonner';

interface DeliveryItem {
  id: number;
  jobId: number;
  resumeId: number;
  jobPublisherId: number;
  jobTitle: string;
  status: number;
  hrNote: string;
  createTime: string;
  updateTime: string;
  studentName: string;
  studentMajor: string;
  studentPhone: string;
  studentEmail: string;
  studentSkills: string;
  studentAwards: string;
  studentGrade: string;
  studentGpa: number;
  studentFileUrl: string;
}

const statusFilters = [
  { label: '全部', value: 'all', icon: Sparkles },
  { label: '待查看', value: '0', icon: Eye },
  { label: '已查看', value: '1', icon: BookOpen },
  { label: '面试中', value: '2', icon: MessageSquare },
  { label: '已录用', value: '3', icon: Star },
  { label: '已拒绝', value: '4', icon: FileText },
];

export default function ReceivedDeliveries() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [gpaMin, setGpaMin] = useState('');
  const [major, setMajor] = useState('');
  const [skillTag, setSkillTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, size: 10 };
      if (gpaMin) params.gpaMin = parseFloat(gpaMin);
      if (major) params.major = major;
      if (skillTag) params.skillTag = skillTag;
      const data = await typedGet('/delivery/publisher', { params });
      setDeliveries((data as any)?.records || []);
      setTotal((data as any)?.total || 0);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, [page]);

  const openStatusDialog = (d: DeliveryItem) => {
    setSelectedDelivery(d);
    const next = Math.min(d.status + 1, 4);
    setNewStatus(next.toString());
    setNote(d.hrNote || '');
    setStatusDialogOpen(true);
  };

  const openDetailDialog = (d: DeliveryItem) => {
    setSelectedDelivery(d);
    setDetailDialogOpen(true);
  };

  const updateStatus = async () => {
    if (!selectedDelivery) return;
    const statusNum = parseInt(newStatus);
    if (isNaN(statusNum) || statusNum < 0 || statusNum > 4) {
      toast.error('请选择有效的状态');
      return;
    }
    try {
      await typedPut(`/delivery/status?deliveryId=${selectedDelivery.id}&deliveryStatus=${newStatus}&note=${encodeURIComponent(note)}`);
      toast.success('状态更新成功');
      setStatusDialogOpen(false);
      fetchDeliveries();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchDeliveries();
  };

  // Filter deliveries based on selected status
  const filteredDeliveries = statusFilter === 'all'
    ? deliveries
    : deliveries.filter(d => d.status === parseInt(statusFilter));

  // Calculate stats
  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 0).length,
    interview: deliveries.filter(d => d.status === 2).length,
    accepted: deliveries.filter(d => d.status === 3).length,
  };

  return (
    <div className="space-y-6">
      {/* ---- Hero header ---- */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(20_12%_18%)] via-[hsl(25_10%_22%)] to-[hsl(30_8%_16%)] p-6 md:p-8 text-white transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="absolute inset-0 noise" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px]" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 backdrop-blur-sm flex items-center justify-center border border-violet-400/30">
                <Users className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <h2 className="text-2xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                  收到的投递
                </h2>
                <p className="text-white/40 text-sm" style={{fontFamily: 'var(--font-body)'}}>
                  筛选和管理候选人
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.total}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>总投递</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-amber-400" style={{fontFamily: 'var(--font-display)'}}>{stats.pending}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>待查看</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-blue-400" style={{fontFamily: 'var(--font-display)'}}>{stats.interview}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>面试中</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-emerald-400" style={{fontFamily: 'var(--font-display)'}}>{stats.accepted}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>已录用</p>
            </div>
          </div>
        </div>

        {/* Search filters */}
        <div className="relative mt-6 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[150px] max-w-[200px]">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="最低GPA"
              type="number"
              step="0.1"
              value={gpaMin}
              onChange={(e) => setGpaMin(e.target.value)}
              className="pl-10 h-11 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/20 rounded-xl"
            />
          </div>
          <Input
            placeholder="专业筛选"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="w-32 h-11 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/20 rounded-xl"
          />
          <Input
            placeholder="技能筛选"
            value={skillTag}
            onChange={(e) => setSkillTag(e.target.value)}
            className="w-32 h-11 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/20 rounded-xl"
          />
          <Button
            onClick={handleSearch}
            className="h-11 px-6 bg-violet-500/20 hover:bg-violet-500/30 text-white border border-violet-400/30 rounded-xl backdrop-blur-sm transition-all"
          >
            <Search className="h-4 w-4 mr-2" />
            筛选
          </Button>
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
                  ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                  : 'bg-white text-muted-foreground hover:text-foreground border border-[hsl(30_12%_92%)] hover:border-violet-200'
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
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-violet-500" />
          <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载投递记录...</p>
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!loading && filteredDeliveries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-violet-50 flex items-center justify-center">
            <Inbox className="h-10 w-10 text-violet-300" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
              {statusFilter === 'all' ? '暂无投递记录' : '暂无匹配的投递记录'}
            </p>
            <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
              {statusFilter === 'all' ? '等待候选人投递...' : '试试切换其他状态筛选'}
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

      {/* ---- Delivery list ---- */}
      {!loading && filteredDeliveries.length > 0 && (
        <div className="grid gap-4">
          {filteredDeliveries.map((d, index) => {
            const st = DELIVERY_STATUS_MAP[d.status] || DEFAULT_DELIVERY_STATUS;
            return (
              <Card
                key={d.id}
                className={`group relative rounded-xl border-[hsl(30_12%_92%)] card-lift overflow-hidden bg-white hover:border-violet-200 transition-all duration-300 ${
                  mounted ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{animationDelay: `${index * 60}ms`}}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

                <CardContent className="p-6 pl-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center shrink-0 border border-violet-500/15">
                          <span className="text-lg font-bold text-violet-500" style={{fontFamily: 'var(--font-display)'}}>
                            {(d.studentName || '?')[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-medium" style={{fontFamily: 'var(--font-body)'}}>
                              {d.studentName || '未知'}
                            </h3>
                            <Badge className={`${st.color} text-xs px-2.5 py-0.5 rounded-lg border`}>
                              {st.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>
                            投递岗位：{d.jobTitle}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <BookOpen className="h-3.5 w-3.5" />
                              {d.studentMajor || '专业未填写'}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <Award className="h-3.5 w-3.5" />
                              GPA：{d.studentGpa ?? '-'}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <Calendar className="h-3.5 w-3.5" />
                              {formatTime(d.createTime)}
                            </span>
                          </div>
                          {d.studentSkills && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {d.studentSkills.split(',').slice(0, 3).map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-violet-50 text-violet-700 border border-violet-100" style={{fontFamily: 'var(--font-body)'}}>
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                          {d.hrNote && (
                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5" style={{fontFamily: 'var(--font-body)'}}>
                              <MessageSquare className="h-3.5 w-3.5" />
                              备注：{d.hrNote}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-16 sm:ml-0 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetailDialog(d)}
                        className="gap-1.5 rounded-xl"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        详情
                      </Button>
                      {d.status < 3 && (
                        <Button
                          size="sm"
                          onClick={() => openStatusDialog(d)}
                          className="gap-1.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white"
                        >
                          更新状态
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

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)} className="rounded-xl">
            上一页
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-4" style={{fontFamily: 'var(--font-body)'}}>
            第 {page} 页 / 共 {Math.ceil(total / DEFAULT_PAGE_SIZE)} 页
          </span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / DEFAULT_PAGE_SIZE) || loading} onClick={() => setPage(page + 1)} className="rounded-xl">
            下一页
          </Button>
        </div>
      )}

      {/* Applicant Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>申请人详情</DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-5">
              {/* Basic Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-[hsl(30_12%_92%)]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center border border-violet-500/15">
                  <span className="text-xl font-bold text-violet-500" style={{fontFamily: 'var(--font-display)'}}>
                    {(selectedDelivery.studentName || '?')[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{fontFamily: 'var(--font-display)'}}>
                    {selectedDelivery.studentName || '未知'}
                  </h3>
                  <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                    {selectedDelivery.studentMajor || '专业未填写'} · {selectedDelivery.studentGrade || '年级未填写'}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>联系方式</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedDelivery.studentPhone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm" style={{fontFamily: 'var(--font-body)'}}>{selectedDelivery.studentPhone}</span>
                    </div>
                  )}
                  {selectedDelivery.studentEmail && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm" style={{fontFamily: 'var(--font-body)'}}>{selectedDelivery.studentEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>学业信息</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 text-center">
                    <p className="text-xs text-violet-600" style={{fontFamily: 'var(--font-body)'}}>专业</p>
                    <p className="text-sm font-medium text-violet-800 mt-1" style={{fontFamily: 'var(--font-body)'}}>{selectedDelivery.studentMajor || '-'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
                    <p className="text-xs text-purple-600" style={{fontFamily: 'var(--font-body)'}}>年级</p>
                    <p className="text-sm font-medium text-purple-800 mt-1" style={{fontFamily: 'var(--font-body)'}}>{selectedDelivery.studentGrade || '-'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
                    <p className="text-xs text-indigo-600" style={{fontFamily: 'var(--font-body)'}}>GPA</p>
                    <p className="text-sm font-medium text-indigo-800 mt-1" style={{fontFamily: 'var(--font-body)'}}>{selectedDelivery.studentGpa ?? '-'}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedDelivery.studentSkills && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>技能</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDelivery.studentSkills.split(',').map((tag, i) => (
                      <Badge key={i} variant="outline" className="rounded-lg border-violet-200 text-violet-700 bg-violet-50">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards */}
              {selectedDelivery.studentAwards && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>获奖经历</h4>
                  <p className="text-sm p-4 bg-amber-50 rounded-xl border border-amber-200 whitespace-pre-wrap" style={{fontFamily: 'var(--font-body)'}}>
                    {selectedDelivery.studentAwards}
                  </p>
                </div>
              )}

              {/* Resume File */}
              {selectedDelivery.studentFileUrl && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>简历附件</h4>
                  <a
                    href={getFileURL(selectedDelivery.studentFileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>
                      {selectedDelivery.studentFileUrl.split('/').pop() || '查看简历'}
                    </span>
                  </a>
                </div>
              )}

              {/* Application Info */}
              <div className="pt-4 border-t border-[hsl(30_12%_92%)] space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>投递信息</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                    <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>投递岗位</p>
                    <p className="text-sm font-medium mt-1" style={{fontFamily: 'var(--font-body)'}}>{selectedDelivery.jobTitle}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                    <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>投递时间</p>
                    <p className="text-sm font-medium mt-1" style={{fontFamily: 'var(--font-body)'}}>{formatTime(selectedDelivery.createTime)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)] col-span-2">
                    <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>当前状态</p>
                    <Badge className={`${(DELIVERY_STATUS_MAP[selectedDelivery.status] || DEFAULT_DELIVERY_STATUS).color} mt-1 border`}>
                      {(DELIVERY_STATUS_MAP[selectedDelivery.status] || DEFAULT_DELIVERY_STATUS).label}
                    </Badge>
                  </div>
                </div>
                {selectedDelivery.hrNote && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-xs text-amber-600 mb-1" style={{fontFamily: 'var(--font-body)'}}>HR备注</p>
                    <p className="text-sm text-amber-800" style={{fontFamily: 'var(--font-body)'}}>{selectedDelivery.hrNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>更新投递状态</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>选择状态</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">待查看</SelectItem>
                  <SelectItem value="1">已查看</SelectItem>
                  <SelectItem value="2">面试中</SelectItem>
                  <SelectItem value="3">已录用</SelectItem>
                  <SelectItem value="4">已拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>备注（可选）</Label>
              <Textarea
                placeholder="添加备注信息..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-2 rounded-xl"
              />
            </div>
            <Button
              onClick={updateStatus}
              className="w-full bg-violet-500 hover:bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-500/20"
            >
              确认更新
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
