import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus, Pencil, Trash2, Eye, MapPin, Clock, DollarSign,
  Send, Briefcase, Building2, Users, TrendingUp, Inbox,
  Sparkles, Filter, BarChart3, Calendar,
} from 'lucide-react';
import { typedGet, typedPost, typedPut, typedDelete } from '@/lib/api';
import { formatTime } from '@/lib/utils';
import { JOB_TYPE_MAP, JOB_TYPE_COLORS, DEFAULT_JOB_TYPE_COLOR, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { toast } from 'sonner';

interface Job {
  id: number;
  title: string;
  jobType: number;
  location: string;
  salaryMin: number;
  salaryMax: number;
  duration: number;
  status: number;
  viewCount: number;
  deliveryCount: number;
  description: string;
  requirement: string;
  skillTags: string;
  createTime: string;
  updateTime: string;
}

interface JobForm {
  title: string;
  jobType: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  duration: string;
  description: string;
  requirement: string;
  skillTags: string;
}

const emptyJob: JobForm = {
  title: '', jobType: '1', location: '', salaryMin: '', salaryMax: '',
  duration: '', description: '', requirement: '', skillTags: '',
};

export default function MyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState<JobForm>(emptyJob);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchJobs = async () => {
    setListLoading(true);
    try {
      const data = await typedGet('/job/my', { params: { page, size: 10 } });
      setJobs((data as any)?.records || []);
      setTotal((data as any)?.total || 0);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [page]);

  const openCreate = () => {
    setEditingJob(null);
    setForm(emptyJob);
    setDialogOpen(true);
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      jobType: job.jobType.toString(),
      location: job.location || '',
      salaryMin: job.salaryMin?.toString() || '',
      salaryMax: job.salaryMax?.toString() || '',
      duration: job.duration?.toString() || '',
      description: job.description || '',
      requirement: job.requirement || '',
      skillTags: job.skillTags || '',
    });
    setDialogOpen(true);
  };

  const openDetail = (job: Job) => {
    setSelectedJob(job);
    setDetailOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title) { toast.error('请填写岗位标题'); return; }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        jobType: parseInt(form.jobType),
        location: form.location,
        salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : null,
        salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : null,
        duration: form.duration ? parseInt(form.duration) : null,
        description: form.description,
        requirement: form.requirement,
        skillTags: form.skillTags,
      };
      if (editingJob) {
        payload.id = editingJob.id;
        await typedPut('/job/update', payload);
        toast.success('更新成功');
      } else {
        await typedPost('/job/publish', payload);
        toast.success('发布成功');
      }
      setDialogOpen(false);
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await typedDelete(`/job/delete/${id}`);
      toast.success('删除成功');
      setConfirmDeleteId(null);
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Calculate stats
  const stats = {
    total: jobs.length,
    totalViews: jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0),
    totalDeliveries: jobs.reduce((sum, j) => sum + (j.deliveryCount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* ---- Hero header ---- */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(20_12%_18%)] via-[hsl(25_10%_22%)] to-[hsl(30_8%_16%)] p-6 md:p-8 text-white transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="absolute inset-0 noise" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px]" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border border-blue-400/30">
                <Briefcase className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-2xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                  我的岗位
                </h2>
                <p className="text-white/40 text-sm" style={{fontFamily: 'var(--font-body)'}}>
                  管理发布的岗位信息
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.total}</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>在招岗位</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.totalViews}</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>总浏览</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.totalDeliveries}</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>总投递</p>
              </div>
            </div>
            <Button
              onClick={openCreate}
              className="h-11 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              发布岗位
            </Button>
          </div>
        </div>
      </div>

      {/* ---- Loading ---- */}
      {listLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-blue-500" />
          <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载岗位列表...</p>
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!listLoading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Inbox className="h-10 w-10 text-blue-300" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
              暂无发布的岗位
            </p>
            <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
              点击右上角发布你的第一个岗位
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            发布岗位
          </Button>
        </div>
      )}

      {/* ---- Job list ---- */}
      {!listLoading && jobs.length > 0 && (
        <div className="grid gap-4">
          {jobs.map((job, index) => (
            <Card
              key={job.id}
              className={`group relative rounded-xl border-[hsl(30_12%_92%)] card-lift cursor-pointer overflow-hidden bg-white hover:border-blue-200 transition-all duration-300 ${
                mounted ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{animationDelay: `${index * 60}ms`}}
              onClick={() => openDetail(job)}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

              <CardContent className="p-6 pl-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center shrink-0 border border-blue-500/15">
                        <Building2 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-medium group-hover:text-blue-600 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                            {job.title}
                          </h3>
                          <Badge className={`${JOB_TYPE_COLORS[job.jobType] || DEFAULT_JOB_TYPE_COLOR} text-xs px-2.5 py-0.5 rounded-lg`}>
                            {JOB_TYPE_MAP[job.jobType] || '未知'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {job.location && (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                          )}
                          {job.duration && (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <Clock className="h-3.5 w-3.5" />
                              {job.duration}个月
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                            <Eye className="h-3.5 w-3.5" />
                            {job.viewCount}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                            <Send className="h-3.5 w-3.5" />
                            {job.deliveryCount}人投递
                          </span>
                        </div>
                        {job.skillTags && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.skillTags.split(',').slice(0, 4).map((tag, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-blue-50 text-blue-700 border border-blue-100" style={{fontFamily: 'var(--font-body)'}}>
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-16 sm:ml-0 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(job)}
                      className="gap-1.5 rounded-xl"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      编辑
                    </Button>
                    <Dialog open={confirmDeleteId === job.id} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmDeleteId(job.id)}
                          className="gap-1.5 rounded-xl text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-2xl">
                        <DialogHeader className="dialog-header-gradient pb-4">
                          <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>确认删除</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                          确定要删除岗位「{job.title}」吗？此操作不可撤销。
                        </p>
                        <div className="flex gap-2 justify-end mt-4">
                          <Button variant="outline" onClick={() => setConfirmDeleteId(null)} className="rounded-xl">
                            取消
                          </Button>
                          <Button variant="destructive" onClick={() => handleDelete(job.id)} className="rounded-xl">
                            确认删除
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page <= 1 || listLoading} onClick={() => setPage(page - 1)} className="rounded-xl">
            上一页
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-4" style={{fontFamily: 'var(--font-body)'}}>
            第 {page} 页 / 共 {Math.ceil(total / DEFAULT_PAGE_SIZE)} 页
          </span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / DEFAULT_PAGE_SIZE) || listLoading} onClick={() => setPage(page + 1)} className="rounded-xl">
            下一页
          </Button>
        </div>
      )}

      {/* Job Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>岗位详情</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-[hsl(30_12%_92%)]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center border border-blue-500/15">
                  <Briefcase className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{fontFamily: 'var(--font-display)'}}>{selectedJob.title}</h3>
                  <Badge className={`${JOB_TYPE_COLORS[selectedJob.jobType] || DEFAULT_JOB_TYPE_COLOR} mt-1`}>
                    {JOB_TYPE_MAP[selectedJob.jobType] || '未知'}
                  </Badge>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>基本信息</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedJob.location && (
                    <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>工作地点</span>
                      </div>
                      <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedJob.location}</p>
                    </div>
                  )}
                  {selectedJob.duration && (
                    <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>实习时长</span>
                      </div>
                      <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedJob.duration}个月</p>
                    </div>
                  )}
                  {(selectedJob.salaryMin || selectedJob.salaryMax) && (
                    <div className="p-3 rounded-lg bg-blue-50 col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-blue-600" style={{fontFamily: 'var(--font-body)'}}>薪资范围</span>
                      </div>
                      <p className="text-sm font-medium text-blue-800" style={{fontFamily: 'var(--font-body)'}}>
                        {selectedJob.salaryMin && selectedJob.salaryMax
                          ? `${selectedJob.salaryMin}-${selectedJob.salaryMax}元`
                          : selectedJob.salaryMin ? `${selectedJob.salaryMin}元起` : `最高${selectedJob.salaryMax}元`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>数据统计</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-blue-600" style={{fontFamily: 'var(--font-body)'}}>浏览量</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-800" style={{fontFamily: 'var(--font-display)'}}>{selectedJob.viewCount}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Send className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600" style={{fontFamily: 'var(--font-body)'}}>投递数</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-800" style={{fontFamily: 'var(--font-display)'}}>{selectedJob.deliveryCount}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedJob.skillTags && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>技能要求</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skillTags.split(',').map((tag, i) => (
                      <Badge key={i} variant="outline" className="rounded-lg border-blue-200 text-blue-700 bg-blue-50">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedJob.description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>岗位描述</h4>
                  <p className="text-sm p-4 bg-[hsl(30_12%_96%)] rounded-xl whitespace-pre-wrap" style={{fontFamily: 'var(--font-body)'}}>
                    {selectedJob.description}
                  </p>
                </div>
              )}

              {/* Requirement */}
              {selectedJob.requirement && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>岗位要求</h4>
                  <p className="text-sm p-4 bg-[hsl(30_12%_96%)] rounded-xl whitespace-pre-wrap" style={{fontFamily: 'var(--font-body)'}}>
                    {selectedJob.requirement}
                  </p>
                </div>
              )}

              {/* Time Info */}
              <div className="pt-4 border-t border-[hsl(30_12%_92%)]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                    <Calendar className="h-3.5 w-3.5" />
                    发布：{formatTime(selectedJob.createTime)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                    <Calendar className="h-3.5 w-3.5" />
                    更新：{formatTime(selectedJob.updateTime)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>
              {editingJob ? '编辑岗位' : '发布岗位'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>岗位标题 *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-2 rounded-xl"
                placeholder="请输入岗位标题"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>岗位类型</Label>
                <Select value={form.jobType} onValueChange={(v) => setForm({ ...form, jobType: v })}>
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">实习</SelectItem>
                    <SelectItem value="2">全职</SelectItem>
                    <SelectItem value="3">科研助理</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>工作地点</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="mt-2 rounded-xl"
                  placeholder="例：北京"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>最低薪资</Label>
                <Input
                  type="number"
                  value={form.salaryMin}
                  onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                  className="mt-2 rounded-xl"
                  placeholder="元/月"
                />
              </div>
              <div>
                <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>最高薪资</Label>
                <Input
                  type="number"
                  value={form.salaryMax}
                  onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                  className="mt-2 rounded-xl"
                  placeholder="元/月"
                />
              </div>
              <div>
                <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>时长(月)</Label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="mt-2 rounded-xl"
                  placeholder="例：3"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>技能标签</Label>
              <Input
                value={form.skillTags}
                onChange={(e) => setForm({ ...form, skillTags: e.target.value })}
                className="mt-2 rounded-xl"
                placeholder="用逗号分隔，例：React,Vue,TypeScript"
              />
            </div>
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>岗位描述</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="mt-2 rounded-xl"
                placeholder="描述岗位的主要工作内容..."
              />
            </div>
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>岗位要求</Label>
              <Textarea
                value={form.requirement}
                onChange={(e) => setForm({ ...form, requirement: e.target.value })}
                rows={3}
                className="mt-2 rounded-xl"
                placeholder="描述岗位的任职要求..."
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20"
            >
              {loading ? '提交中...' : (editingJob ? '保存修改' : '发布岗位')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
