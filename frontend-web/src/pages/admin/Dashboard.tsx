import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Building2, Briefcase, Send, BookOpen, TrendingUp, Star, AlertTriangle } from 'lucide-react';
import { typedGet } from '@/lib/api';
import { toast } from 'sonner';

interface Overview {
  studentCount: number;
  enterpriseCount: number;
  jobCount: number;
  deliveryCountThisMonth: number;
  internshipRate: number;
  internshipTotal: number;
  internshipActive: number;
}

const statStyles = [
  { bg: 'from-[hsl(25_70%_48%/0.04)] to-[hsl(25_70%_48%/0.02)]', iconBg: 'bg-[hsl(25_70%_48%/0.08)]', iconColor: 'text-[hsl(var(--primary))]' },
  { bg: 'from-[hsl(40_80%_55%/0.04)] to-[hsl(40_80%_55%/0.02)]', iconBg: 'bg-[hsl(40_80%_55%/0.08)]', iconColor: 'text-[hsl(var(--accent))]' },
  { bg: 'from-[hsl(15_60%_55%/0.04)] to-[hsl(15_60%_55%/0.02)]', iconBg: 'bg-[hsl(15_60%_55%/0.08)]', iconColor: 'text-[hsl(15_60%_55%)]' },
  { bg: 'from-[hsl(170_40%_45%/0.04)] to-[hsl(170_40%_45%/0.02)]', iconBg: 'bg-[hsl(170_40%_45%/0.08)]', iconColor: 'text-[hsl(170_40%_45%)]' },
  { bg: 'from-[hsl(200_50%_50%/0.04)] to-[hsl(200_50%_50%/0.02)]', iconBg: 'bg-[hsl(200_50%_50%/0.08)]', iconColor: 'text-[hsl(200_50%_50%)]' },
  { bg: 'from-[hsl(340_50%_55%/0.04)] to-[hsl(340_50%_55%/0.02)]', iconBg: 'bg-[hsl(340_50%_55%/0.08)]', iconColor: 'text-[hsl(340_50%_55%)]' },
];

const rankBadgeStyles = [
  'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-sm shadow-amber-200',
  'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm shadow-gray-200',
  'bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-sm shadow-orange-200',
];

