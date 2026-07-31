import {Outlet, useNavigate, useLocation, Navigate} from 'react-router-dom';
import {getUser, logout, getUserTypeLabel, setUser, type User} from '@/lib/auth';
import {typedGet} from '@/lib/api';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Briefcase,
    FileText,
    Send,
    Building2,
    GraduationCap,
    BarChart3,
    FlaskConical,
    BookOpen,
    LogOut,
    Menu,
    ChevronLeft,
    Shield,
    Trophy,
    TrendingUp,
    Map,
    Globe,
    Search,
    Bell,
    Settings,
    Crown,
    BadgeCheck,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import {useState, useEffect} from 'react';
import NotificationBell from '@/components/NotificationBell';

const studentNav = [
    {path: '/app/jobs', label: '岗位广场', icon: Briefcase, desc: '发现机会'},
    {path: '/app/my-deliveries', label: '我的投递', icon: Send, desc: '投递记录'},
    {path: '/app/resume', label: '我的简历', icon: FileText, desc: '简历管理'},
    {path: '/app/research', label: '科研项目', icon: FlaskConical, desc: '科研对接'},
    {path: '/app/competition', label: '竞赛组队', icon: Trophy, desc: '组队参赛'},
    {path: '/app/my-internships', label: '我的实习', icon: BookOpen, desc: '实习记录'},
    {path: '/app/profile', label: '个人中心', icon: TrendingUp, desc: '成长轨迹'},
    {path: '/app/job-map', label: '岗位地图', icon: Map, desc: '全国分布'},
    {path: '/app/member', label: '会员中心', icon: Crown, desc: 'VIP情报'},
    {path: '/app/certificate-verify', label: '证明验证', icon: BadgeCheck, desc: '防伪核验'},
];

const enterpriseNav = [
    {path: '/app/my-jobs', label: '我的岗位', icon: Briefcase, desc: '岗位管理'},
    {path: '/app/received-deliveries', label: '收到的投递', icon: Send, desc: '简历筛选'},
    {path: '/app/my-interns', label: '实习生管理', icon: GraduationCap, desc: '人员管理'},
];

