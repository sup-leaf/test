import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RefreshCw, Clock, CheckCircle, XCircle, Zap } from 'lucide-react';
import api from '@/lib/api';
import { formatTime } from '@/lib/utils';
import { toast } from 'sonner';

interface CrawlRecord {
  id: number;
  source: string;
  status: number;
  jobsFound: number;
  jobsAdded: number;
  errorMessage: string;
  startTime: string;
  endTime: string;
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '运行中', color: 'bg-blue-100 text-blue-800' },
  1: { label: '已完成', color: 'bg-green-100 text-green-800' },
  2: { label: '失败', color: 'bg-red-100 text-red-800' },
};

export default function CrawlerManage() {
  const [records, setRecords] = useState<CrawlRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/crawler/history', { params: { page, size: 10 } });
      const data = (res as any).data;
      setRecords(data.records || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      toast.error(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const triggerCrawl = async () => {
    try {
      setTriggering(true);
      await api.post('/crawler/run');
      toast.success('已触发爬取任务');
      setTimeout(() => fetchRecords(), 2000);
    } catch (err: any) {
      toast.error(err.message || '触发失败');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">爬虫管理</h2>
          <p className="text-slate-500 mt-1">管理自动招聘信息采集任务</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={triggerCrawl}
            disabled={triggering}
            className="rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold gap-2 transition-all hover:translate-y-[-1px]"
          >
            <Play className="h-4 w-4" />
            {triggering ? '运行中...' : '立即触发爬取'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '总执行次数', value: total, icon: Zap, color: 'text-blue-600 bg-blue-50' },
          { label: '已完成', value: records.filter(r => r.status === 1).length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: '运行中', value: records.filter(r => r.status === 0).length, icon: Play, color: 'text-yellow-600 bg-yellow-50' },
          { label: '失败', value: records.filter(r => r.status === 2).length, icon: XCircle, color: 'text-red-600 bg-red-50' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
            <RefreshCw className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">暂无爬取记录</h3>
          <p className="text-slate-500 mt-1 text-sm">点击上方按钮触发爬取任务</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map((r) => {
            const st = statusMap[r.status] || { label: '未知', color: 'bg-gray-100 text-gray-800' };
            return (
              <Card key={r.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${st.color}`}>
                      {r.status === 0 ? <RefreshCw className="h-5 w-5 animate-spin" /> : r.status === 1 ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900">{r.source}</h3>
                        <Badge className={`rounded-lg border-none ${st.color}`}>{st.label}</Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(r.startTime)}</span>
                        {r.jobsFound > 0 && <span>发现 {r.jobsFound} 条</span>}
                        {r.jobsAdded > 0 && <span>新增 {r.jobsAdded} 条</span>}
                      </div>
                      {r.errorMessage && (
                        <p className="text-xs text-red-500 mt-1 bg-red-50 rounded-lg px-3 py-1.5 mt-2 line-clamp-2">{r.errorMessage}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {total > 10 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)} className="rounded-xl">上一页</Button>
          <span className="text-sm font-medium text-slate-500">第 {page} 页 / 共 {Math.ceil(total / 10)} 页</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 10) || loading} onClick={() => setPage(p => p + 1)} className="rounded-xl">下一页</Button>
        </div>
      )}
    </div>
  );
}
