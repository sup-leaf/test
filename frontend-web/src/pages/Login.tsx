import {useState, useEffect} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {GraduationCap, ArrowRight, Briefcase, FlaskConical, Trophy, ChevronRight} from 'lucide-react';
import {encryptPassword, setToken, setUser} from '@/lib/auth';
import {typedGet, typedPost} from '@/lib/api';
import type {User} from '@/lib/types';
import {toast} from 'sonner';

const roleConfig = [
    {value: '1', label: '学生', emoji: '🎓'},
    {value: '2', label: '企业', emoji: '🏢'},
    {value: '3', label: '教师', emoji: '📚'},
];

const highlights = [
    {icon: Briefcase, text: '海量校内岗位', desc: '覆盖全校各专业方向'},
    {icon: FlaskConical, text: '科研项目对接', desc: '前沿课题等你参与'},
    {icon: Trophy, text: '竞赛组队平台', desc: '找到志同道合的队友'},
];

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('1');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mounted, setMounted] = useState(false);
    const [counts, setCounts] = useState<Record<string, number | null>>({userCount: null, jobCount: null});

    useEffect(() => {
        setMounted(true);
        typedGet<Record<string, number>>('/public/stats')
            .then(d => setCounts(prev => ({ ...prev, ...d })))
            .catch(() => {});
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('请填写用户名和密码');
            return;
        }
        setLoading(true);
        try {
            const data = await typedPost<{ token: string; user: User }>('/auth/login', {
                username,
                password: encryptPassword(password),
                userType: parseInt(userType),
            });
            const {token, user} = data;
            setToken(token);
            setUser(user);
            toast.success('登录成功');
            if (user.userType === 1) navigate('/app/jobs');
            else if (user.userType === 2) navigate('/app/my-jobs');
            else navigate('/app/dashboard');
        } catch (err: any) {
            toast.error(err.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left: Brand Showcase */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
                {/* Background Image Layer */}
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
                        }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(20_12%_18%/0.92)] via-[hsl(25_10%_22%/0.88)] to-[hsl(30_8%_16%/0.95)]" />
                    {/* Warm Accent Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(25_70%_48%/0.15)] via-transparent to-transparent" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute inset-0">
                    {/* Soft Light Orbs */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--primary)/0.08)] rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[hsl(var(--accent)/0.06)] rounded-full blur-[80px] animate-pulse" style={{animationDelay: '1s'}} />

                    {/* Subtle Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(hsl(var(--primary)/0.1) 1px, transparent 1px),
                                            linear-gradient(90deg, hsl(var(--primary)/0.1) 1px, transparent 1px)`,
                            backgroundSize: '60px 60px',
                        }}
                    />
                </div>

                {/* Grain Texture */}
                <div className="absolute inset-0 noise" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between px-16 xl:px-20 py-12">
                    {/* Top: Logo */}
                    <div className={`flex items-center gap-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl text-white tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                                校园集市
                            </h1>
                            <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase" style={{fontFamily: 'var(--font-body)'}}>
                                BJTU Market
                            </p>
                        </div>
                    </div>

                    {/* Center: Main Headline */}
                    <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 text-xs font-medium text-white/60 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
                                北京交通大学官方平台
                            </span>
                        </div>

                        <h2 className="text-5xl xl:text-6xl 2xl:text-7xl text-white leading-[1.05] mb-6" style={{fontFamily: 'var(--font-display)'}}>
                            连接
                            <span className="block text-[hsl(var(--primary-light))]">
                                才华与机遇
                            </span>
                        </h2>

                        <p className="text-base text-white/50 max-w-md leading-relaxed" style={{fontFamily: 'var(--font-body)'}}>
                            一站式校园人才供需平台
                            <br />
                            为学生提供实习就业机会，为企业输送优秀人才
                        </p>
                    </div>

                    {/* Bottom: Feature Highlights */}
                    <div className={`space-y-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        {highlights.map((item, i) => (
                            <div
                                key={i}
                                className="group flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 cursor-default"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--primary)/0.2)] to-[hsl(var(--accent)/0.1)] flex items-center justify-center">
                                    <item.icon className="h-5 w-5 text-[hsl(var(--primary-light))]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white/80" style={{fontFamily: 'var(--font-body)'}}>
                                        {item.text}
                                    </p>
                                    <p className="text-xs text-white/30 mt-0.5" style={{fontFamily: 'var(--font-body)'}}>
                                        {item.desc}
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                            </div>
                        ))}

                        {/* Stats */}
                        <div className="flex gap-8 pt-6 mt-6 border-t border-white/[0.06]">
                            {[
                                {num: counts.userCount != null ? counts.userCount + '+' : '2000+', label: '活跃用户'},
                                {num: counts.jobCount != null ? counts.jobCount + '+' : '500+', label: '在招岗位'},
                            ].map((stat, i) => (
                                <div key={i} className="flex-1">
                                    <p className="text-2xl text-white font-light" style={{fontFamily: 'var(--font-display)'}}>
                                        {stat.num}
                                    </p>
                                    <p className="text-[11px] text-white/30 mt-1" style={{fontFamily: 'var(--font-body)'}}>
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[hsl(40_20%_98%)] relative">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-[0.015]">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
                            backgroundSize: '32px 32px',
                        }}
                    />
                </div>

                <div className={`w-full max-w-[420px] relative z-10 transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* Mobile Logo */}
                    <div className="text-center mb-10 lg:hidden">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] mb-4 shadow-lg shadow-[hsl(var(--primary)/0.2)]">
                            <GraduationCap className="h-8 w-8 text-white"/>
                        </div>
                        <h1 className="text-2xl text-foreground" style={{fontFamily: 'var(--font-display)'}}>
                            校园集市
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">校内一体化人才供需平台</p>
                    </div>

                    {/* Desktop welcome text */}
                    <div className="hidden lg:block mb-8">
                        <h2 className="text-3xl text-foreground" style={{fontFamily: 'var(--font-display)'}}>
                            欢迎回来
                        </h2>
                        <p className="text-muted-foreground text-sm mt-2" style={{fontFamily: 'var(--font-body)'}}>
                            登录你的账号，继续探索校园机遇
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-[0_2px_40px_rgba(181,101,29,0.06)] border border-[hsl(30_12%_92%)]">
                        {/* Role Tabs */}
                        <div className="flex gap-1 p-1 bg-[hsl(30_12%_96%)] rounded-xl mb-8">
                            {roleConfig.map((role) => (
                                <button
                                    key={role.value}
                                    onClick={() => {
                                        setUserType(role.value);
                                        setUsername('');
                                        setPassword('');
                                    }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-250 ${
                                        userType === role.value
                                            ? 'bg-white text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    style={{fontFamily: 'var(--font-body)'}}
                                >
                                    <span className="mr-1.5">{role.emoji}</span>
                                    {role.label}
                                </button>
                            ))}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                    用户名
                                </Label>
                                <Input
                                    placeholder="请输入用户名"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                        密码
                                    </Label>
                                    <Link to="/forgot-password" className="text-xs text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] transition-colors">
                                        忘记密码？
                                    </Link>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="请输入密码"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)] transition-all"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white font-medium shadow-md shadow-[hsl(var(--primary)/0.2)] btn-shine transition-all text-base"
                                style={{fontFamily: 'var(--font-body)'}}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                        登录中...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        登录
                                        <ArrowRight className="h-4 w-4"/>
                                    </div>
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="divider-gradient my-6" />

                        {/* Register */}
                        <div className="text-center text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                            还没有账号？{' '}
                            <Link to="/register" className="text-[hsl(var(--primary))] font-medium accent-underline">
                                立即注册
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-muted-foreground/40 mt-8" style={{fontFamily: 'var(--font-body)'}}>
                        BJTU 校园集市 · 连接才华与机遇
                    </p>
                </div>
            </div>
        </div>
    );
}
