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
  Search, Users, Trophy, Eye, Plus, CheckCircle, XCircle,
  Clock, MessageSquare, Send, Calendar, UserPlus, Inbox,
  Sparkles, Filter, Crown, Shield, Star, ArrowRight,
} from 'lucide-react';
import { typedGet, typedPost } from '@/lib/api';
import { formatTime, formatDate } from '@/lib/utils';
import type { CompetitionTeam, TeamApplication, TeamMessage } from '@/lib/types';
import { AUDIT_STATUS_MAP, DEFAULT_AUDIT_STATUS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { toast } from 'sonner';

export default function Competition() {
  const [teams, setTeams] = useState<CompetitionTeam[]>([]);
  const [myTeams, setMyTeams] = useState<CompetitionTeam[]>([]);
  const [myApps, setMyApps] = useState<TeamApplication[]>([]);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [skillTag, setSkillTag] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('teams');

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState<number | null>(null);
  const [applyNote, setApplyNote] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<CompetitionTeam | null>(null);
  const [manageTeamId, setManageTeamId] = useState<number | null>(null);
  const [teamApps, setTeamApps] = useState<TeamApplication[]>([]);
  const [manageOpen, setManageOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTeamId, setMessageTeamId] = useState<number | null>(null);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Create form
  const [form, setForm] = useState({
    title: '', competitionName: '', description: '', requirement: '',
    skillTags: '', maxMembers: '', deadline: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, size: 10 };
      if (searchKeyword) params.keyword = searchKeyword;
      if (skillTag) params.skillTag = skillTag;
      const data = await typedGet('/competition/list', { params });
      setTeams((data as any)?.records || []);
      setTotal((data as any)?.total || 0);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, searchKeyword, skillTag]);

  const fetchMyTeams = async () => {
    try {
      const data = await typedGet('/competition/my/teams');
      setMyTeams((data as any) || []);
    } catch { /* ignore */ }
  };

  const fetchMyApps = async () => {
    try {
      const data = await typedGet('/competition/my/applications');
      setMyApps((data as any) || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchTeams(); fetchMyTeams(); fetchMyApps(); }, [fetchTeams]);

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setPage(1);
  };

  const handleCreate = async () => {
    if (!form.title || !form.competitionName) {
      toast.error('请填写队伍名称和竞赛名称');
      return;
    }
    try {
      await typedPost('/competition/publish', {
        title: form.title,
        competitionName: form.competitionName,
        description: form.description,
        requirement: form.requirement,
        skillTags: form.skillTags,
        maxMembers: form.maxMembers ? parseInt(form.maxMembers) : null,
        deadline: form.deadline || null,
      });
      toast.success('发布成功');
      setCreateOpen(false);
      setForm({ title: '', competitionName: '', description: '', requirement: '', skillTags: '', maxMembers: '', deadline: '' });
      fetchTeams();
      fetchMyTeams();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleApply = async (teamId: number) => {
    if (!applyNote.trim()) {
      toast.error('请填写申请备注');
      return;
    }
    try {
      await typedPost(`/competition/apply?teamId=${teamId}&note=${encodeURIComponent(applyNote)}`);
      toast.success('申请成功');
      setApplyOpen(null);
      setApplyNote('');
      fetchMyApps();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openDetail = (team: any) => {
    setSelectedTeam(team);
    setDetailOpen(true);
  };

  const openManage = async (teamId: number) => {
    setManageTeamId(teamId);
    setManageOpen(true);
    try {
      const data = await typedGet(`/competition/team/${teamId}/applications`);
      setTeamApps((data as any) || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAudit = async (applicationId: number, status: number) => {
    try {
      await typedPost(`/competition/audit?applicationId=${applicationId}&status=${status}`);
      toast.success(status === 1 ? '已通过' : '已拒绝');
      if (manageTeamId) {
        const data = await typedGet(`/competition/team/${manageTeamId}/applications`);
        setTeamApps((data as any) || []);
      }
      fetchMyTeams();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openMessages = async (teamId: number) => {
    setMessageTeamId(teamId);
    setMessageOpen(true);
    try {
      const data = await typedGet(`/competition/team/${teamId}/messages`);
      setMessages((data as any) || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const sendMessage = async () => {
    if (!messageTeamId || !newMessage.trim()) return;
    try {
      await typedPost(`/competition/team/${messageTeamId}/message?content=${encodeURIComponent(newMessage)}`);
      setNewMessage('');
      const data = await typedGet(`/competition/team/${messageTeamId}/messages`);
      setMessages((data as any) || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      {/* ---- Hero header ---- */}
      <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,.3),transparent_32%),linear-gradient(135deg,#1c1917,#78350f_55%,#f59e0b)] p-6 md:p-8 text-white shadow-2xl shadow-amber-900/20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/15 border-white/20 text-white rounded-full px-3 py-1">
              <Trophy className="h-3.5 w-3.5 mr-1" /> Team Up
            </Badge>
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>竞赛组队</h1>
              <p className="mt-2 max-w-2xl text-sm text-amber-50/80" style={{fontFamily: 'var(--font-body)'}}>
                找到志同道合的队友，一起冲击奖项。
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{total}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>招募中</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{myTeams.length}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>我的队伍</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{myApps.length}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>我的申请</p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mt-6 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="搜索队伍或竞赛..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-11 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/20 rounded-xl"
            />
          </div>
          <Input
            placeholder="技能筛选"
            value={skillTag}
            onChange={(e) => setSkillTag(e.target.value)}
            className="w-32 h-11 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/20 rounded-xl"
          />
          <Button
            onClick={handleSearch}
            className="h-11 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl backdrop-blur-sm transition-all"
          >
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 bg-white text-amber-700 hover:bg-amber-50 rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                发布组队
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader className="dialog-header-gradient pb-4">
                <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>
                  发布组队信息
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>队伍名称 *</Label>
                  <Input
                    placeholder="例：XX竞赛冲锋队"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    className="mt-2 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>竞赛名称 *</Label>
                  <Input
                    placeholder="例：互联网+创新创业大赛"
                    value={form.competitionName}
                    onChange={(e) => setForm({...form, competitionName: e.target.value})}
                    className="mt-2 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>队伍描述</Label>
                  <Textarea
                    placeholder="介绍你的队伍和目标..."
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    rows={3}
                    className="mt-2 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>招募要求</Label>
                  <Textarea
                    placeholder="希望队友具备哪些能力..."
                    value={form.requirement}
                    onChange={(e) => setForm({...form, requirement: e.target.value})}
                    rows={3}
                    className="mt-2 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>技能标签</Label>
                    <Input
                      placeholder="用逗号分隔"
                      value={form.skillTags}
                      onChange={(e) => setForm({...form, skillTags: e.target.value})}
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>最大人数</Label>
                    <Input
                      type="number"
                      placeholder="例：5"
                      value={form.maxMembers}
                      onChange={(e) => setForm({...form, maxMembers: e.target.value})}
                      className="mt-2 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>截止日期</Label>
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({...form, deadline: e.target.value})}
                    className="mt-2 rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20"
                >
                  发布组队
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* ---- Tabs ---- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white p-1 rounded-xl border border-[hsl(30_12%_92%)] shadow-sm">
          <TabsTrigger
            value="teams"
            className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white px-5 py-2.5 transition-all"
          >
            <Users className="h-4 w-4 mr-2" />
            组队广场
          </TabsTrigger>
          <TabsTrigger
            value="my-teams"
            className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white px-5 py-2.5 transition-all"
          >
            <Crown className="h-4 w-4 mr-2" />
            我的队伍
          </TabsTrigger>
          <TabsTrigger
            value="my-apps"
            className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white px-5 py-2.5 transition-all"
          >
            <Send className="h-4 w-4 mr-2" />
            我的申请
          </TabsTrigger>
        </TabsList>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-amber-500" />
              <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载组队信息...</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Inbox className="h-10 w-10 text-amber-300" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
                  暂无组队信息
                </p>
                <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
                  成为第一个发布组队信息的人吧
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {teams.map((team, index) => (
                <Card
                  key={team.id}
                  className={`group relative rounded-xl border-[hsl(30_12%_92%)] card-lift overflow-hidden bg-white hover:border-amber-200 transition-all duration-300 ${
                    mounted ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{animationDelay: `${index * 60}ms`}}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

                  <CardContent className="p-6 pl-7">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center shrink-0 border border-amber-500/15">
                            <Trophy className="h-5 w-5 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium group-hover:text-amber-600 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                              {team.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>
                              {team.competitionName}
                            </p>
                            {team.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2" style={{fontFamily: 'var(--font-body)'}}>
                                {team.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-3">
                              {team.skillTags && team.skillTags.split(',').map((tag: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs rounded-lg border-amber-200 text-amber-700 bg-amber-50">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-4 mt-3">
                              <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                <Users className="h-3.5 w-3.5" />
                                {team.currentMembers || 1}/{team.maxMembers || '不限'}人
                              </span>
                              {team.deadline && (
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                  <Calendar className="h-3.5 w-3.5" />
                                  截止：{formatDate(team.deadline)}
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
                          onClick={() => openDetail(team)}
                          className="gap-1.5 rounded-xl"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          详情
                        </Button>
                        <Dialog open={applyOpen === team.id} onOpenChange={(open) => { if (!open) { setApplyOpen(null); setApplyNote(''); } }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setApplyOpen(team.id)}
                              className="gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              申请加入
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-2xl">
                            <DialogHeader className="dialog-header-gradient pb-4">
                              <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>
                                申请加入：{team.title}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>
                                  申请备注 *
                                </Label>
                                <Textarea
                                  placeholder="介绍你自己，为什么想加入..."
                                  value={applyNote}
                                  onChange={(e) => setApplyNote(e.target.value)}
                                  rows={4}
                                  className="mt-2 rounded-xl"
                                />
                              </div>
                              <Button
                                onClick={() => handleApply(team.id)}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20"
                              >
                                提交申请
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
        </TabsContent>

        {/* My Teams Tab */}
        <TabsContent value="my-teams" className="space-y-4">
          {myTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Crown className="h-10 w-10 text-amber-300" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
                  暂无队伍
                </p>
                <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
                  发布组队信息或申请加入其他队伍
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {myTeams.map((team, index) => (
                <Card
                  key={team.id}
                  className={`group relative rounded-xl border-[hsl(30_12%_92%)] card-lift overflow-hidden bg-white hover:border-amber-200 transition-all duration-300 ${
                    mounted ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{animationDelay: `${index * 60}ms`}}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

                  <CardContent className="p-6 pl-7">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center shrink-0 border border-amber-500/15">
                          <Crown className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium group-hover:text-amber-600 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                            {team.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>
                            {team.competitionName}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <Users className="h-3.5 w-3.5" />
                              {team.currentMembers || 1}/{team.maxMembers || '不限'}人
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openManage(team.id)}
                          className="gap-1.5 rounded-xl"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          管理
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openMessages(team.id)}
                          className="gap-1.5 rounded-xl"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          群聊
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Applications Tab */}
        <TabsContent value="my-apps" className="space-y-4">
          {myApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Send className="h-10 w-10 text-amber-300" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
                  暂无申请记录
                </p>
                <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
                  去组队广场寻找感兴趣的队伍吧
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {myApps.map((app, index) => {
                const st = AUDIT_STATUS_MAP[app.application.status] || DEFAULT_AUDIT_STATUS;
                return (
                  <Card
                    key={app.id || index}
                    className={`group relative rounded-xl border-[hsl(30_12%_92%)] card-lift overflow-hidden bg-white hover:border-amber-200 transition-all duration-300 ${
                      mounted ? 'animate-fade-in-up' : 'opacity-0'
                    }`}
                    style={{animationDelay: `${index * 60}ms`}}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

                    <CardContent className="p-6 pl-7">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center shrink-0 border border-amber-500/15">
                            <Trophy className="h-5 w-5 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium" style={{fontFamily: 'var(--font-body)'}}>
                              {app.teamTitle || '队伍申请'}
                            </h4>
                            {app.note && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1" style={{fontFamily: 'var(--font-body)'}}>
                                {app.note}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                <Calendar className="h-3.5 w-3.5" />
                                {formatTime(app.application.createTime)}
                              </span>
                              <Badge className={`${st.color} text-xs px-2.5 py-0.5 rounded-lg border`}>
                                {st.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Team Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>
              队伍详情
            </DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center border border-amber-500/15">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold" style={{fontFamily: 'var(--font-display)'}}>
                    {selectedTeam.title}
                  </h3>
                  <p className="text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>
                    {selectedTeam.competitionName}
                  </p>
                </div>
              </div>

              {selectedTeam.description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>队伍描述</h4>
                  <p className="text-sm p-4 bg-[hsl(30_12%_96%)] rounded-xl" style={{fontFamily: 'var(--font-body)'}}>
                    {selectedTeam.description}
                  </p>
                </div>
              )}

              {selectedTeam.requirement && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>招募要求</h4>
                  <p className="text-sm p-4 bg-[hsl(30_12%_96%)] rounded-xl" style={{fontFamily: 'var(--font-body)'}}>
                    {selectedTeam.requirement}
                  </p>
                </div>
              )}

              {selectedTeam.skillTags && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>技能标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeam.skillTags.split(',').map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="rounded-lg border-amber-200 text-amber-700 bg-amber-50">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-amber-600" style={{fontFamily: 'var(--font-body)'}}>队伍人数</span>
                  </div>
                  <p className="text-sm font-medium text-amber-800" style={{fontFamily: 'var(--font-body)'}}>
                    {selectedTeam.currentMembers || 1}/{selectedTeam.maxMembers || '不限'}人
                  </p>
                </div>
                {selectedTeam.deadline && (
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-orange-600" style={{fontFamily: 'var(--font-body)'}}>截止日期</span>
                    </div>
                    <p className="text-sm font-medium text-orange-800" style={{fontFamily: 'var(--font-body)'}}>
                      {formatDate(selectedTeam.deadline)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Team Dialog */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>
              管理申请
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {teamApps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                暂无申请
              </div>
            ) : (
              teamApps.map((app) => {
                const st = AUDIT_STATUS_MAP[app.application.status] || DEFAULT_AUDIT_STATUS;
                return (
                  <div key={app.application.id} className="p-4 rounded-xl border border-[hsl(30_12%_92%)] bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium" style={{fontFamily: 'var(--font-body)'}}>{app.studentName || '申请人'}</p>
                        {app.application.note && (
                          <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>{app.application.note}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>
                          {formatTime(app.application.createTime)}
                        </p>
                      </div>
                      {app.application.status === 0 && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAudit(app.application.id, 1)}
                            className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            通过
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAudit(app.application.id, 2)}
                            className="gap-1 rounded-xl text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            拒绝
                          </Button>
                        </div>
                      )}
                      {app.application.status !== 0 && (
                        <Badge className={`${st.color} border rounded-lg`}>{st.label}</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Messages Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>
              队伍群聊
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-[300px] overflow-y-auto space-y-3 p-4 bg-[hsl(30_12%_96%)] rounded-xl">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                  暂无消息
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-amber-600">
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
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
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