const adminNav = [
    {path: '/app/dashboard', label: '数据大屏', icon: BarChart3, desc: '数据概览'},
    {path: '/app/enterprise-audit', label: '企业审核', icon: Building2, desc: '资质审核'},
    {path: '/app/research-manage', label: '科研项目', icon: FlaskConical, desc: '项目管理'},
    {path: '/app/user-manage', label: '用户管理', icon: Shield, desc: '账号管理'},
    {path: '/app/crawler-manage', label: '爬虫管理', icon: Globe, desc: '数据采集'},
];

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUserState] = useState(getUser());
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [jobCount, setJobCount] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);
        // Fetch latest user profile from database
        const fetchUserProfile = async () => {
            try {
                const profile = await typedGet<User>('/user/profile');
                if (profile) {
                    const updatedUser = {
                        ...user,
                        realName: profile.realName || user?.realName,
                        email: profile.email || user?.email,
                        phone: profile.phone || user?.phone,
                    };
                    setUser(updatedUser);
                    setUserState(updatedUser);
                }
            } catch (err) {
                // Silently fail, use cached user data
            }
        };
        // Fetch job count for sidebar recommendation
        const fetchJobCount = async () => {
            try {
                const data = await typedGet<{ total?: number }>('/job/list', { params: { page: 1, size: 1 } });
                setJobCount(data?.total ?? null);
            } catch {
                // Silently fail
            }
        };
        fetchUserProfile();
        fetchJobCount();
    }, []);

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const navItems =
        user.userType === 1
            ? studentNav
            : user.userType === 2
                ? enterpriseNav
                : adminNav;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const currentPage = navItems.find(item =>
        location.pathname === item.path || location.pathname.startsWith(item.path + '/')
    );

    return (
        <div className="min-h-screen bg-[hsl(40_20%_98%)] flex">
            {/* Sidebar - Desktop */}
            <aside
                className={`hidden md:flex flex-col bg-gradient-to-b from-[hsl(40_15%_97%)] to-[hsl(35_12%_95%)] border-r border-[hsl(30_12%_90%)] sticky top-0 h-screen transition-all duration-300 ease-in-out ${
                    collapsed ? 'w-[80px]' : 'w-[280px]'
                }`}
            >
                {/* Logo Section */}
                <div className="relative px-5 h-[80px] flex items-center border-b border-[hsl(30_12%_92%)] shrink-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] flex items-center justify-center shadow-md shadow-[hsl(var(--primary)/0.2)]">
                            <GraduationCap className="h-5 w-5 text-white"/>
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <h1 className="text-lg text-foreground tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                                    校园集市
                                </h1>
                                <p className="text-[10px] text-muted-foreground/50 tracking-widest uppercase" style={{fontFamily: 'var(--font-body)'}}>
                                    BJTU Market
                                </p>
                            </div>
                        )}
                    </div>
                    {!collapsed && <NotificationBell />}
                </div>

                {/* Quick Stats - Only visible when expanded */}
                {!collapsed && (
                    <div className="px-5 py-4 border-b border-[hsl(30_12%_92%)]">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.04)] to-[hsl(var(--accent)/0.04)] border border-[hsl(var(--primary)/0.08)]">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
                                <span className="text-xs font-medium text-[hsl(var(--primary))]" style={{fontFamily: 'var(--font-body)'}}>
                                    今日推荐
                                </span>
                            </div>
                            <p className="text-[13px] text-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                {jobCount !== null ? (
                                    <>有 <span className="font-semibold text-[hsl(var(--primary))]">{jobCount}</span> 个在招岗位等你探索</>
                                ) : (
                                    '探索适合你的校园机会'
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Nav Items */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {!collapsed && (
                        <p className="px-3 mb-2 text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider" style={{fontFamily: 'var(--font-body)'}}>
                            导航菜单
                        </p>
                    )}
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`relative w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${
                                    collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
                                } ${
                                    isActive
                                        ? 'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary-dark))]'
                                        : 'text-muted-foreground hover:bg-[hsl(30_12%_96%)] hover:text-foreground'
                                }`}
                                style={{fontFamily: 'var(--font-body)'}}
                                title={item.label}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[hsl(var(--primary))] rounded-r-full" />
                                )}
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                    isActive
                                        ? 'bg-[hsl(var(--primary)/0.12)]'
                                        : 'bg-transparent group-hover:bg-[hsl(30_12%_94%)]'
                                }`}>
                                    <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground/50'}`}/>
                                </div>
                                {!collapsed && (
                                    <div className="flex-1 min-w-0 text-left">
                                        <span className={`text-[13px] whitespace-nowrap ${isActive ? 'font-medium' : 'font-normal'}`}>
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <p className="text-[11px] text-[hsl(var(--primary)/0.6)] mt-0.5">
                                                {item.desc}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {!collapsed && isActive && (
                                    <ChevronRight className="h-4 w-4 text-[hsl(var(--primary)/0.4)] shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Collapse Button & User */}
                <div className="border-t border-[hsl(30_12%_92%)] p-3 space-y-2 shrink-0">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`w-full flex items-center gap-2 rounded-lg py-2.5 px-3 text-muted-foreground hover:bg-[hsl(30_12%_96%)] hover:text-foreground transition-all ${collapsed ? 'justify-center' : ''}`}
                        style={{fontFamily: 'var(--font-body)'}}
                    >
                        <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}/>
                        {!collapsed && <span className="text-xs">收起侧栏</span>}
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={`w-full flex items-center gap-3 rounded-xl py-3 px-3 hover:bg-[hsl(30_12%_96%)] transition-all ${collapsed ? 'justify-center' : ''}`}>
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] font-medium shrink-0 border border-[hsl(var(--primary)/0.15)]" style={{fontFamily: 'var(--font-display)'}}>
                                        {(user.realName || user.username || '?')[0]}
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                                </div>
                                {!collapsed && (
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[13px] font-medium text-foreground truncate" style={{fontFamily: 'var(--font-body)'}}>
                                            {user.realName || user.username}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground/60" style={{fontFamily: 'var(--font-body)'}}>
                                            {getUserTypeLabel(user.userType)}
                                        </p>
                                    </div>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-3 py-2 border-b border-[hsl(30_12%_92%)]">
                                <p className="text-sm font-medium text-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                    {user.realName || user.username}
                                </p>
                                <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                    {user.email || '暂无邮箱'}
                                </p>
                            </div>
                            <DropdownMenuItem onClick={() => navigate('/app/settings')} className="cursor-pointer">
                                <Settings className="h-4 w-4 mr-2"/>
                                账号设置
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                                <LogOut className="h-4 w-4 mr-2"/>
                                退出登录
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[hsl(30_12%_92%)]">
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] flex items-center justify-center shadow-sm">
                            <GraduationCap className="h-4 w-4 text-white"/>
                        </div>
                        <div>
                            <h1 className="text-base text-foreground" style={{fontFamily: 'var(--font-display)'}}>校园集市</h1>
                            {currentPage && (
                                <p className="text-[10px] text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                    {currentPage.label}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-xl">
                            <Menu className="h-5 w-5"/>
                        </Button>
                    </div>
                </div>

                {/* Mobile Nav Dropdown */}
                {mobileMenuOpen && (
                    <div className="border-t bg-white/95 backdrop-blur-xl px-4 py-4 shadow-xl animate-fade-in max-h-[70vh] overflow-y-auto">
                        {/* User Info Card */}
                        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.04)] to-[hsl(var(--accent)/0.04)] border border-[hsl(var(--primary)/0.08)]">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] font-medium border border-[hsl(var(--primary)/0.15)]" style={{fontFamily: 'var(--font-display)'}}>
                                    {(user.realName || user.username || '?')[0]}
                                </div>
                                <div>
                                    <p className="font-medium text-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                        {user.realName || user.username}
                                    </p>
                                    <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                        {getUserTypeLabel(user.userType)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Nav Items */}
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.path}
                                        className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                                            isActive
                                                ? 'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary-dark))]'
                                                : 'text-muted-foreground hover:bg-[hsl(30_12%_96%)]'
                                        }`}
                                        style={{fontFamily: 'var(--font-body)'}}
                                        onClick={() => {
                                            navigate(item.path);
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                            isActive ? 'bg-[hsl(var(--primary)/0.12)]' : 'bg-[hsl(30_12%_96%)]'
                                        }`}>
                                            <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground/50'}`}/>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className="text-[13px]">{item.label}</span>
                                            <p className="text-[11px] text-muted-foreground/60">{item.desc}</p>
                                        </div>
                                        {isActive && <ChevronRight className="h-4 w-4 text-[hsl(var(--primary)/0.4)]" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="divider-gradient my-3" />

                        <button
                            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-destructive hover:bg-destructive/5 transition-all"
                            style={{fontFamily: 'var(--font-body)'}}
                            onClick={handleLogout}
                        >
                            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                                <LogOut className="h-[18px] w-[18px]"/>
                            </div>
                            <span className="text-[13px]">退出登录</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Top Bar - Desktop */}
                <div className="hidden md:flex items-center justify-between h-16 px-8 border-b border-[hsl(30_12%_92%)] bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        {currentPage && (
                            <div className="flex items-center gap-2">
                                <currentPage.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                                <div>
                                    <h2 className="text-base font-medium text-foreground" style={{fontFamily: 'var(--font-display)'}}>
                                        {currentPage.label}
                                    </h2>
                                    <p className="text-[11px] text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                        {currentPage.desc}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                            <Input
                                placeholder="搜索..."
                                className="w-64 h-9 pl-9 rounded-lg bg-[hsl(30_12%_96%)] border-transparent focus:border-[hsl(var(--primary)/0.3)] focus:bg-white transition-all text-sm"
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:text-foreground">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Page Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 mt-14 md:mt-0">
                    <Outlet/>
                </div>
            </main>
        </div>
    );
}
