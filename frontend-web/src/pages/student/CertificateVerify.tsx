import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { typedGet } from '@/lib/api';
import { getAPIBaseURL } from '@/lib/config';
import { formatTime } from '@/lib/utils';
import type { Internship } from '@/lib/types';
import { toast } from 'sonner';
import {
  Award, BadgeCheck, CalendarDays, Download, FileBadge,
  GraduationCap, Inbox, Loader2, ShieldCheck, BookOpen,
} from 'lucide-react';

export default function CertificateVerify() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const data = await typedGet<Internship[]>('/internship/my');
        setInternships((data || []).filter(i => i.status === 1));
      } catch (err: any) {
        toast.error(err.message || '加载实习记录失败');
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, []);

  const downloadPdf = async (internshipId: number) => {
    try {
      const baseURL = getAPIBaseURL().replace('/api', '');
      const token = localStorage.getItem('token');
      const url = `${baseURL}/api/internship/certificate/${internshipId}/pdf`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('下载失败');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `实习证明_${internshipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('证明下载成功');
    } catch (err: any) {
      toast.error(err.message || '下载失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* ---- Hero header ---- */}
      <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,.3),transparent_32%),linear-gradient(135deg,#0f172a,#134e4a_55%,#14b8a6)] p-6 md:p-8 text-white shadow-2xl shadow-teal-900/20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/15 border-white/20 text-white rounded-full px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Certificates
            </Badge>
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>实习证明</h1>
              <p className="mt-2 max-w-2xl text-sm text-teal-50/80" style={{fontFamily: 'var(--font-body)'}}>
                查看和下载已完成实习的官方证明。
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{internships.length}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>份证明</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Loading ---- */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-teal-500" />
          <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载实习证明...</p>
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!loading && internships.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center">
            <Inbox className="h-10 w-10 text-teal-300" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
              暂无实习证明
            </p>
            <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
              完成实习后将自动生成证明，可在「我的实习」页面查看详情
            </p>
          </div>
        </div>
      )}

      {/* ---- Certificate list ---- */}
      {!loading && internships.length > 0 && (
        <div className="grid gap-4">
          {internships.map((item, index) => (
            <Card
              key={item.id}
              className="group relative rounded-xl border-[hsl(30_12%_92%)] card-lift overflow-hidden bg-white hover:border-teal-200 transition-all duration-300"
              style={{animationDelay: `${index * 60}ms`}}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

              <CardContent className="p-6 pl-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 flex items-center justify-center shrink-0 border border-teal-500/15">
                        <GraduationCap className="h-5 w-5 text-teal-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-medium group-hover:text-teal-600 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                            {item.position || '实习岗位'}
                          </h3>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-2.5 py-0.5 rounded-lg border">
                            <BadgeCheck className="h-3 w-3 mr-1" />
                            已完成
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                            <BookOpen className="h-3.5 w-3.5" />
                            {item.companyName || '-'}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                            <CalendarDays className="h-3.5 w-3.5" />
                            {item.startDate || '-'} ~ {item.endDate || '至今'}
                          </span>
                          {item.rating != null && item.rating > 0 && (
                            <span className="flex items-center gap-1.5 text-xs text-amber-600" style={{fontFamily: 'var(--font-body)'}}>
                              {'⭐'.repeat(item.rating)}
                              {item.review && ` · ${item.review}`}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2" style={{fontFamily: 'var(--font-body)'}}>
                          证明编号：CERT-{item.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-16 sm:ml-0 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPdf(item.id)}
                      className="gap-1.5 rounded-xl"
                    >
                      <Download className="h-3.5 w-3.5" />
                      下载 PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
