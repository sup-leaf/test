import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { typedGet, typedPut } from '@/lib/api';
import type { VipAlert } from '@/lib/types';
import { getUser, setUser } from '@/lib/auth';
import { toast } from 'sonner';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Crown,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

type MemberLevel = {
  memberLevel?: number;
  level?: number;
  isVip?: boolean;
  label?: string;
};

type VipStats = {
  major?: string;
  sameMajorJobCount?: number;
  jobCount?: number;
  competitionRatio?: number;
  deliveryCount?: number;
  avgSalaryMin?: number;
  avgSalaryMax?: number;
  [key: string]: unknown;
};

const statLabels: Record<string, string> = {
  sameMajorJobCount: '同专业岗位',
  jobCount: '岗位总量',
  competitionRatio: '竞争指数',
  deliveryCount: '我的投递',
  avgSalaryMin: '平均最低薪资',
  avgSalaryMax: '平均最高薪资',
};

export default function MemberCenter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [level, setLevel] = useState<MemberLevel | null>(null);
  const [alerts, setAlerts] = useState<VipAlert[]>([]);
  const [stats, setStats] = useState<VipStats | null>(null);

  const isVip = useMemo(() => {
    const value = level?.memberLevel ?? level?.level ?? getUser()?.memberLevel ?? 0;
    return level?.isVip || Number(value) === 1;
  }, [level]);

  const loadData = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const memberLevel = await typedGet<MemberLevel>('/member/level');
      setLevel(memberLevel || {});
      const resolvedVip = memberLevel?.isVip || Number(memberLevel?.memberLevel ?? memberLevel?.level ?? 0) === 1;

      if (resolvedVip) {
        const [alertData, statData] = await Promise.all([
          typedGet<any>('/member/alerts'),
          typedGet<VipStats>('/member/stats'),
        ]);
        const rawAlerts = alertData?.records || alertData?.alerts || alertData;
        setAlerts(Array.isArray(rawAlerts) ? rawAlerts : []);
        setStats(statData || null);
      } else {
        setAlerts([]);
        setStats(null);
      }
    } catch (err: any) {
      toast.error(err.message || '会员数据加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleVip = async () => {
    try {
      const data = await typedPut<MemberLevel>('/member/toggle');
      setLevel(data || {});
      const user = getUser();
      const nextLevel = Number(data?.memberLevel ?? data?.level ?? 0);
      if (user) setUser({ ...user, memberLevel: nextLevel });
      toast.success(nextLevel === 1 ? '已切换为 VIP 会员' : '已切换为免费会员');
      await loadData(true);
    } catch (err: any) {
      toast.error(err.message || '会员切换失败');
    }
  };

  const visibleStats = Object.entries(stats || {})
    .filter(([key, value]) => key !== 'major' && value !== null && value !== undefined && ['string', 'number'].includes(typeof value));

  return (
    <div className="space-y-6 page-enter">
      <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,.38),transparent_32%),linear-gradient(135deg,#1f1302,#92400e_55%,#f59e0b)] p-6 md:p-8 text-white shadow-2xl shadow-amber-900/20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/15 border-white/20 text-white rounded-full px-3 py-1">
              <Crown className="h-3.5 w-3.5 mr-1" /> Member Intelligence
            </Badge>
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>会员中心</h1>
              <p className="mt-2 max-w-2xl text-sm text-amber-50/80" style={{ fontFamily: 'var(--font-body)' }}>
                用简历技能触发岗位雷达、竞争态势和会员等级能力，让求职决策更像一间私人情报室。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => loadData(true)} disabled={refreshing} className="rounded-xl bg-white/15 text-white border border-white/20 hover:bg-white/25">
              {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}刷新
            </Button>
            {!isVip && <Button onClick={() => navigate('/app/vip')} className="rounded-xl bg-white text-amber-700 hover:bg-amber-50">开通 VIP<ArrowRight className="h-4 w-4 ml-2" /></Button>}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground"><Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-amber-500" />正在读取会员权益...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="rounded-2xl border-amber-200 bg-gradient-to-br from-amber-50 to-white lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center"><Crown className="h-6 w-6 text-amber-600" /></div>
                  <Badge className={isVip ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}>{isVip ? 'VIP 已激活' : '免费会员'}</Badge>
                </div>
                <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{isVip ? '专属情报已解锁' : '升级后解锁岗位情报'}</h2>
                <p className="text-sm text-muted-foreground mt-2">当前等级：{level?.label || (isVip ? 'VIP' : 'Free')}</p>
                <div className="mt-5 flex gap-2">
                  <Button onClick={toggleVip} variant="outline" className="rounded-xl flex-1">测试切换等级</Button>
                  <Button onClick={() => navigate('/app/vip')} className="rounded-xl flex-1 bg-amber-500 hover:bg-amber-600">支付页</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/60 lg:col-span-2">
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-amber-600" />VIP 数据洞察</CardTitle></CardHeader>
              <CardContent>
                {!isVip ? (
                  <div className="text-sm text-muted-foreground py-6">开通 VIP 后可查看同专业岗位数、竞争比和薪资区间等统计。</div>
                ) : visibleStats.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6">暂无统计数据，完善简历后再来看看。</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {visibleStats.map(([key, value]) => (
                      <div key={key} className="rounded-2xl bg-[hsl(40_30%_97%)] border border-[hsl(30_20%_90%)] p-4">
                        <p className="text-xs text-muted-foreground">{statLabels[key] || key}</p>
                        <p className="text-2xl font-semibold mt-1 text-foreground">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-border/60">
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-600" />技能匹配岗位提醒</CardTitle></CardHeader>
            <CardContent>
              {!isVip ? (
                <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-8 text-center">
                  <Zap className="h-10 w-10 mx-auto text-amber-500 mb-3" />
                  <p className="font-medium text-amber-900">VIP 专属提醒尚未开启</p>
                  <p className="text-sm text-amber-700/70 mt-1">开通后将根据简历技能自动推荐高匹配岗位。</p>
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">暂无匹配提醒，建议先完善简历技能标签。</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alerts.map((job, index) => (
                    <div key={`${job.jobId}-${index}`} className="group rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/50 p-5 hover:shadow-lg hover:shadow-amber-900/10 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><Target className="h-5 w-5 text-amber-600" /></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-amber-700 transition-colors">{job.title}</h3>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                            {job.companyName && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.companyName}</span>}
                            {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
                            {(job.salaryMin || job.salaryMax) && <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{job.salaryMin || '-'}-{job.salaryMax || '-'} 元</span>}
                          </div>
                          {job.reason && <p className="mt-3 text-sm text-amber-700/80">{job.reason}</p>}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/app/jobs/${job.jobId}`)} className="rounded-xl">查看</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
