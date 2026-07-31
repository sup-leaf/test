import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, FlaskConical, Eye, Beaker, BookOpen, Clock,
  DollarSign, Users, Sparkles, Inbox, ArrowRight, Calendar,
  CheckCircle, XCircle, AlertCircle, Filter,
} from 'lucide-react';
import { typedGet, typedPost } from '@/lib/api';
import { formatTime } from '@/lib/utils';
import type { ResearchApplication } from '@/lib/types';
import { AUDIT_STATUS_MAP, DEFAULT_AUDIT_STATUS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
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

interface MyApplication {
  application: ResearchApplication;
  projectTitle: string;
}

const statusIcons: Record<number, typeof CheckCircle> = {
  0: AlertCircle,
  1: CheckCircle,
  2: XCircle,
};

export default function Research() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [myApps, setMyApps] = useState<MyApplication[]>([]);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [applyNote, setApplyNote] = useState('');
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<MyApplication | null>(null);
  const [projectDetailOpen, setProjectDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, size: 10 };
      if (searchKeyword) params.keyword = searchKeyword;
      const data = await typedGet('/research/project/list', { params });
      setProjects((data as any)?.records || []);
      setTotal((data as any)?.total || 0);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, searchKeyword]);

  const fetchMyApps = async () => {
    try {
      const data = await typedGet('/research/my/applications');
      setMyApps((data as any) || []);
    } catch (err: any) {
      // silently fail for my apps
    }
  };

  useEffect(() => { fetchProjects(); fetchMyApps(); }, [fetchProjects]);

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setPage(1);
  };

  const handleApply = async (projectId: number) => {
    try {
      await typedPost(`/research/apply?projectId=${projectId}&note=${encodeURIComponent(applyNote)}`);
      toast.success('申请成功');
      setApplyingId(null);
      setApplyNote('');
      fetchMyApps();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleViewApp = (app: MyApplication) => {
    setSelectedApp(app);
    setDetailOpen(true);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setProjectDetailOpen(true);
  };

  return (
    <div className="space-y-6 page-enter">
      {/* ---- Hero header ---- */}
      <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,.3),transparent_32%),linear-gradient(135deg,#0f172a,#134e4a_55%,#14b8a6)] p-6 md:p-8 text-white shadow-2xl shadow-teal-900/20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/15 border-white/20 text-white rounded-full px-3 py-1">
              <FlaskConical className="h-3.5 w-3.5 mr-1" /> Research Projects
            </Badge>
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>科研项目</h1>
              <p className="mt-2 max-w-2xl text-sm text-teal-50/80" style={{fontFamily: 'var(--font-body)'}}>
                探索前沿课题，与导师深度合作，积累科研经历。
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{total}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>进行中</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{myApps.length}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>我的申请</p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mt-6 flex gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="搜索科研项目..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-11 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/20 rounded-xl"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="h-11 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl backdrop-blur-sm transition-all"
          >
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
        </div>
      </section>

      {/* ---- Tabs ---- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white p-1 rounded-xl border border-[hsl(30_12%_92%)] shadow-sm">
          <TabsTrigger
            value="projects"
            className="rounded-lg data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white px-6 py-2.5 transition-all"
          >
            <Beaker className="h-4 w-4 mr-2" />
            项目广场
          </TabsTrigger>
          <TabsTrigger
            value="my"
            className="rounded-lg data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white px-6 py-2.5 transition-all"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            我的申请
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-teal-500" />
              <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载科研项目...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center">
                <Inbox className="h-10 w-10 text-teal-300" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
                  暂无科研项目
                </p>
                <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
                  请稍后再试或联系导师了解最新项目
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((p, index) => (
                <Card
                  key={p.id}
                  className={`group relative rounded-xl border-[hsl(30_12%_92%)] card-lift overflow-hidden bg-white hover:border-teal-200 transition-all duration-300 ${
                    mounted ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{animationDelay: `${index * 60}ms`}}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

                  <CardContent className="p-6 pl-7">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 flex items-center justify-center shrink-0 border border-teal-500/15">
                            <FlaskConical className="h-5 w-5 text-teal-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <h3 className="text-base font-medium group-hover:text-teal-600 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                                {p.title}
                              </h3>
                              <Badge className={p.status === 1
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg'
                                : 'bg-gray-50 text-gray-500 border border-gray-200 rounded-lg'
                              }>
                                {p.status === 1 ? '招募中' : '已结束'}
                              </Badge>
                            </div>
                            {p.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2" style={{fontFamily: 'var(--font-body)'}}>
                                {p.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 mt-3">
                              {p.funding && (
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                  <DollarSign className="h-3.5 w-3.5" />
                                  经费：{p.funding}
                                </span>
                              )}
                              {p.duration && (
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                  <Clock className="h-3.5 w-3.5" />
                                  周期：{p.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-16 sm:ml-0 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProject(p)}
                          className="gap-1.5 rounded-xl"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          详情
                        </Button>
                        {p.status === 1 && (
                          <Dialog open={applyingId === p.id} onOpenChange={(open) => { if (!open) { setApplyingId(null); setApplyNote(''); } }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setApplyingId(p.id)}
                                className="gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                                申请加入
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-2xl">
                              <DialogHeader className="dialog-header-gradient pb-4">
                                <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>
                                  申请加入：{p.title}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>
                                    申请备注
                                  </Label>
                                  <Textarea
                                    placeholder="请输入申请备注，介绍你的相关经验和兴趣..."
                                    value={applyNote}
                                    onChange={(e) => setApplyNote(e.target.value)}
                                    rows={4}
                                    className="mt-2 rounded-xl"
                                  />
                                </div>
                                <Button
                                  onClick={() => handleApply(p.id)}
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-500/20"
                                >
                                  提交申请
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
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
                第 {page} 页 / 共 {Math.ceil(total / DEFAULT_PAGE_SIZE)} 页
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
        </TabsContent>

        {/* My Applications Tab */}
        <TabsContent value="my" className="space-y-4">
          {myApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-teal-300" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
                  暂无申请记录
                </p>
                <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
                  去项目广场浏览感兴趣的科研项目吧
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {myApps.map((app, index) => {
                const st = AUDIT_STATUS_MAP[app.application.status] || DEFAULT_AUDIT_STATUS;
                const StatusIcon = statusIcons[app.application.status] || AlertCircle;
                return (
                  <Card
                    key={app.application.id || index}
                    className={`group relative rounded-xl border-[hsl(30_12%_92%)] card-lift cursor-pointer overflow-hidden bg-white hover:border-teal-200 transition-all duration-300 ${
                      mounted ? 'animate-fade-in-up' : 'opacity-0'
                    }`}
                    style={{animationDelay: `${index * 60}ms`}}
                    onClick={() => handleViewApp(app)}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

                    <CardContent className="p-6 pl-7">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 flex items-center justify-center shrink-0 border border-teal-500/15">
                            <FlaskConical className="h-5 w-5 text-teal-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium group-hover:text-teal-600 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                              {app.projectTitle || '科研项目'}
                            </h4>
                            {app.application.note && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1" style={{fontFamily: 'var(--font-body)'}}>
                                {app.application.note}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                <Calendar className="h-3.5 w-3.5" />
                                {formatTime(app.application.createTime)}
                              </span>
                              <Badge className={`${st.color} text-xs px-2.5 py-0.5 rounded-lg border`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {st.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 rounded-xl shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleViewApp(app); }}
                        >
                          <Eye className="h-4 w-4 text-teal-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Project Detail Dialog */}
      <Dialog open={projectDetailOpen} onOpenChange={setProjectDetailOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>
              项目详情
            </DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 flex items-center justify-center border border-teal-500/15">
                  <FlaskConical className="h-6 w-6 text-teal-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold" style={{fontFamily: 'var(--font-display)'}}>
                    {selectedProject.title}
                  </h3>
                  <Badge className={selectedProject.status === 1
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 mt-2 rounded-lg'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 mt-2 rounded-lg'
                  }>
                    {selectedProject.status === 1 ? '招募中' : '已结束'}
                  </Badge>
                </div>
              </div>

              {selectedProject.description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>项目描述</h4>
                  <p className="text-sm p-4 bg-[hsl(30_12%_96%)] rounded-xl" style={{fontFamily: 'var(--font-body)'}}>
                    {selectedProject.description}
                  </p>
                </div>
              )}

              {selectedProject.requirement && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>招募要求</h4>
                  <p className="text-sm p-4 bg-[hsl(30_12%_96%)] rounded-xl" style={{fontFamily: 'var(--font-body)'}}>
                    {selectedProject.requirement}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedProject.funding && (
                  <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-teal-500" />
                      <span className="text-xs text-teal-600" style={{fontFamily: 'var(--font-body)'}}>项目经费</span>
                    </div>
                    <p className="text-sm font-medium text-teal-800" style={{fontFamily: 'var(--font-body)'}}>{selectedProject.funding}</p>
                  </div>
                )}
                {selectedProject.duration && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600" style={{fontFamily: 'var(--font-body)'}}>项目周期</span>
                    </div>
                    <p className="text-sm font-medium text-emerald-800" style={{fontFamily: 'var(--font-body)'}}>{selectedProject.duration}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>
              申请详情
            </DialogTitle>
          </DialogHeader>
          {selectedApp && (() => {
            const st = AUDIT_STATUS_MAP[selectedApp.application.status] || DEFAULT_AUDIT_STATUS;
            const StatusIcon = statusIcons[selectedApp.application.status] || AlertCircle;
            return (
              <div className="space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-[hsl(30_12%_92%)]">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 flex items-center justify-center border border-teal-500/15">
                    <FlaskConical className="h-6 w-6 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{fontFamily: 'var(--font-display)'}}>
                      {selectedApp.projectTitle || '科研项目'}
                    </h3>
                    <Badge className={`${st.color} mt-1 border`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {st.label}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>申请信息</h4>
                  <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                    <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>申请时间</p>
                    <p className="text-sm font-medium mt-1" style={{fontFamily: 'var(--font-body)'}}>
                      {formatTime(selectedApp.application.createTime)}
                    </p>
                  </div>
                </div>

                {selectedApp.application.note && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>申请备注</h4>
                    <p className="text-sm p-4 bg-teal-50 rounded-xl border border-teal-200" style={{fontFamily: 'var(--font-body)'}}>
                      {selectedApp.application.note}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
