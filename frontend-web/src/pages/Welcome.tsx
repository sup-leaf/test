import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {typedGet} from '@/lib/api';
import {
    GraduationCap,
    ArrowRight,
    Briefcase,
    FlaskConical,
    Trophy,
    Users,
    Building2,
    ChevronRight,
    Sparkles,
    Zap,
    Shield,
} from 'lucide-react';

const features = [
    {
        icon: Briefcase,
        title: '海量校内岗位',
        desc: '覆盖全校各专业方向，实时更新优质岗位信息',
        color: 'from-[hsl(var(--primary))] to-[hsl(var(--primary-light))]',
    },
    {
        icon: FlaskConical,
        title: '科研项目对接',
        desc: '前沿课题等你参与，与导师深度合作',
        color: 'from-[hsl(var(--accent))] to-[hsl(40_80%_65%)]',
    },
    {
        icon: Trophy,
        title: '竞赛组队平台',
        desc: '找到志同道合的队友，一起冲击奖项',
        color: 'from-[hsl(15_60%_55%)] to-[hsl(25_70%_58%)]',
    },
    {
        icon: Users,
        title: '人才精准匹配',
        desc: 'AI智能推荐，让合适的人遇见合适的机会',
        color: 'from-[hsl(200_60%_50%)] to-[hsl(210_70%_60%)]',
    },
];

const stats = [
    {num: '2000+', label: '活跃用户', icon: Users, key: 'userCount'},
    {num: '500+', label: '在招岗位', icon: Briefcase, key: 'jobCount'},
    {num: '100+', label: '合作企业', icon: Building2, key: 'enterpriseCount'},
];

const roles = [
    {emoji: '🎓', title: '学生', desc: '寻找实习、就业、科研机会', action: '开始探索'},
    {emoji: '🏢', title: '企业', desc: '发布岗位、招募优秀人才', action: '发布岗位'},
    {emoji: '📚', title: '教师', desc: '管理科研项目、指导学生', action: '进入管理'},
];

