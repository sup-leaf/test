import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Search, Eye, Users, Building2, GraduationCap, Phone, Mail,
  Shield, Filter, Inbox, Calendar, UserCheck, UserX, Sparkles,
  BookOpen, Award, FileText, MapPin, Globe,
} from 'lucide-react';
import { typedGet, typedPut } from '@/lib/api';
import { USER_TYPE_MAP, USER_STATUS_MAP, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { formatTime } from '@/lib/utils';
import type { User, PaginatedData } from '@/lib/types';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';

interface UserInfo {
    id: number;
    username: string;
    userType: number;
    realName: string;
    studentId: string;
    campusCardNo: string;
    companyName: string;
    companyCode: string;
    teacherNo: string;
    phone: string;
    email: string;
    status: number;
    createTime: string;
    major: string;
    grade: string;
}

const userTypeMap: Record<number, { label: string; color: string; icon: LucideIcon; bg: string }> = {
    1: { label: USER_TYPE_MAP[1], color: 'bg-blue-100 text-blue-800 border-blue-200', icon: GraduationCap, bg: 'bg-blue-50' },
    2: { label: USER_TYPE_MAP[2], color: 'bg-violet-100 text-violet-800 border-violet-200', icon: Building2, bg: 'bg-violet-50' },
    3: { label: USER_TYPE_MAP[3], color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Users, bg: 'bg-emerald-50' },
};

const defaultUserType = { label: '未知', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Users, bg: 'bg-gray-50' };

const statusLabels = USER_STATUS_MAP;
const defaultStatus = { label: '未知', color: 'bg-gray-100 text-gray-800 border-gray-200' };

const typeFilters = [
    { label: '全部', value: 'all', icon: Sparkles },
    { label: '学生', value: '1', icon: GraduationCap },
    { label: '企业', value: '2', icon: Building2 },
    { label: '教师', value: '3', icon: Users },
];

export default function UserManage() {
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [stats, setStats] = useState({ students: 0, enterprises: 0, teachers: 0 });
    const [confirmToggle, setConfirmToggle] = useState<{ userId: number; currentStatus: number } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params: Record<string, unknown> = { page, size: 10 };
            if (typeFilter !== 'all') params.userType = parseInt(typeFilter);
            if (keyword) params.keyword = keyword;
            const data = await typedGet<PaginatedData<User>>('/admin/user/list', { params });
            setUsers(data.records || []);
            setTotal(data.total || 0);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await typedGet<Record<string, number>>('/admin/user/stats');
            if (data) {
                setStats({
                    students: data.studentCount || 0,
                    enterprises: data.enterpriseCount || 0,
                    teachers: data.teacherCount || 0,
                });
            }
        } catch {
            // silently fail
        }
    };

    useEffect(() => { fetchUsers(); fetchStats(); }, [page, typeFilter]);

    const handleViewDetail = (user: UserInfo) => {
        setSelectedUser(user);
        setDetailOpen(true);
    };

    const handleToggleStatus = async (userId: number, currentStatus: number) => {
        const newStatus = currentStatus === 1 ? 2 : 1;
        try {
            await typedPut(`/admin/user/status/${userId}?status=${newStatus}`);
            toast.success(newStatus === 2 ? '已禁用' : '已启用');
            setConfirmToggle(null);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const totalUsers = stats.students + stats.enterprises + stats.teachers;

    return (
        <div className="space-y-6">
            {/* ---- Hero header ---- */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(20_12%_18%)] via-[hsl(25_10%_22%)] to-[hsl(30_8%_16%)] p-6 md:p-8 text-white transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="absolute inset-0 noise" />
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-[80px]" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px]" />

                <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 backdrop-blur-sm flex items-center justify-center border border-indigo-400/30">
                                <Users className="h-5 w-5 text-indigo-300" />
                            </div>
                            <div>
                                <h2 className="text-2xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                                    用户管理
                                </h2>
                                <p className="text-white/40 text-sm" style={{fontFamily: 'var(--font-body)'}}>
                                    管理平台所有用户
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{totalUsers}</p>
                            <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>总用户</p>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl text-blue-400" style={{fontFamily: 'var(--font-display)'}}>{stats.students}</p>
                            <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>学生</p>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl text-violet-400" style={{fontFamily: 'var(--font-display)'}}>{stats.enterprises}</p>
                            <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>企业</p>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl text-emerald-400" style={{fontFamily: 'var(--font-display)'}}>{stats.teachers}</p>
                            <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>教师</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mt-6 flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <Input
                            placeholder="搜索用户名/姓名/手机..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchUsers())}
                            className="pl-10 h-11 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/20 rounded-xl"
                        />
                    </div>
                    <Button
                        onClick={() => { setPage(1); fetchUsers(); }}
                        className="h-11 px-6 bg-indigo-500/20 hover:bg-indigo-500/30 text-white border border-indigo-400/30 rounded-xl backdrop-blur-sm transition-all"
                    >
                        <Search className="h-4 w-4 mr-2" />
                        搜索
                    </Button>
                </div>
            </div>

            {/* ---- Type Filters ---- */}
            <div className={`flex items-center gap-3 flex-wrap transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center gap-2 mr-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>类型：</span>
                </div>
                {typeFilters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                        <button
                            key={filter.value}
                            onClick={() => { setTypeFilter(filter.value); setPage(1); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                                typeFilter === filter.value
                                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white text-muted-foreground hover:text-foreground border border-[hsl(30_12%_92%)] hover:border-indigo-200'
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
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-indigo-500" />
                    <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载用户列表...</p>
                </div>
            )}

            {/* ---- Empty state ---- */}
            {!loading && users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <Inbox className="h-10 w-10 text-indigo-300" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-lg font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
                            暂无用户数据
                        </p>
                        <p className="text-sm text-muted-foreground max-w-md" style={{fontFamily: 'var(--font-body)'}}>
                            {typeFilter === 'all' ? '等待用户注册...' : '试试切换其他类型筛选'}
                        </p>
                    </div>
                    {typeFilter !== 'all' && (
                        <Button
                            variant="outline"
                            onClick={() => setTypeFilter('all')}
                            className="rounded-xl"
                        >
                            清除筛选
                        </Button>
                    )}
                </div>
            )}

            {/* ---- User Table ---- */}
            {!loading && users.length > 0 && (
                <Card className={`rounded-xl border-[hsl(30_12%_92%)] overflow-hidden bg-white transition-all duration-500 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[hsl(30_12%_96%)] hover:bg-[hsl(30_12%_96%)]">
                                    <TableHead className="font-medium" style={{fontFamily: 'var(--font-body)'}}>用户名</TableHead>
                                    <TableHead className="font-medium" style={{fontFamily: 'var(--font-body)'}}>姓名</TableHead>
                                    <TableHead className="font-medium" style={{fontFamily: 'var(--font-body)'}}>类型</TableHead>
                                    <TableHead className="font-medium" style={{fontFamily: 'var(--font-body)'}}>联系方式</TableHead>
                                    <TableHead className="font-medium" style={{fontFamily: 'var(--font-body)'}}>状态</TableHead>
                                    <TableHead className="font-medium" style={{fontFamily: 'var(--font-body)'}}>注册时间</TableHead>
                                    <TableHead className="text-right font-medium" style={{fontFamily: 'var(--font-body)'}}>操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u, index) => {
                                    const ut = userTypeMap[u.userType] || defaultUserType;
                                    const st = statusLabels[u.status] || defaultStatus;
                                    const Icon = ut.icon;
                                    return (
                                        <TableRow
                                            key={u.id}
                                            className="hover:bg-[hsl(30_12%_98%)] transition-colors"
                                        >
                                            <TableCell className="font-medium" style={{fontFamily: 'var(--font-body)'}}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-indigo-500/15">
                                                        <span className="text-xs font-bold text-indigo-500">
                                                            {(u.realName || u.companyName || u.username || '?')[0]}
                                                        </span>
                                                    </div>
                                                    {u.username}
                                                </div>
                                            </TableCell>
                                            <TableCell style={{fontFamily: 'var(--font-body)'}}>{u.realName || u.companyName || '-'}</TableCell>
                                            <TableCell>
                                                <Badge className={`${ut.color} text-xs px-2.5 py-0.5 rounded-lg border`}>
                                                    <Icon className="h-3 w-3 mr-1" />
                                                    {ut.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm" style={{fontFamily: 'var(--font-body)'}}>
                                                <div className="flex items-center gap-1.5">
                                                    {u.phone ? (
                                                        <>
                                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {u.phone}
                                                        </>
                                                    ) : u.email ? (
                                                        <>
                                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {u.email}
                                                        </>
                                                    ) : '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${st.color} text-xs px-2.5 py-0.5 rounded-lg border`}>
                                                    {st.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                                {formatTime(u.createTime)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleViewDetail(u)}
                                                        className="h-8 w-8 p-0 rounded-lg"
                                                    >
                                                        <Eye className="h-4 w-4 text-indigo-500" />
                                                    </Button>
                                                    <Dialog open={confirmToggle?.userId === u.id} onOpenChange={(open) => { if (!open) setConfirmToggle(null); }}>
                                                        <Button
                                                            size="sm"
                                                            variant={u.status === 1 ? "ghost" : "ghost"}
                                                            onClick={() => setConfirmToggle({ userId: u.id, currentStatus: u.status })}
                                                            className={`h-8 w-8 p-0 rounded-lg ${u.status === 1 ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                        >
                                                            {u.status === 1 ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                        </Button>
                                                        <DialogContent className="rounded-2xl">
                                                            <DialogHeader className="dialog-header-gradient pb-4">
                                                                <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>
                                                                    {u.status === 1 ? '确认禁用' : '确认启用'}
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                                                确定要{u.status === 1 ? '禁用' : '启用'}用户「{u.realName || u.companyName || u.username}」吗？
                                                            </p>
                                                            <div className="flex gap-2 justify-end mt-4">
                                                                <Button variant="outline" onClick={() => setConfirmToggle(null)} className="rounded-xl">
                                                                    取消
                                                                </Button>
                                                                <Button
                                                                    variant={u.status === 1 ? "destructive" : "default"}
                                                                    className={!u.status || u.status !== 1 ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl" : "rounded-xl"}
                                                                    onClick={() => handleToggleStatus(u.id, u.status)}
                                                                >
                                                                    确认{u.status === 1 ? '禁用' : '启用'}
                                                                </Button>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
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

            {/* User Detail Dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-lg rounded-2xl">
                    <DialogHeader className="dialog-header-gradient pb-4">
                        <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>用户详情</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (() => {
                        const ut = userTypeMap[selectedUser.userType] || defaultUserType;
                        const st = statusLabels[selectedUser.status] || defaultStatus;
                        const Icon = ut.icon;
                        return (
                            <div className="space-y-5">
                                <div className="flex items-center gap-4 pb-4 border-b border-[hsl(30_12%_92%)]">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-indigo-500/15">
                                        <Icon className="h-6 w-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg" style={{fontFamily: 'var(--font-display)'}}>
                                            {selectedUser.realName || selectedUser.companyName || selectedUser.username}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className={`${ut.color} text-xs px-2.5 py-0.5 rounded-lg border`}>
                                                {ut.label}
                                            </Badge>
                                            <Badge className={`${st.color} text-xs px-2.5 py-0.5 rounded-lg border`}>
                                                {st.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>基本信息</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>用户名</span>
                                            </div>
                                            <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedUser.username}</p>
                                        </div>
                                        {selectedUser.phone && (
                                            <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>手机号</span>
                                                </div>
                                                <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedUser.phone}</p>
                                            </div>
                                        )}
                                        {selectedUser.email && (
                                            <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>邮箱</span>
                                                </div>
                                                <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{selectedUser.email}</p>
                                            </div>
                                        )}
                                        <div className="p-3 rounded-lg bg-[hsl(30_12%_96%)]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>注册时间</span>
                                            </div>
                                            <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{formatTime(selectedUser.createTime)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Role-specific info */}
                                {selectedUser.userType === 1 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>学生信息</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedUser.studentId && (
                                                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <GraduationCap className="h-4 w-4 text-blue-500" />
                                                        <span className="text-xs text-blue-600" style={{fontFamily: 'var(--font-body)'}}>学号</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-blue-800" style={{fontFamily: 'var(--font-body)'}}>{selectedUser.studentId}</p>
                                                </div>
                                            )}
                                            {selectedUser.campusCardNo && (
                                                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Award className="h-4 w-4 text-indigo-500" />
                                                        <span className="text-xs text-indigo-600" style={{fontFamily: 'var(--font-body)'}}>校园卡号</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-indigo-800" style={{fontFamily: 'var(--font-body)'}}>{selectedUser.campusCardNo}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedUser.userType === 2 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>企业信息</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedUser.companyName && (
                                                <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Building2 className="h-4 w-4 text-violet-500" />
                                                        <span className="text-xs text-violet-600" style={{fontFamily: 'var(--font-body)'}}>企业名称</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-violet-800" style={{fontFamily: 'var(--font-body)'}}>{selectedUser.companyName}</p>
                                                </div>
                                            )}
                                            {selectedUser.companyCode && (
                                                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="h-4 w-4 text-purple-500" />
                                                        <span className="text-xs text-purple-600" style={{fontFamily: 'var(--font-body)'}}>信用代码</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-purple-800" style={{fontFamily: 'var(--font-body)'}}>{selectedUser.companyCode}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedUser.userType === 3 && selectedUser.teacherNo && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>教师信息</h4>
                                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                                            <div className="flex items-center gap-2 mb-1">
                                                <BookOpen className="h-4 w-4 text-emerald-500" />
                                                <span className="text-xs text-emerald-600" style={{fontFamily: 'var(--font-body)'}}>工号</span>
                                            </div>
                                            <p className="text-sm font-medium text-emerald-800" style={{fontFamily: 'var(--font-body)'}}>{selectedUser.teacherNo}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
