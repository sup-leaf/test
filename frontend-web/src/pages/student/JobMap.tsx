import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Briefcase, ArrowRight, Search, X } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface CityJob {
  id: number;
  title: string;
  jobType: number;
}

interface MapDataItem {
  city: string;
  lat: number | null;
  lng: number | null;
  count: number;
  jobs: CityJob[];
}

const jobTypeMap: Record<number, string> = { 1: '实习', 2: '全职', 3: '科研助理' };

// 中国经纬度范围用于坐标映射
const CHINA_LAT_MIN = 18;
const CHINA_LAT_MAX = 54;
const CHINA_LNG_MIN = 73;
const CHINA_LNG_MAX = 135;

function projectCoord(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - CHINA_LNG_MIN) / (CHINA_LNG_MAX - CHINA_LNG_MIN)) * 100;
  const y = 100 - ((lat - CHINA_LAT_MIN) / (CHINA_LAT_MAX - CHINA_LAT_MIN)) * 100;
  return { x: Math.max(3, Math.min(97, x)), y: Math.max(3, Math.min(97, y)) };
}

function getBubbleSize(count: number): string {
  if (count >= 20) return 'w-16 h-16 text-sm';
  if (count >= 10) return 'w-14 h-14 text-xs';
  if (count >= 5) return 'w-12 h-12 text-xs';
  return 'w-10 h-10 text-xs';
}

function getBubbleBg(count: number): string {
  if (count >= 20) return 'bg-primary/90 shadow-lg shadow-primary/30';
  if (count >= 10) return 'bg-primary/80 shadow-md shadow-primary/20';
  if (count >= 5) return 'bg-primary/70 shadow-sm shadow-primary/15';
  return 'bg-primary/60 shadow-sm shadow-primary/10';
}

