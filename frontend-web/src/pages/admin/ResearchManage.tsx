import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus, CheckCircle, XCircle, Eye, FlaskConical, Search,
  Users, Clock, DollarSign, Calendar, BookOpen, Award,
  Inbox, Sparkles, Filter, Beaker, GraduationCap, FileText,
} from 'lucide-react';
import { typedGet, typedPost } from '@/lib/api';
import { AUDIT_STATUS_MAP, DEFAULT_AUDIT_STATUS } from '@/lib/constants';
import { formatTime } from '@/lib/utils';
import type { ResearchProject, ResearchApplication } from '@/lib/types';
import { toast } from 'sonner';

interface Project {
  id: number;
  title: string;
  description: string;
  requirement: string;
  background: string;
  funding: string;
  duration: string;
  status: number;
  createTime: string;
}

interface ResearchApp {
  id: number;
  projectId: number;
  studentId: number;
  status: number;
  note: string;
  createTime: string;
  updateTime: string;
}

interface Application {
  application: ResearchApp;
  studentName: string;
  studentId: string;
}

export default function ResearchManage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ title: '', description: '', requirement: '', background: '', funding: '', duration: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await typedGet<ResearchProject[]>('/research/my/projects');
      setProjects(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const fetchApplications = async (projectId: number) => {
    setSelectedProject(projectId);
    try {
      const data = await typedGet<ResearchApplication[]>(`/research/project/${projectId}/applications`);
      setApplications(data || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePublish = async () => {
    if (!form.title) { toast.error('请填写标题'); return; }
    try {
      await typedPost('/research/project/publish', form);
      toast.success('发布成功');
      setPublishOpen(false);
      setForm({ title: '', description: '', requirement: '', background: '', funding: '', duration: '' });
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAudit = async (applicationId: number, status: number) => {
    try {
      await typedPost(`/research/application/audit?applicationId=${applicationId}&status=${status}`);
      toast.success(status === 1 ? '已通过' : '已驳回');
      if (selectedProject) fetchApplications(selectedProject);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 1).length,
    ended: projects.filter(p => p.status !== 1).length,
    applications: applications.length,
  };

  return (
    <div className="space-y-6">
      {/* ---- Hero header ---- */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(20_12%_18%)] via-[hsl(25_10%_22%)] to-[hsl(30_8%_16%)] p-6 md:p-8 text-white transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="absolute inset-0 noise" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px]" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 backdrop-blur-sm flex items-center justify-center border border-teal-400/30">
                <FlaskConical className="h-5 w-5 text-teal-300" />
              </div>
              <div>
                <h2 className="text-2xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                  科研项目管理
                </h2>
                <p className="text-white/40 text-sm" style={{fontFamily: 'var(--font-body)'}}>
                  发布和管理科研项目
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.total}</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>总项目</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl text-emerald-400" style={{fontFamily: 'var(--font-display)'}}>{stats.active}</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>招募中</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.ended}</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>已结束</p>
              </div>
            </div>
            <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-500/20">
                  <Plus className="h-4 w-4 mr-2" />
                  发布项目
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg rounded-2xl">
                <DialogHeader className="dialog-header-gradient pb-4">
                  <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>发布科研项目</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>项目标题 *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="mt-2 rounded-xl"
                      placeholder="请输入项目标题"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>项目描述</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="mt-2 rounded-xl"
                      placeholder="描述项目的主要内容..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>招募要求</Label>
                    <Textarea
                      value={form.requirement}
                      onChange={(e) => setForm({ ...form, requirement: e.target.value })}
                      rows={2}
                      className="mt-2 rounded-xl"
                      placeholder="描述对参与者的要求..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>研究背景</Label>
                    <Textarea
                      value={form.background}
                      onChange={(e) => setForm({ ...form, background: e.target.value })}
                      rows={2}
                      className="mt-2 rounded-xl"
                      placeholder="描述研究背景和意义..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>经费支持</Label>
                      <Input
                        value={form.funding}
                        onChange={(e) => setForm({ ...form, funding: e.target.value })}
                        className="mt-2 rounded-xl"
                        placeholder="例：5000元"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>预计周期</Label>
                      <Input
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        className="mt-2 rounded-xl"
                        placeholder="例：6个月"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handlePublish}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-500/20"
                  >
                    发布项目
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* ---- Loading ---- */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-teal-500" />
          <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载项目列表...</p>
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center">
            <Inbox className="h-10 w-10 text-teal-300" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
              暂无科研项目
            </p>
            <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
              点击右上角发布你的第一个科研项目
            </p>
          </div>
        </div>
      )}

      {/* ---- Main Content ---- */}
      {!loading && projects.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Projects List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <FlaskConical className="h-4 w-4 text-teal-600" />
              </div>
              <h3 className="font-semibold text-lg" style={{fontFamily: 'var(--font-display)'}}>我的项目</h3>
              <Badge className="ml-auto bg-teal-100 text-teal-800 border-teal-200 rounded-lg">
                {projects.length}
              </Badge>
            </div>
            {projects.map((p, index) => (
              <Card
                key={p.id}
                className={`group relative rounded-xl border-[hsl(30_12%_92%)] card-lift cursor-pointer overflow-hidden bg-white hover:border-teal-200 transition-all duration-300 ${
                  selectedProject === p.id ? 'ring-2 ring-teal-500 border-teal-500' : ''
                } ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{animationDelay: `${index * 60}ms`}}
                onClick={() => fetchApplications(p.id)}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-opacity duration-300 rounded-l-xl ${
                  selectedProject === p.id ? 'bg-teal-500 opacity-100' : 'bg-teal-500 opacity-0 group-hover:opacity-100'
                }`} />

                <CardContent className="p-5 pl-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium truncate group-hover:text-teal-600 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                          {p.title}
                        </h4>
                        <Badge className={p.status === 1
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs'
                          : 'bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-xs'
                        }>
                          {p.status === 1 ? '招募中' : '已结束'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2" style={{fontFamily: 'var(--font-body)'}}>
                        {p.description || '暂无描述'}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {p.funding && (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                            <DollarSign className="h-3.5 w-3.5" />
                            {p.funding}
                          </span>
                        )}
                        {p.duration && (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                            <Clock className="h-3.5 w-3.5" />
                            {p.duration}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                          <Calendar className="h-3.5 w-3.5" />
                          {formatTime(p.createTime)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-lg shrink-0 ml-2"
                      onClick={(e) => { e.stopPropagation(); setViewProject(p); setViewOpen(true); }}
                      title="查看详情"
                    >
                      <Eye className="h-4 w-4 text-teal-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Applications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="font-semibold text-lg" style={{fontFamily: 'var(--font-display)'}}>申请列表</h3>
              {selectedProject && applications.length > 0 && (
                <Badge className="ml-auto bg-violet-100 text-violet-800 border-violet-200 rounded-lg">
                  {applications.length}
                </Badge>
              )}
            </div>

            {!selectedProject ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-violet-300" />
                </div>
                <p className="text-sm text-muted-foreground text-center" style={{fontFamily: 'var(--font-body)'}}>
                  请选择一个项目查看申请
                </p>
              </div>
            ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
                  <Inbox className="h-8 w-8 text-violet-300" />
                </div>
                <p className="text-sm text-muted-foreground text-center" style={{fontFamily: 'var(--font-body)'}}>
                  暂无申请
                </p>
              </div>
            ) : (
              applications.map((app, index) => {
                const st = AUDIT_STATUS_MAP[app.application.status] || DEFAULT_AUDIT_STATUS;
                return (
                  <Card
                    key={app.application.id}
                    className={`group relative rounded-xl border-[hsl(30_12%_92%)] card-lift overflow-hidden bg-white hover:border-violet-200 transition-all duration-300 ${
                      mounted ? 'animate-fade-in-up' : 'opacity-0'
                    }`}
                    style={{animationDelay: `${index * 60}ms`}}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

                    <CardContent className="p-5 pl-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center border border-violet-500/15">
                              <span className="text-sm font-bold text-violet-500">
                                {(app.studentName || '?')[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium" style={{fontFamily: 'var(--font-body)'}}>{app.studentName || '学生'}</p>
                              <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                学号：{app.studentId || '-'}
                              </p>
                            </div>
                          </div>
                          {app.application.note && (
                            <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>
                              {app.application.note}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <Calendar className="h-3.5 w-3.5" />
                              {formatTime(app.application.createTime)}
                            </span>
                            <Badge className={`${st.color} text-xs px-2 py-0.5 rounded-lg border`}>
                              {st.label}
                            </Badge>
                          </div>
                        </div>
                        {app.application.status === 0 ? (
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleAudit(app.application.id, 1); }}
                              className="gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              通过
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => { e.stopPropagation(); handleAudit(app.application.id, 2); }}
                              className="gap-1.5 rounded-xl"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              驳回
                            </Button>
                          </div>
                        ) : (
                          <Badge className={`${st.color} border rounded-lg shrink-0`}>
                            {st.label}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* View Project Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>项目详情</DialogTitle>
          </DialogHeader>
          {viewProject && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-[hsl(30_12%_92%)]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 flex items-center justify-center border border-teal-500/15">
                  <FlaskConical className="h-6 w-6 text-teal-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{fontFamily: 'var(--font-display)'}}>{viewProject.title}</h3>
                  <Badge className={viewProject.status === 1
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1 rounded-lg'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 mt-1 rounded-lg'
                  }>
                    {viewProject.status === 1 ? '招募中' : '已结束'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {viewProject.funding && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600" style={{fontFamily: 'var(--font-body)'}}>经费支持</span>
                    </div>
                    <p className="text-sm font-medium text-emerald-800" style={{fontFamily: 'var(--font-body)'}}>{viewProject.funding}</p>
                  </div>
                )}
                {viewProject.duration && (
                  <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-teal-500" />
                      <span className="text-xs text-teal-600" style={{fontFamily: 'var(--font-body)'}}>预计周期</span>
                    </div>
                    <p className="text-sm font-medium text-teal-800" style={{fontFamily: 'var(--font-body)'}}>{viewProject.duration}</p>
                  </div>
                )}
              </div>

              {viewProject.description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>项目描述</h4>
                  <p className="text-sm p-4 bg-[hsl(30_12%_96%)] rounded-xl whitespace-pre-wrap" style={{fontFamily: 'var(--font-body)'}}>
                    {viewProject.description}
                  </p>
                </div>
              )}

              {viewProject.requirement && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>招募要求</h4>
                  <p className="text-sm p-4 bg-[hsl(30_12%_96%)] rounded-xl whitespace-pre-wrap" style={{fontFamily: 'var(--font-body)'}}>
                    {viewProject.requirement}
                  </p>
                </div>
              )}

              {viewProject.background && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>研究背景</h4>
                  <p className="text-sm p-4 bg-[hsl(30_12%_96%)] rounded-xl whitespace-pre-wrap" style={{fontFamily: 'var(--font-body)'}}>
                    {viewProject.background}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-[hsl(30_12%_92%)]">
                <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                  <Calendar className="h-3.5 w-3.5" />
                  创建时间：{formatTime(viewProject.createTime)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
