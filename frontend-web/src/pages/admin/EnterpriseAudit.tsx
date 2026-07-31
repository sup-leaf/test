import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CheckCircle, XCircle, Search, Eye, Building2, Phone, Mail,
  Shield, Filter, Inbox, Calendar, MapPin, Globe, Users,
  Sparkles, FileText, Award, Clock,
} from 'lucide-react';
import { typedGet, typedPut } from '@/lib/api';
import { ENTERPRISE_STATUS_MAP, DEFAULT_AUDIT_STATUS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { formatTime } from '@/lib/utils';
import type { User, PaginatedData } from '@/lib/types';
import { toast } from 'sonner';

interface Enterprise {
  id: number;
  username: string;
  companyName: string;
  companyCode: string;
  phone: string;
  email: string;
  status: number;
  createTime: string;
  address: string;
  legalPerson: string;
  industry: string;
  scale: string;
  description: string;
}

// 使用共享常量替代本地定义
const statusMap = ENTERPRISE_STATUS_MAP;
const defaultStatus = DEFAULT_AUDIT_STATUS;

const statusFilters = [
  { label: '全部', value: 'all', icon: Sparkles },
  { label: '待审核', value: '0', icon: Clock },
  { label: '已通过', value: '1', icon: CheckCircle },
  { label: '已拒绝', value: '2', icon: XCircle },
];

export default function EnterpriseAudit() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);
  const [confirmAudit, setConfirmAudit] = useState<{ id: number; status: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, size: 10 };
      if (statusFilter !== 'all') params.status = parseInt(statusFilter);
      if (keyword) params.keyword = keyword;
      const data = await typedGet<PaginatedData<User>>('/admin/enterprise/list', { params });
      setEnterprises(data.records || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, [page, statusFilter]);

  const handleAudit = async (id: number, status: number) => {
    try {
      await typedPut(`/admin/enterprise/audit/${id}?status=${status}`);
      toast.success(status === 1 ? '审核通过' : '已拒绝');
      setConfirmAudit(null);
      fetchList();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleViewDetail = (enterprise: Enterprise) => {
    setSelectedEnterprise(enterprise);
    setDetailOpen(true);
  };

  // Calculate stats
  const stats = {
    total: enterprises.length,
    pending: enterprises.filter(e => e.status === 0).length,
    approved: enterprises.filter(e => e.status === 1).length,
    rejected: enterprises.filter(e => e.status === 2).length,
  };

  return (
    <div className="space-y-6">
      {/* ---- Hero header ---- */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(20_12%_18%)] via-[hsl(25_10%_22%)] to-[hsl(30_8%_16%)] p-6 md:p-8 text-white transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="absolute inset-0 noise" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-[60px]" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center border border-emerald-400/30">
                <Shield className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-2xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                  企业审核
                </h2>
                <p className="text-white/40 text-sm" style={{fontFamily: 'var(--font-body)'}}>
                  审核企业注册申请
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{total}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>总企业</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-amber-400" style={{fontFamily: 'var(--font-display)'}}>{stats.pending}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>待审核</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-emerald-400" style={{fontFamily: 'var(--font-display)'}}>{stats.approved}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>已通过</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-red-400" style={{fontFamily: 'var(--font-display)'}}>{stats.rejected}</p>
              <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>已拒绝</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-6 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="搜索企业..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchList())}
              className="pl-10 h-11 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/20 rounded-xl"
            />
          </div>
          <Button
            onClick={() => { setPage(1); fetchList(); }}
            className="h-11 px-6 bg-emerald-500/20 hover:bg-emerald-500/30 text-white border border-emerald-400/30 rounded-xl backdrop-blur-sm transition-all"
          >
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
        </div>
      </div>

      {/* ---- Status Filters ---- */}
      <div className={`flex items-center gap-3 flex-wrap transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center gap-2 mr-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>状态：</span>
        </div>
        {statusFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => { setStatusFilter(filter.value); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                statusFilter === filter.value
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white text-muted-foreground hover:text-foreground border border-[hsl(30_12%_92%)] hover:border-emerald-200'
              }`}
              style={{fontFamily: 'var(--font-body)'}}
            >
              <Icon className="h-4 w-4" />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* ---- Loading ---- */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-emerald-500" />
          <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载企业列表...</p>
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!loading && enterprises.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Inbox className="h-10 w-10 text-emerald-300" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
              暂无企业
            </p>
            <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
              {statusFilter === 'all' ? '等待企业注册...' : '试试切换其他状态筛选'}
            </p>
          </div>
          {statusFilter !== 'all' && (
            <Button
              variant="outline"
              onClick={() => setStatusFilter('all')}
              className="rounded-xl"
            >
              清除筛选
            </Button>
          )}
        </div>
      )}

      {/* ---- Enterprise list ---- */}
      {!loading && enterprises.length > 0 && (
        <div className="grid gap-4">
          {enterprises.map((e, index) => {
            const st = statusMap[e.status] || defaultStatus;
            return (
              <Card
                key={e.id}
                className={`group relative rounded-xl border-[hsl(30_12%_92%)] card-lift overflow-hidden bg-white hover:border-emerald-200 transition-all duration-300 ${
                  mounted ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{animationDelay: `${index * 60}ms`}}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

                <CardContent className="p-6 pl-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center shrink-0 border border-emerald-500/15">
                          <Building2 className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-medium group-hover:text-emerald-600 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                              {e.companyName || e.username}
                            </h3>
                            <Badge className={`${st.color} text-xs px-2.5 py-0.5 rounded-lg border`}>
                              {st.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <FileText className="h-3.5 w-3.5" />
                              {e.companyCode || '暂无信用代码'}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                              <Calendar className="h-3.5 w-3.5" />
                              {formatTime(e.createTime)}
                            </span>
                            {e.phone && (
                              <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                <Phone className="h-3.5 w-3.5" />
                                {e.phone}
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
                        onClick={() => handleViewDetail(e)}
                        className="gap-1.5 rounded-xl"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        详情
                      </Button>
                      {e.status === 0 && (
                        <>
                          <Dialog open={confirmAudit?.id === e.id && confirmAudit?.status === 1} onOpenChange={(open) => { if (!open) setConfirmAudit(null); }}>
                            <Button
                              size="sm"
                              onClick={() => setConfirmAudit({ id: e.id, status: 1 })}
                              className="gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              通过
                            </Button>
                            <DialogContent className="rounded-2xl">
                              <DialogHeader className="dialog-header-gradient pb-4">
                                <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>确认审核通过</DialogTitle>
                              </DialogHeader>
                              <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                确定通过企业「{e.companyName || e.username}」的注册申请吗？
                              </p>
                              <div className="flex gap-2 justify-end mt-4">
                                <Button variant="outline" onClick={() => setConfirmAudit(null)} className="rounded-xl">
                                  取消
                                </Button>
                                <Button
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                                  onClick={() => handleAudit(e.id, 1)}
                                >
                                  确认通过
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Dialog open={confirmAudit?.id === e.id && confirmAudit?.status === 2} onOpenChange={(open) => { if (!open) setConfirmAudit(null); }}>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setConfirmAudit({ id: e.id, status: 2 })}
                              className="gap-1.5 rounded-xl"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              拒绝
                            </Button>
                            <DialogContent className="rounded-2xl">
                              <DialogHeader className="dialog-header-gradient pb-4">
                                <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>确认拒绝</DialogTitle>
                              </DialogHeader>
                              <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                确定拒绝企业「{e.companyName || e.username}」的注册申请吗？
                              </p>
                              <div className="flex gap-2 justify-end mt-4">
                                <Button variant="outline" onClick={() => setConfirmAudit(null)} className="rounded-xl">
                                  取消
                                </Button>
                                <Button variant="destructive" onClick={() => handleAudit(e.id, 2)} className="rounded-xl">
                                  确认拒绝
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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

      {/* Enterprise Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>企业详情</DialogTitle>
          </DialogHeader>
          {selectedEnterprise && (() => {
            const st = statusMap[selectedEnterprise.status] || defaultStatus;
            return (
              <div className="space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-[hsl(30_12%_92%)]">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center border border-emerald-500/15">
                    <Building2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{fontFamily: 'var(--font-display)'}}>
                      {selectedEnterprise.companyName || selectedEnterprise.username}
                    </h3>
                    <Badge className={`${st.color} mt-1 border`}>{st.label}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>企业信息</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>信用代码</span>
                      </div>
                      <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedEnterprise.companyCode || '-'}</p>
                    </div>
                    {selectedEnterprise.industry && (
                      <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>行业</span>
                        </div>
                        <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedEnterprise.industry}</p>
                      </div>
                    )}
                    {selectedEnterprise.scale && (
                      <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>规模</span>
                        </div>
                        <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedEnterprise.scale}</p>
                      </div>
                    )}
                    {selectedEnterprise.legalPerson && (
                      <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>法人</span>
                        </div>
                        <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedEnterprise.legalPerson}</p>
                      </div>
                    )}
                  </div>
                  {selectedEnterprise.address && (
                    <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>地址</span>
                      </div>
                      <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedEnterprise.address}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>联系方式</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedEnterprise.phone && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs text-emerald-600" style={{fontFamily: 'var(--font-body)'}}>电话</span>
                        </div>
                        <p className="text-sm font-medium text-emerald-800" style={{fontFamily: 'var(--font-body)'}}>{selectedEnterprise.phone}</p>
                      </div>
                    )}
                    {selectedEnterprise.email && (
                      <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4 text-teal-500" />
                          <span className="text-xs text-teal-600" style={{fontFamily: 'var(--font-body)'}}>邮箱</span>
                        </div>
                        <p className="text-sm font-medium text-teal-800" style={{fontFamily: 'var(--font-body)'}}>{selectedEnterprise.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedEnterprise.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>企业简介</h4>
                    <p className="text-sm p-4 bg-[hsl(30_12%_96%)] rounded-xl whitespace-pre-wrap" style={{fontFamily: 'var(--font-body)'}}>
                      {selectedEnterprise.description}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-[hsl(30_12%_92%)]">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                    <Calendar className="h-3.5 w-3.5" />
                    注册时间：{formatTime(selectedEnterprise.createTime)}
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