export default function JobMap() {
  const navigate = useNavigate();
  const [data, setData] = useState<MapDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/job/map');
        const list = (res as any).data || [];
        setData(list);
      } catch (err: any) {
        toast.error('加载地图数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nodes = useMemo(() => {
    return data
      .filter((item) => item.lat != null && item.lng != null)
      .map((item) => {
        const pos = projectCoord(item.lat!, item.lng!);
        return { ...item, ...pos };
      });
  }, [data]);

  const selectedData = useMemo(() => {
    return data.find((item) => item.city === selectedCity) || null;
  }, [data, selectedCity]);

  // 统计
  const totalCities = data.length;
  const totalJobs = data.reduce((sum, item) => sum + item.count, 0);
  const topCity = data.length > 0 ? data.reduce((a, b) => (a.count > b.count ? a : b)) : null;

  const allJobsInSelectedCity = useMemo(() => {
    return selectedData ? selectedData.jobs : [];
  }, [selectedData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-[500px] rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      {/* ---- Hero header ---- */}
      <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,.3),transparent_32%),linear-gradient(135deg,#0f172a,#1e3a5f_55%,#3b82f6)] p-6 md:p-8 text-white shadow-2xl shadow-blue-900/20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/15 border-white/20 text-white rounded-full px-3 py-1">
              <MapPin className="h-3.5 w-3.5 mr-1" /> Job Map
            </Badge>
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>岗位地图</h1>
              <p className="mt-2 max-w-2xl text-sm text-blue-50/80" style={{fontFamily: 'var(--font-body)'}}>
                全国各城市岗位分布一览，点击城市气泡查看详情。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{totalCities}</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>城市</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{totalJobs}</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>岗位</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/app/jobs')} className="rounded-xl bg-white/15 text-white border border-white/20 hover:bg-white/25 gap-2">
              <Search className="h-4 w-4" />
              返回岗位列表
            </Button>
          </div>
        </div>
      </section>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-100 rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <MapPin className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalCities}</p>
              <p className="text-sm text-slate-500">有岗位的城市</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Briefcase className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalJobs}</p>
              <p className="text-sm text-slate-500">在招岗位总数</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <MapPin className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{topCity?.city || '-'}</p>
              <p className="text-sm text-slate-500">岗位最多城市 ({topCity?.count || 0}个)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 地图区域 */}
      <Card className="border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 h-[520px] overflow-hidden">
            {/* 背景装饰网格 */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-900"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* 简化的城市节点点缀 */}
            <div className="absolute inset-0 opacity-[0.04]">
              {['北京','上海','广州','深圳','杭州','成都','武汉','南京','西安','重庆','天津','苏州','长沙','合肥','郑州','济南','厦门','大连','青岛','福州'].map((city, i) => (
                <div
                  key={city}
                  className="absolute text-4xl font-black text-slate-900 select-none pointer-events-none"
                  style={{
                    left: `${10 + (i % 5) * 20}%`,
                    top: `${8 + Math.floor(i / 5) * 22}%`,
                  }}
                >
                  {city}
                </div>
              ))}
            </div>

            {/* 城市气泡标记点 */}
            {nodes.map((item) => {
              const isHovered = hoveredCity === item.city;
              const isSelected = selectedCity === item.city;
              const size = getBubbleSize(item.count);
              const bg = getBubbleBg(item.count);

              return (
                <div
                  key={item.city}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-all duration-200 ${
                    isSelected ? 'scale-110 z-20' : isHovered ? 'scale-105 z-20' : ''
                  }`}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  onMouseEnter={() => setHoveredCity(item.city)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onClick={() => setSelectedCity(isSelected ? null : item.city)}
                >
                  {/* 涟漪 */}
                  {(isHovered || isSelected) && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" style={{ width: '150%', height: '150%', left: '-25%', top: '-25%' }} />
                  )}
                  {/* 气泡 */}
                  <div className={`${size} ${bg} rounded-full flex items-center justify-center text-white font-bold hover:brightness-110 transition-all relative`}>
                    {item.count}
                  </div>
                  {/* 城市名 */}
                  <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-200 ${
                    isHovered || isSelected ? 'opacity-100 text-primary font-semibold' : 'opacity-70'
                  }`}>
                    <span className="text-xs bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
                      {item.city}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* 图例 */}
            <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm border border-slate-100">
              <span className="text-xs text-slate-500 mr-1">岗位数:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary/60" />
                <span className="text-xs text-slate-500">&lt;5</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-primary/70" />
                <span className="text-xs text-slate-500">5-9</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary/80" />
                <span className="text-xs text-slate-500">10-19</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-primary/90" />
                <span className="text-xs text-slate-500">20+</span>
              </div>
            </div>

            {/* 提示 */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm border border-slate-100">
              <p className="text-xs text-slate-500">点击城市气泡查看岗位详情</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 选中城市的岗位列表 */}
      {selectedCity && selectedData && (
        <Card className="border border-primary/20 rounded-2xl shadow-md bg-gradient-to-br from-white to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedCity}</h3>
                  <p className="text-sm text-slate-500">共 {selectedData.count} 个在招岗位</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/app/jobs?keyword=${encodeURIComponent(selectedCity)}`)}
                  className="gap-2"
                >
                  查看全部 <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCity(null)}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {allJobsInSelectedCity.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allJobsInSelectedCity.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
                    onClick={() => navigate(`/app/jobs/${job.id}`)}
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">
                        {job.title}
                      </p>
                      <Badge variant="secondary" className="mt-1.5 bg-slate-100 text-slate-600 border-none rounded-md px-2 py-0 text-xs font-medium">
                        {jobTypeMap[job.jobType] || '未知类型'}
                      </Badge>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">暂无该城市的具体岗位信息，请点击"查看全部"搜索</p>
            )}

            {selectedData.count > 5 && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/app/jobs?keyword=${encodeURIComponent(selectedCity)}`)}
                  className="text-primary hover:text-primary/80"
                >
                  查看更多 {selectedData.count - 5} 个岗位 <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 城市岗位统计表（下方列表） */}
      <Card className="border border-slate-100 rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">城市岗位统计</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3 font-semibold text-slate-500 w-12">#</th>
                  <th className="pb-3 font-semibold text-slate-500">城市</th>
                  <th className="pb-3 font-semibold text-slate-500 text-right">岗位数量</th>
                  <th className="pb-3 font-semibold text-slate-500 pl-6">热门岗位</th>
                </tr>
              </thead>
              <tbody>
                {[...data]
                  .sort((a, b) => b.count - a.count)
                  .map((item, index) => (
                    <tr
                      key={item.city}
                      className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        selectedCity === item.city ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedCity(selectedCity === item.city ? null : item.city)}
                    >
                      <td className="py-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                          index < 3 ? 'bg-primary/10 text-primary' : 'text-slate-400'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{item.city}</span>
                          {item.lat == null && (
                            <span className="text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">坐标缺失</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">{item.count}</span>
                          <span className="text-xs text-slate-400">个岗位</span>
                        </span>
                      </td>
                      <td className="py-3 pl-6">
                        <div className="flex flex-wrap gap-1">
                          {item.jobs.slice(0, 3).map((job) => (
                            <Badge
                              key={job.id}
                              variant="secondary"
                              className="bg-slate-100 text-slate-600 border-none rounded-md px-2 py-0 text-xs font-normal max-w-[160px] truncate"
                              title={job.title}
                            >
                              {job.title}
                            </Badge>
                          ))}
                          {item.jobs.length === 0 && (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
