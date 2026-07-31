import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {GraduationCap, ArrowLeft, Mail, CheckCircle, Loader2} from 'lucide-react';
import {toast} from 'sonner';

type Step = 'email' | 'sent' | 'reset';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(true);

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('请输入邮箱地址');
            return;
        }
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('请输入有效的邮箱地址');
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setStep('sent');
            toast.success('重置链接已发送');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left: Brand Showcase */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(20_12%_18%/0.92)] via-[hsl(25_10%_22%/0.88)] to-[hsl(30_8%_16%/0.95)]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(25_70%_48%/0.15)] via-transparent to-transparent" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--primary)/0.08)] rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[hsl(var(--accent)/0.06)] rounded-full blur-[80px] animate-pulse" style={{animationDelay: '1s'}} />
                </div>

                {/* Grain Texture */}
                <div className="absolute inset-0 noise" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between px-16 xl:px-20 py-12">
                    {/* Logo */}
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

                    {/* Center Content */}
                    <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <h2 className="text-4xl xl:text-5xl text-white leading-[1.1] mb-6" style={{fontFamily: 'var(--font-display)'}}>
                            找回你的
                            <br />
                            <span className="text-[hsl(var(--primary-light))]">账号密码</span>
                        </h2>
                        <p className="text-base text-white/50 max-w-md leading-relaxed" style={{fontFamily: 'var(--font-body)'}}>
                            别担心，我们都会遇到忘记密码的时候。
                            <br />
                            输入你的邮箱，我们会帮你重置密码。
                        </p>
                    </div>

                    {/* Bottom */}
                    <div className={`transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <p className="text-xs text-white/30" style={{fontFamily: 'var(--font-body)'}}>
                            © 2024 北京交通大学校园集市
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Form */}
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
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        className="mb-8 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate('/login')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        返回登录
                    </Button>

                    {/* Mobile Logo */}
                    <div className="text-center mb-8 lg:hidden">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] mb-4 shadow-lg shadow-[hsl(var(--primary)/0.2)]">
                            <GraduationCap className="h-8 w-8 text-white"/>
                        </div>
                        <h1 className="text-2xl text-foreground" style={{fontFamily: 'var(--font-display)'}}>
                            校园集市
                        </h1>
                    </div>

                    {/* Step: Email Input */}
                    {step === 'email' && (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-2xl text-foreground mb-2" style={{fontFamily: 'var(--font-display)'}}>
                                    忘记密码？
                                </h2>
                                <p className="text-muted-foreground text-sm" style={{fontFamily: 'var(--font-body)'}}>
                                    输入你注册时使用的邮箱地址，我们将发送密码重置链接
                                </p>
                            </div>

                            {/* Card */}
                            <div className="bg-white rounded-2xl p-8 shadow-[0_2px_40px_rgba(181,101,29,0.06)] border border-[hsl(30_12%_92%)]">
                                <form onSubmit={handleSendEmail} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                            邮箱地址
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="请输入你的邮箱"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-11 pl-10 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-11 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white font-medium shadow-md shadow-[hsl(var(--primary)/0.2)] btn-shine transition-all"
                                        style={{fontFamily: 'var(--font-body)'}}
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                发送中...
                                            </div>
                                        ) : (
                                            '发送重置链接'
                                        )}
                                    </Button>
                                </form>

                                {/* Divider */}
                                <div className="divider-gradient my-6" />

                                {/* Back to Login */}
                                <div className="text-center text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                    想起来了？{' '}
                                    <Link to="/login" className="text-[hsl(var(--primary))] font-medium accent-underline">
                                        返回登录
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step: Email Sent */}
                    {step === 'sent' && (
                        <div>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                                    <CheckCircle className="h-8 w-8 text-[hsl(var(--primary))]" />
                                </div>
                                <h2 className="text-2xl text-foreground mb-2" style={{fontFamily: 'var(--font-display)'}}>
                                    邮件已发送
                                </h2>
                                <p className="text-muted-foreground text-sm" style={{fontFamily: 'var(--font-body)'}}>
                                    我们已向 <span className="font-medium text-foreground">{email}</span> 发送了密码重置链接
                                </p>
                            </div>

                            {/* Card */}
                            <div className="bg-white rounded-2xl p-8 shadow-[0_2px_40px_rgba(181,101,29,0.06)] border border-[hsl(30_12%_92%)]">
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-[hsl(30_12%_96%)]">
                                        <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                                            📧 请检查你的收件箱（以及垃圾邮件文件夹），点击邮件中的链接重置密码。
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center" style={{fontFamily: 'var(--font-body)'}}>
                                        没有收到邮件？检查邮箱地址是否正确，或
                                        <button
                                            onClick={() => setStep('email')}
                                            className="text-[hsl(var(--primary))] hover:underline ml-1"
                                        >
                                            重新发送
                                        </button>
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="divider-gradient my-6" />

                                {/* Back to Login */}
                                <div className="text-center">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/login')}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        返回登录
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <p className="text-center text-xs text-muted-foreground/40 mt-8" style={{fontFamily: 'var(--font-body)'}}>
                        BJTU 校园集市 · 连接才华与机遇
                    </p>
                </div>
            </div>
        </div>
    );
}
