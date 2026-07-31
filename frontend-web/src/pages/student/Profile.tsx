import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, FlaskConical, Trophy, Clock, Star, Award, TrendingUp, Crown } from 'lucide-react';
import { typedGet, typedPut } from '@/lib/api';
import { formatTime, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface TimelineEvent {
  type: 'internship' | 'research' | 'competition';
  date: string;
  title: string;
  detail: string;
  status: string;
}

interface VipAlert {
  latestJobs: Array<{
    id: number;
    title: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
    skillTags: string;
  }>;
}

const typeConfig: Record<string, { icon: typeof Briefcase; color: string; bg: string; label: string; border: string; gradient: string }> = {
  internship: { icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100', label: '实习', border: 'border-l-blue-400', gradient: 'from-blue-400 to-cyan-400' },
  research: { icon: FlaskConical, color: 'text-teal-600', bg: 'bg-teal-100', label: '科研', border: 'border-l-teal-400', gradient: 'from-teal-400 to-emerald-400' },
  competition: { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100', label: '竞赛', border: 'border-l-amber-400', gradient: 'from-amber-400 to-orange-400' },
};

// formatTime/formatDate 已从 @/lib/utils 导入

export default function Profile() {
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [memberLevel, setMemberLevel] = useState(0);
  const [vipAlerts, setVipAlerts] = useState<VipAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [timelineRes, levelRes, alertsRes] = await Promise.allSettled([
          typedGet<TimelineEvent[]>('/profile/timeline'),
          typedGet<{ memberLevel: number }>('/member/level'),
          typedGet<VipAlert>('/member/alerts'),
        ]);
        if (timelineRes.status === 'fulfilled') {
          setTimeline(timelineRes.value || []);
        }
        if (levelRes.status === 'fulfilled') {
          setMemberLevel(levelRes.value?.memberLevel || 0);
        }
        if (alertsRes.status === 'fulfilled') {
          setVipAlerts(alertsRes.value || null);
        }
      } catch (err: unknown) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleVip = async () => {
    try {
      const data = await typedPut<{ memberLevel: number }>('/member/toggle');
      setMemberLevel(data.memberLevel);
      toast.success(data.memberLevel === 1 ? '已升级为VIP' : '已降级为普通用户');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    }
  };

  const stats = {
    internships: timeline.filter(e => e.type === 'internship').length,
    research: timeline.filter(e => e.type === 'research').length,
    competition: timeline.filter(e => e.type === 'competition').length,
  };

  const statCards = [
    { label: '会员等级', value: memberLevel === 1 ? 'VIP' : '普通', icon: Star, gradient: 'from-amber-50 to-yellow-50/50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { label: '实习经历', value: stats.internships, icon: Briefcase, gradient: 'from-indigo-50 to-indigo-50/50', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    { label: '科研项目', value: stats.research, icon: FlaskConical, gradient: 'from-teal-50 to-teal-50/50', iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
    { label: '竞赛组队', value: stats.competition, icon: Trophy, gradient: 'from-amber-50 to-orange-50/50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Profile Header Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,.3),transparent_32%),linear-gradient(135deg,#0f172a,#064e3b_55%,#10b981)] p-6 md:p-8 text-white shadow-2xl shadow-emerald-900/20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/15 border-white/20 text-white rounded-full px-3 py-1">
              <Star className="h-3.5 w-3.5 mr-1" /> Profile Center
            </Badge>
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>个人中心</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50/80" style={{fontFamily: 'var(--font-body)'}}>
                管理你的成长轨迹，追踪实习、科研和竞赛经历。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {memberLevel === 1 && (
              <Badge className="bg-amber-400/20 border-amber-300/30 text-amber-200 rounded-full px-3 py-1">
                ⭐ VIP 会员
              </Badge>
            )}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{stats.internships + stats.research + stats.competition}</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>总经历</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className={`rounded-2xl border-border/60 card-lift bg-gradient-to-br ${card.gradient} overflow-hidden relative group`}>
              <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-5 text-center relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center mx-auto mb-3 shadow-sm`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{card.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* VIP Toggle */}
      <Card className={`rounded-2xl border-border/60 card-lift transition-all duration-300 ${
        memberLevel === 1
          ? 'border-amber-200/60 bg-gradient-to-r from-amber-50/80 via-yellow-50/60 to-orange-50/40 shadow-amber-100/50 shadow-lg'
          : ''
      }`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              memberLevel === 1
                ? 'bg-gradient-to-br from-amber-200 to-yellow-300 shadow-md shadow-amber-200/50'
                : 'bg-gray-100'
            }`}>
              <Award className={`h-5 w-5 ${memberLevel === 1 ? 'text-amber-700' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="font-semibold">{memberLevel === 1 ? 'VIP 会员' : '普通用户'}</h3>
              <p className="text-sm text-muted-foreground">{memberLevel === 1 ? '享受专属岗位推荐和优先匹配' : '升级VIP获取更多机会'}</p>
            </div>
          </div>
          <Button
            variant={memberLevel === 1 ? 'outline' : 'default'}
            onClick={() => navigate('/app/vip')}
            className={memberLevel === 1 ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : ''}
          >
            {memberLevel === 1 ? (
              <>
                <Crown className="h-4 w-4 mr-1" />
                会员详情
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-1" />
                升级VIP
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* VIP Alerts */}
      {memberLevel === 1 && vipAlerts && vipAlerts.latestJobs && vipAlerts.latestJobs.length > 0 && (
        <Card className="rounded-2xl border-amber-200/60 overflow-hidden card-lift relative">
          {/* Decorative shimmer background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 via-yellow-50/60 to-orange-50/40" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-200/15 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
          {/* Star pattern decorative dots */}
          <div className="absolute top-4 right-6 text-amber-300/30 text-xs tracking-[0.5em] select-none">✦ ✦ ✦ ✦ ✦</div>
          <div className="absolute bottom-4 left-6 text-amber-300/20 text-xs tracking-[0.5em] select-none">✦ ✦ ✦ ✦ ✦</div>

          <div className="relative z-10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 to-yellow-300 flex items-center justify-center shadow-sm">
                  <Star className="h-4 w-4 text-amber-700" />
                </div>
                <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                  VIP 专属推荐
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vipAlerts.latestJobs.map((job) => (
                  <div key={job.id} className="flex justify-between items-center p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-amber-100/60 hover:shadow-md hover:border-amber-200/80 transition-all duration-200 group">
                    <div>
                      <h4 className="font-medium group-hover:text-amber-800 transition-colors">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.location || '-'}</p>
                      {job.skillTags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {job.skillTags.split(',').slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200/60">{tag.trim()}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="text-sm font-semibold text-amber-600 whitespace-nowrap">
                        {job.salaryMin && job.salaryMax ? `${job.salaryMin}-${job.salaryMax}元` : job.salaryMin ? `${job.salaryMin}元起` : `最高${job.salaryMax}元`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Timeline */}
      <Card className="rounded-2xl border-border/60 card-lift overflow-hidden">
        <CardHeader className="border-b border-border/40">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary)/0.15)] to-[hsl(var(--primary-light)/0.15)] flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
            </div>
            成长时间线
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {timeline.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground">暂无成长记录</p>
              <p className="text-xs text-muted-foreground/60 mt-1">开始你的实习、科研或竞赛之旅吧</p>
            </div>
          ) : (
            <div className="relative">
              {/* Gradient connecting line */}
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-300 via-teal-300 to-amber-300 rounded-full" />
              <div className="space-y-6">
                {timeline.map((event, i) => {
                  const config = typeConfig[event.type] || typeConfig.internship;
                  const Icon = config.icon;
                  return (
                    <div key={i} className="relative flex gap-4 group/item">
                      {/* Gradient circle node */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0 z-10 shadow-md shadow-black/10 ring-2 ring-white group-hover/item:scale-110 transition-transform duration-200`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className={`flex-1 pb-2 pl-1 border-l-2 ${config.border} rounded-r-lg ml-[-1px] transition-all duration-200`}>
                        <div className="bg-card/50 hover:bg-card rounded-xl p-4 -ml-4 border border-transparent hover:border-border/40 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <Badge variant="secondary" className="text-xs font-medium">{config.label}</Badge>
                            <Badge
                              variant={event.status === '进行中' || event.status === '申请中' ? 'default' : event.status === '已通过' || event.status === '已完成' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {event.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                              <Clock className="h-3 w-3" />{formatDate(event.date)}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          {event.detail && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{event.detail}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