export default function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [majorData, setMajorData] = useState<Array<Record<string, unknown>>>([]);
  const [trendData, setTrendData] = useState<Array<Record<string, unknown>>>([]);
  const [topEnterprises, setTopEnterprises] = useState<Array<Record<string, unknown>>>([]);
  const [hotJobs, setHotJobs] = useState<Array<Record<string, unknown>>>([]);
  const [enterpriseRatings, setEnterpriseRatings] = useState<Array<Record<string, unknown>>>([]);
  const [staleJobs, setStaleJobs] = useState<Array<Record<string, unknown>>>([]);
  const [internshipStats, setInternshipStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        typedGet('/admin/stats/overview'),
        typedGet('/admin/stats/major'),
        typedGet('/admin/stats/trend'),
        typedGet('/admin/stats/top-enterprises'),
        typedGet('/admin/stats/hot-jobs'),
        typedGet('/admin/stats/enterprise-rating'),
        typedGet('/admin/stats/stale-jobs'),
        typedGet('/admin/stats/internship'),
      ]);

      const get = (r: PromiseSettledResult<unknown>) => r.status === 'fulfilled' ? r.value : null;

      const ov = get(results[0]);
      if (ov) setOverview(ov);
      else toast.error('加载概览数据失败');

      setMajorData(get(results[1])?.majors || []);
      setTrendData(get(results[2])?.trend || []);
      setTopEnterprises(get(results[3])?.enterprises || []);
      setHotJobs(get(results[4])?.jobs || []);
      setEnterpriseRatings(get(results[5])?.enterprises || []);
      setStaleJobs(get(results[6])?.jobs || []);
      setInternshipStats(get(results[7]));
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <div className="text-center py-10 text-muted-foreground">加载中...</div>;
  if (!overview) return <div className="text-center py-10 text-muted-foreground">数据加载失败，请刷新页面</div>;

  const statCards = [
    { label: '学生总数', value: overview.studentCount, icon: Users, color: 'text-indigo-600' },
    { label: '入驻企业', value: overview.enterpriseCount, icon: Building2, color: 'text-emerald-600' },
    { label: '发布岗位', value: overview.jobCount, icon: Briefcase, color: 'text-amber-600' },
    { label: '本月投递', value: overview.deliveryCountThisMonth, icon: Send, color: 'text-teal-600' },
    { label: '实习总人次', value: overview.internshipTotal, icon: BookOpen, color: 'text-cyan-600' },
    { label: '进行中实习', value: overview.internshipActive, icon: TrendingUp, color: 'text-pink-500' },
  ];

  const chartTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    fontSize: '13px',
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Gradient Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(20_12%_18%)] via-[hsl(25_10%_22%)] to-[hsl(30_8%_16%)] p-6 md:p-8 text-white">
        <div className="absolute inset-0 noise" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[hsl(var(--primary)/0.08)] rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[hsl(var(--accent)/0.06)] rounded-full blur-2xl" />
        <h2 className="text-2xl relative" style={{fontFamily: 'var(--font-display)'}}>数据大屏</h2>
        <p className="text-white/35 text-sm mt-1 relative" style={{fontFamily: 'var(--font-body)'}}>校园人才供需平台运营数据总览</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          const style = statStyles[i];
          return (
            <Card key={s.label} className={`rounded-xl border-[hsl(30_12%_92%)] card-lift bg-gradient-to-br ${style.bg} bg-white`}>
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`h-5 w-5 ${style.iconColor}`} />
                </div>
                <p className="text-xl font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>{s.value ?? 0}</p>
                <p className="text-[11px] text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Delivery Trend */}
        <Card className="rounded-xl border-[hsl(30_12%_92%)] card-lift overflow-hidden bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2.5" style={{fontFamily: 'var(--font-body)'}}>
              <span className="w-1 h-5 bg-[hsl(var(--primary))] rounded-full" />
              近7天投递趋势
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gradient-to-b from-[hsl(var(--primary)/0.02)] to-transparent pt-2">
            {trendData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">暂无数据</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="url(#trendGradient)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'hsl(25 70% 48%)', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: 'hsl(25 70% 48%)', strokeWidth: 2, stroke: '#fff' }}
                  />
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(25 70% 58%)" />
                      <stop offset="100%" stopColor="hsl(25 70% 48%)" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Major Stats */}
        <Card className="rounded-xl border-[hsl(30_12%_92%)] card-lift overflow-hidden bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2.5" style={{fontFamily: 'var(--font-body)'}}>
              <span className="w-1 h-5 bg-[hsl(var(--accent))] rounded-full" />
              各专业实习达成率
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gradient-to-b from-[hsl(var(--accent)/0.02)] to-transparent pt-2">
            {majorData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">暂无数据</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={majorData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="major" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(40 80% 60%)" />
                      <stop offset="100%" stopColor="hsl(40 80% 55%)" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="rate" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Enterprises */}
        <Card className="rounded-xl border-[hsl(30_12%_92%)] card-lift bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2.5" style={{fontFamily: 'var(--font-body)'}}>
              <span className="w-1 h-5 bg-[hsl(var(--primary))] rounded-full" />
              Top 5 合作企业
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {topEnterprises.map((e: Record<string, unknown>, i: number) => (
                <div
                  key={i}
                  className={`flex justify-between items-center p-2.5 rounded-xl transition-colors ${
                    i % 2 === 0 ? 'bg-slate-50/80' : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                        i < 3
                          ? rankBadgeStyles[i]
                          : 'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                      }`}
                    >
                      {(e.rank as number) || i + 1}
                    </span>
                    <span className="text-sm font-medium">{e.name as string}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{e.jobCount as number}岗位 · {e.applicantCount as number}人投递</span>
                </div>
              ))}
              {topEnterprises.length === 0 && <p className="text-sm text-muted-foreground text-center">暂无数据</p>}
            </div>
          </CardContent>
        </Card>

        {/* Hot Jobs */}
        <Card className="rounded-xl border-[hsl(30_12%_92%)] card-lift bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2.5" style={{fontFamily: 'var(--font-body)'}}>
              <span className="w-1 h-5 bg-[hsl(var(--accent))] rounded-full" />
              Top 5 热门岗位
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {hotJobs.map((j: Record<string, unknown>, i: number) => (
                <div
                  key={i}
                  className={`flex justify-between items-center p-2.5 rounded-xl transition-colors ${
                    i % 2 === 0 ? 'bg-slate-50/80' : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                        i < 3
                          ? rankBadgeStyles[i]
                          : 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]'
                      }`}
                    >
                      {(j.rank as number) || i + 1}
                    </span>
                    <div>
                      <span className="text-sm font-medium">{j.title as string}</span>
                      <span className="text-xs text-muted-foreground ml-2">{j.company as string}</span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{j.applicants as number}人</span>
                </div>
              ))}
              {hotJobs.length === 0 && <p className="text-sm text-muted-foreground text-center">暂无数据</p>}
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Ratings */}
        <Card className="rounded-2xl border-border/60 card-lift">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2.5">
              <span className="w-1 h-5 bg-yellow-400 rounded-full" />
              <Star className="h-5 w-5 text-yellow-500" />
              企业评价排行
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {enterpriseRatings.map((e: Record<string, unknown>, i: number) => (
                <div
                  key={i}
                  className={`flex justify-between items-center p-2.5 rounded-xl transition-colors ${
                    i % 2 === 0 ? 'bg-yellow-50/40' : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                        i < 3
                          ? rankBadgeStyles[i]
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{e.name as string}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{(e.avgRating as number)?.toFixed(1) || '-'}</span>
                    <span className="text-xs text-muted-foreground ml-1">({e.reviewCount as number || 0}条)</span>
                  </div>
                </div>
              ))}
              {enterpriseRatings.length === 0 && <p className="text-sm text-muted-foreground text-center">暂无数据</p>}
            </div>
          </CardContent>
        </Card>

        {/* Stale Jobs */}
        <Card className="rounded-2xl border-border/60 card-lift">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2.5">
              <span className="w-1 h-5 bg-[hsl(var(--accent))] rounded-full" />
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--accent))]" />
              过期岗位提醒
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {staleJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">暂无过期岗位</p>
              ) : (
                staleJobs.map((j: Record<string, unknown>, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2.5 bg-gradient-to-r from-[hsl(var(--accent)/0.06)] to-transparent rounded-xl border border-[hsl(var(--accent)/0.1)]">
                    <div>
                      <span className="text-sm font-medium">{j.title as string}</span>
                      <span className="text-xs text-muted-foreground ml-2">{j.companyName as string}</span>
                    </div>
                    <span className="text-xs text-[hsl(var(--accent))] font-medium">{j.daysSinceCreated as number || 0}天无人投递</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Internship Stats */}
        {internshipStats && (
          <Card className="rounded-2xl border-border/60 card-lift overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2.5">
                <span className="w-1 h-5 bg-cyan-500 rounded-full" />
                <BookOpen className="h-5 w-5 text-cyan-600" />
                实习统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl text-center border border-cyan-100">
                  <p className="text-2xl font-bold text-cyan-600">{(internshipStats.totalInternships as number) || 0}</p>
                  <p className="text-xs text-muted-foreground">总实习人次</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl text-center border border-indigo-100">
                  <p className="text-2xl font-bold text-[hsl(var(--primary))]">{(internshipStats.activeInternships as number) || 0}</p>
                  <p className="text-xs text-muted-foreground">进行中</p>
                </div>
              </div>
              {/* Major Distribution */}
              {(internshipStats.majorDistribution as Array<Record<string, unknown>>)?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">专业分布</h4>
                  {(internshipStats.majorDistribution as Array<Record<string, unknown>>).map((m, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center text-sm p-2 rounded-lg ${
                        i % 2 === 0 ? 'bg-cyan-50/30' : 'bg-transparent'
                      }`}
                    >
                      <span>{m.major as string}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{m.count as number}人</span>
                        {m.avgRating && <span className="text-yellow-600">⭐{(m.avgRating as number).toFixed(1)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
