import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Eye, Send, ArrowLeft, Briefcase } from 'lucide-react';
import { typedGet, typedPost } from '@/lib/api';
import { JOB_TYPE_MAP, JOB_TYPE_COLORS, DEFAULT_JOB_TYPE_COLOR } from '@/lib/constants';
import { formatSalary } from '@/lib/utils';
import type { Job } from '@/lib/types';
import { toast } from 'sonner';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const data = await typedGet<Job>(`/job/detail/${id}`);
        setJob(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await typedPost(`/delivery/apply?jobId=${id}`);
      toast.success('投递成功');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '投递失败');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-[hsl(var(--primary))]" />
        <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载中...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>{error || '岗位不存在'}</p>
        <Button variant="outline" onClick={() => navigate('/app/jobs')} className="gap-1">
          <ArrowLeft className="h-4 w-4" />返回列表
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-enter">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/jobs')} className="gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        <span style={{fontFamily: 'var(--font-body)'}}>返回</span>
      </Button>

      <Card className="rounded-xl border-[hsl(30_12%_92%)] bg-white overflow-hidden">
        {/* Hero section */}
        <div className="relative bg-gradient-to-br from-[hsl(20_12%_18%)] via-[hsl(25_10%_22%)] to-[hsl(30_8%_16%)] p-6 md:p-8 text-white">
          <div className="absolute inset-0 noise" />
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[hsl(var(--primary)/0.08)] rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white/70" />
                  </div>
                  <div>
                    <h1 className="text-2xl leading-tight" style={{fontFamily: 'var(--font-display)'}}>{job.title}</h1>
                    <Badge className={`${JOB_TYPE_COLORS[job.jobType] || DEFAULT_JOB_TYPE_COLOR} mt-1`}>
                      {JOB_TYPE_MAP[job.jobType] || '未知'}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-white/40" style={{fontFamily: 'var(--font-body)'}}>
                  {job.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                  )}
                  {job.duration && (
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.duration}个月</span>
                  )}
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{job.viewCount}次浏览</span>
                  <span className="flex items-center gap-1"><Send className="h-3.5 w-3.5" />{job.deliveryCount}人投递</span>
                </div>
              </div>
              {(job.salaryMin || job.salaryMax) && (
                <div className="shrink-0 px-4 py-2 rounded-lg bg-white/8 border border-white/10">
                  <p className="text-xl font-medium text-[hsl(var(--accent-light))]" style={{fontFamily: 'var(--font-display)'}}>
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Skill tags */}
          {job.skillTags && (
            <div className="flex flex-wrap gap-2">
              {job.skillTags.split(',').map((tag, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-[hsl(30_12%_96%)] text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-3 text-foreground" style={{fontFamily: 'var(--font-display)'}}>职位描述</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed" style={{fontFamily: 'var(--font-body)'}}>{job.description || '暂无描述'}</p>
            </div>
            <div className="divider-gradient" />
            <div>
              <h3 className="text-base font-medium mb-3 text-foreground" style={{fontFamily: 'var(--font-display)'}}>任职要求</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed" style={{fontFamily: 'var(--font-body)'}}>{job.requirement || '暂无要求'}</p>
            </div>
          </div>

          {/* Apply button */}
          <div className="pt-4 border-t border-[hsl(30_12%_92%)]">
            <Button
              onClick={handleApply}
              disabled={applying}
              className="w-full sm:w-auto h-11 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white font-medium shadow-md shadow-[hsl(var(--primary)/0.2)] btn-shine"
              style={{fontFamily: 'var(--font-body)'}}
            >
              {applying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  投递中...
                </div>
              ) : '立即投递'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
