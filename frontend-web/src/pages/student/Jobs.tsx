import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Briefcase,
  MapPin,
  Clock,
  Eye,
  Send,
  Search,
  Inbox,
  TrendingUp,
  Building2,
  Sparkles,
  ArrowRight,
  Filter,
  Star,
  Zap,
} from 'lucide-react';
import { typedGet } from '@/lib/api';
import { JOB_TYPE_MAP, JOB_TYPE_COLORS, DEFAULT_JOB_TYPE_COLOR, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { formatSalary } from '@/lib/utils';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { SimplePagination } from '@/components/ui/simple-pagination';
import type { Job, PaginatedData } from '@/lib/types';

const quickFilters = [
  { label: '全部', value: 'all', icon: Sparkles },
  { label: '实习', value: '1', icon: Star },
  { label: '全职', value: '2', icon: Briefcase },
  { label: '科研助理', value: '3', icon: Zap },
];

export default function Jobs() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [jobType, setJobType] = useState('all');
  const filters = useMemo(() => {
    const f: Record<string, unknown> = {};
    if (searchKeyword) f.keyword = searchKeyword;
    if (jobType !== 'all') f.jobType = parseInt(jobType);
    return f;
  }, [searchKeyword, jobType]);

  const { items: jobs, total, page, loading, setPage } = usePaginatedList<Job>({
    fetchFn: (params) => typedGet<PaginatedData<Job>>('/job/list', { params }),
    filters,
  });

  const handleSearch = () => {
    setSearchKeyword(keyword);
  };

  return (
    <div className="space-y-6 page-enter">
      {/* ---- Hero header with integrated search ---- */}
      <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,.3),transparent_32%),linear-gradient(135deg,#0f172a,#1e3a5f_55%,#3b82f6)] p-6 md:p-8 text-white shadow-2xl shadow-blue-900/20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/15 border-white/20 text-white rounded-full px-3 py-1">
              <Briefcase className="h-3.5 w-3.5 mr-1" /> Job Marketplace
            </Badge>
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>岗位广场</h1>
              <p className="mt-2 max-w-2xl text-sm text-blue-50/80" style={{fontFamily: 'var(--font-body)'}}>
                发现适合你的校园机会，找到理想的工作和实习岗位。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{loading ? '...' : total}</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>在招岗位</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar inside hero */}
        <div className="relative mt-6 flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="搜索岗位名称、公司、技能..."
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

      {/* ---- Quick Filters ---- */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 mr-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>筛选：</span>
        </div>
        {quickFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => setJobType(filter.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                jobType === filter.value
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
        <div className="flex-1" />
        {!loading && jobs.length > 0 && (
          <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
            共 <span className="font-medium text-foreground">{total}</span> 个岗位
          </p>
        )}
      </div>

      {/* ---- Loading spinner ---- */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-[hsl(var(--primary))]" />
          <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>正在加载岗位...</p>
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!loading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--primary)/0.06)] flex items-center justify-center">
            <Inbox className="h-10 w-10 text-[hsl(var(--primary)/0.3)]" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
              暂无匹配的岗位
            </p>
            <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
              试试调整搜索关键词或筛选条件，或者浏览其他类型的岗位
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setKeyword('');
              setSearchKeyword('');
              setJobType('all');
            }}
            className="rounded-xl"
          >
            清除筛选条件
          </Button>
        </div>
      )}

      {/* ---- Job list ---- */}
      {!loading && jobs.length > 0 && (
        <div className="grid gap-4">
          {jobs.map((job, index) => (
            <Card
              key={job.id}
              className="group relative rounded-xl border-[hsl(30_12%_92%)] card-lift cursor-pointer overflow-hidden bg-white hover:border-[hsl(var(--primary)/0.2)] transition-all duration-300"
              style={{animationDelay: `${300 + index * 60}ms`}}
              onClick={() => navigate(`/app/jobs/${job.id}`)}
            >
              {/* Accent stripe - visible on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

              <CardContent className="p-6 pl-7">
                <div className="flex gap-5">
                  {/* Company / job avatar */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.08)] to-[hsl(var(--accent)/0.06)] flex items-center justify-center shrink-0 border border-[hsl(var(--primary)/0.1)] group-hover:scale-105 transition-transform duration-300">
                    <Briefcase className="h-6 w-6 text-[hsl(var(--primary)/0.5)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-medium group-hover:text-[hsl(var(--primary))] transition-colors duration-200" style={{fontFamily: 'var(--font-body)'}}>
                          {job.title}
                        </h3>

                        {/* Company & Location */}
                        <div className="flex items-center gap-3 mt-1.5">
                          {job.companyName && (
                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <Building2 className="h-3.5 w-3.5" />
                              {job.companyName}
                            </span>
                          )}
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <Badge className={`${JOB_TYPE_COLORS[job.jobType] || DEFAULT_JOB_TYPE_COLOR} text-xs px-2.5 py-0.5 rounded-lg`}>
                            {JOB_TYPE_MAP[job.jobType] || '未知'}
                          </Badge>
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

                        {/* Tags */}
                        {job.skillTags && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.skillTags.split(',').slice(0, 5).map((tag, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg text-xs bg-[hsl(30_12%_96%)] text-muted-foreground border border-[hsl(30_12%_92%)] group-hover:border-[hsl(var(--primary)/0.15)] transition-colors"
                                style={{fontFamily: 'var(--font-body)'}}
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Salary pill */}
                      {(job.salaryMin || job.salaryMax) && (
                        <div className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.08)] to-[hsl(var(--accent)/0.04)] border border-[hsl(var(--accent)/0.12)]">
                          <span className="text-base font-medium text-[hsl(var(--accent))]" style={{fontFamily: 'var(--font-body)'}}>
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8">
        <SimplePagination
          page={page}
          total={total}
          pageSize={DEFAULT_PAGE_SIZE}
          loading={loading}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