export default function Welcome() {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [activeRole, setActiveRole] = useState(0);
    const [counts, setCounts] = useState<Record<string, number | null>>({userCount: null, jobCount: null, enterpriseCount: null, todayJobCount: null});
    const [recentJobs, setRecentJobs] = useState<{title: string; location: string}[]>([]);

    useEffect(() => {
        setMounted(true);
        console.log('[Welcome] fetching public stats...');
        typedGet<Record<string, number>>('/public/stats')
            .then(d => { console.log('[Welcome] stats loaded:', d); setCounts(prev => ({ ...prev, ...d })); if (Array.isArray((d as any).recentJobs)) setRecentJobs((d as any).recentJobs); })
            .catch(e => console.error('Welcome stats failed:', e));
    }, []);

    return (
        <div className="min-h-screen bg-[hsl(40_20%_98%)] overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col">
                {/* Background */}
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(20_12%_18%/0.95)] via-[hsl(25_10%_22%/0.92)] to-[hsl(30_8%_16%/0.97)]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(25_70%_48%/0.1)] via-transparent to-transparent" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[hsl(var(--primary)/0.06)] rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[hsl(var(--accent)/0.05)] rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1.5s'}} />
                    <div className="absolute top-1/3 right-[15%] w-[300px] h-[300px] bg-[hsl(var(--primary-light)/0.04)] rounded-full blur-[80px] animate-pulse" style={{animationDelay: '0.8s'}} />
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `linear-gradient(hsl(var(--primary)/0.15) 1px, transparent 1px),
                                            linear-gradient(90deg, hsl(var(--primary)/0.15) 1px, transparent 1px)`,
                            backgroundSize: '80px 80px',
                        }}
                    />
                    {/* Diagonal Lines Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.015]"
                        style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)`,
                        }}
                    />
                </div>

                {/* Grain Texture */}
                <div className="absolute inset-0 noise" />

                {/* Navigation */}
                <nav className={`relative z-20 flex items-center justify-between px-8 lg:px-16 py-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg text-white tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                                校园集市
                            </h1>
                            <p className="text-[10px] text-white/40 tracking-[0.15em] uppercase" style={{fontFamily: 'var(--font-body)'}}>
                                BJTU Market
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            onClick={() => navigate('/login')}
                        >
                            登录
                        </Button>
                        <Button
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                            onClick={() => navigate('/register')}
                        >
                            注册
                        </Button>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 flex-1 flex items-center px-8 lg:px-16">
                    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Left: Text Content */}
                        <div className="flex-1 max-w-2xl">
                            {/* Badge */}
                            <div className={`mb-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                                <span className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white/70 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
                                    <Sparkles className="h-4 w-4 text-[hsl(var(--primary-light))]" />
                                    北京交通大学官方校园人才平台
                                </span>
                            </div>

                            {/* Headline */}
                            <div className={`mb-8 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                                <h1 className="text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05]" style={{fontFamily: 'var(--font-display)'}}>
                                    连接
                                    <span className="text-[hsl(var(--primary-light))]"> 才华 </span>
                                    与
                                    <span className="text-[hsl(var(--accent-light))]"> 机遇 </span>
                                </h1>
                            </div>

                            {/* Description */}
                            <div className={`mb-12 max-w-xl transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                                <p className="text-lg text-white/50 leading-relaxed" style={{fontFamily: 'var(--font-body)'}}>
                                    一站式校园人才供需平台，为学生提供实习就业机会，为企业输送优秀人才。
                                    在这里，每一位北交大学子都能找到属于自己的舞台。
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className={`flex flex-wrap gap-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                                <Button
                                    size="lg"
                                    className="h-14 px-8 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white font-medium shadow-lg shadow-[hsl(var(--primary)/0.3)] btn-shine text-base"
                                    onClick={() => navigate('/register')}
                                >
                                    <span>免费注册</span>
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-8 bg-white/5 hover:bg-white/10 text-white border-white/20 backdrop-blur-sm text-base"
                                    onClick={() => navigate('/login')}
                                >
                                    <span>已有账号？登录</span>
                                </Button>
                            </div>
                        </div>

                        {/* Right: Visual Cards */}
                        <div className={`hidden lg:block flex-1 max-w-lg transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                            <div className="relative">
                                {/* Main Card */}
                                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
                                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-[hsl(var(--primary))] rounded-xl flex items-center justify-center shadow-lg">
                                        <GraduationCap className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] flex items-center justify-center">
                                            <Briefcase className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium" style={{fontFamily: 'var(--font-body)'}}>今日新岗位</p>
                                            <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{counts.todayJobCount != null ? counts.todayJobCount : '—'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {counts.todayJobCount == null
                                            ? <p className="text-sm text-white/30 text-center py-2">加载中...</p>
                                            : recentJobs.length === 0
                                                ? <p className="text-sm text-white/30 text-center py-2">暂无</p>
                                                : recentJobs.map((job, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent)/0.2)] flex items-center justify-center">
                                                            <Briefcase className="h-4 w-4 text-[hsl(var(--accent-light))]" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-white/80" style={{fontFamily: 'var(--font-body)'}}>{job.title}</p>
                                                            <p className="text-xs text-white/40" style={{fontFamily: 'var(--font-body)'}}>{job.location || '实习'}</p>
                                                        </div>
                                                    </div>
                                                ))
                                        }
                                    </div>
                                </div>

                                {/* Floating Stats Card */}
                                <div className="absolute -bottom-6 -left-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 shadow-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/50" style={{fontFamily: 'var(--font-body)'}}>活跃用户</p>
                                            <p className="text-lg text-white" style={{fontFamily: 'var(--font-display)'}}>{counts.userCount != null ? counts.userCount : '—'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Match Card */}
                                <div className="absolute -top-4 -left-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 shadow-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.2)] flex items-center justify-center">
                                            <Briefcase className="h-5 w-5 text-[hsl(var(--primary-light))]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/50" style={{fontFamily: 'var(--font-body)'}}>在招岗位</p>
                                            <p className="text-lg text-white" style={{fontFamily: 'var(--font-display)'}}>{counts.jobCount != null ? counts.jobCount : '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className={`relative z-10 flex justify-center pb-12 transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <div className="flex flex-col items-center gap-2 text-white/30">
                        <span className="text-xs tracking-wider" style={{fontFamily: 'var(--font-body)'}}>了解更多</span>
                        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-1">
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-24 lg:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-8 lg:px-16">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 text-xs font-medium text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] rounded-full mb-4">
                            核心功能
                        </span>
                        <h2 className="text-3xl md:text-4xl text-foreground mb-4" style={{fontFamily: 'var(--font-display)'}}>
                            为每一位交大人量身打造
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto" style={{fontFamily: 'var(--font-body)'}}>
                            无论你是寻找机会的学生，还是招募人才的企业，这里都有你需要的一切
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="group relative p-6 rounded-2xl bg-[hsl(40_20%_98%)] border border-[hsl(30_12%_92%)] hover:border-[hsl(var(--primary)/0.2)] hover:shadow-lg transition-all duration-300"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2" style={{fontFamily: 'var(--font-display)'}}>
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed" style={{fontFamily: 'var(--font-body)'}}>
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative py-20 bg-gradient-to-br from-[hsl(20_12%_18%)] via-[hsl(25_10%_22%)] to-[hsl(30_8%_16%)]">
                <div className="absolute inset-0 noise" />
                <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/5 flex items-center justify-center">
                                    <stat.icon className="h-6 w-6 text-[hsl(var(--primary-light))]" />
                                </div>
                                <p className="text-3xl md:text-4xl text-white mb-2" style={{fontFamily: 'var(--font-display)'}}>
                                    {counts[stat.key] != null ? counts[stat.key] + '+' : stat.num}
                                </p>
                                <p className="text-sm text-white/40" style={{fontFamily: 'var(--font-body)'}}>
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Role Selection Section */}
            <section className="relative py-24 lg:py-32 bg-[hsl(40_20%_98%)]">
                <div className="max-w-7xl mx-auto px-8 lg:px-16">
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 text-xs font-medium text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] rounded-full mb-4">
                            选择身份
                        </span>
                        <h2 className="text-3xl md:text-4xl text-foreground mb-4" style={{fontFamily: 'var(--font-display)'}}>
                            你是哪一类用户？
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto" style={{fontFamily: 'var(--font-body)'}}>
                            不同身份，不同体验。选择你的角色，开始专属旅程
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {roles.map((role, i) => (
                            <div
                                key={i}
                                className={`group relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                    activeRole === i
                                        ? 'bg-white border-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary)/0.1)]'
                                        : 'bg-white border-[hsl(30_12%_92%)] hover:border-[hsl(var(--primary)/0.3)]'
                                }`}
                                onClick={() => setActiveRole(i)}
                            >
                                <div className="text-4xl mb-4">{role.emoji}</div>
                                <h3 className="text-xl font-semibold text-foreground mb-2" style={{fontFamily: 'var(--font-display)'}}>
                                    {role.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6" style={{fontFamily: 'var(--font-body)'}}>
                                    {role.desc}
                                </p>
                                <Button
                                    className={`w-full ${
                                        activeRole === i
                                            ? 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white'
                                            : 'bg-[hsl(30_12%_96%)] hover:bg-[hsl(30_12%_92%)] text-foreground'
                                    }`}
                                    onClick={() => navigate('/register')}
                                >
                                    {role.action}
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 bg-white">
                <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
                    <div className="p-12 rounded-3xl bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-[hsl(var(--accent)/0.05)] border border-[hsl(var(--primary)/0.1)]">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                            <Zap className="h-8 w-8 text-[hsl(var(--primary))]" />
                        </div>
                        <h2 className="text-3xl md:text-4xl text-foreground mb-4" style={{fontFamily: 'var(--font-display)'}}>
                            准备好开始了吗？
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto" style={{fontFamily: 'var(--font-body)'}}>
                            加入北交大校园集市，开启你的校园人才之旅
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                size="lg"
                                className="h-12 px-8 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white shadow-lg shadow-[hsl(var(--primary)/0.2)]"
                                onClick={() => navigate('/register')}
                            >
                                立即注册
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 px-8"
                                onClick={() => navigate('/login')}
                            >
                                已有账号？登录
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[hsl(20_12%_18%)] py-12">
                <div className="max-w-7xl mx-auto px-8 lg:px-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-white" style={{fontFamily: 'var(--font-display)'}}>
                                    校园集市
                                </p>
                                <p className="text-[10px] text-white/30" style={{fontFamily: 'var(--font-body)'}}>
                                    BJTU Market
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                                关于我们
                            </a>
                            <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                                使用条款
                            </a>
                            <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                                隐私政策
                            </a>
                            <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors" style={{fontFamily: 'var(--font-body)'}}>
                                联系我们
                            </a>
                        </div>
                        <p className="text-xs text-white/20" style={{fontFamily: 'var(--font-body)'}}>
                            © 2024 北京交通大学校园集市. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
