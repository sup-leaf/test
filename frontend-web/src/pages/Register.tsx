import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {GraduationCap, ArrowLeft} from 'lucide-react';
import {encryptPassword} from '@/lib/auth';
import {typedPost} from '@/lib/api';
import {toast} from 'sonner';

const roleConfig = [
    {value: '1', label: '学生', emoji: '🎓'},
    {value: '2', label: '企业', emoji: '🏢'},
    {value: '3', label: '教师', emoji: '📚'},
];

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('1');
    const [form, setForm] = useState({
        username: '', password: '', confirmPassword: '', realName: '',
        studentId: '', campusCardNo: '', companyName: '', companyCode: '',
        teacherNo: '', phone: '', email: '',
    });

    const updateForm = (key: string, value: string) => {
        setForm((prev) => ({...prev, [key]: value}));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            toast.error('请填写用户名和密码');
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error('两次密码不一致');
            return;
        }
        if (form.password.length < 6) {
            toast.error('密码长度不能少于6位');
            return;
        }
        if (userType === '1' && (!form.studentId || !form.campusCardNo)) {
            toast.error('学生注册需填写学号和校园卡号');
            return;
        }
        if (userType === '2' && (!form.companyName || !form.companyCode)) {
            toast.error('企业注册需填写企业名称和统一社会信用代码');
            return;
        }
        if (userType === '3' && !form.teacherNo) {
            toast.error('教师注册需填写工号');
            return;
        }
        setLoading(true);
        try {
            const payload: any = {
                username: form.username,
                password: encryptPassword(form.password),
                userType: parseInt(userType),
                realName: form.realName,
                phone: form.phone,
                email: form.email,
            };
            if (userType === '1') {
                payload.studentId = form.studentId;
                payload.campusCardNo = form.campusCardNo;
            } else if (userType === '2') {
                payload.companyName = form.companyName;
                payload.companyCode = form.companyCode;
            } else {
                payload.teacherNo = form.teacherNo;
            }
            await typedPost('/auth/register', payload);
            toast.success(userType === '2' ? '注册成功，请等待管理员审核' : '注册成功，请登录');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.message || '注册失败');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({username: '', password: '', confirmPassword: '', realName: '', studentId: '', campusCardNo: '', companyName: '', companyCode: '', teacherNo: '', phone: '', email: ''});
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-login p-4 relative">
            {/* Grain texture */}
            <div className="absolute inset-0 noise pointer-events-none" />

            <div className="w-full max-w-lg animate-fade-in relative z-10">
                {/* Back to login */}
                <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                    style={{fontFamily: 'var(--font-body)'}}
                >
                    <ArrowLeft className="h-4 w-4"/>
                    返回登录
                </Link>

                {/* Card */}
                <div className="bg-white rounded-2xl p-8 shadow-[0_2px_40px_rgba(181,101,29,0.06)] border border-[hsl(30_12%_92%)]">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[hsl(var(--primary)/0.08)] mb-4">
                            <GraduationCap className="h-7 w-7 text-[hsl(var(--primary))]"/>
                        </div>
                        <h1 className="text-2xl text-foreground" style={{fontFamily: 'var(--font-display)'}}>
                            注册账号
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>选择你的身份进行注册</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Role Tabs */}
                        <div className="flex gap-1 p-1 bg-[hsl(30_12%_96%)] rounded-xl">
                            {roleConfig.map((role) => (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => {
                                        setUserType(role.value);
                                        resetForm();
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

                        {/* Common fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>用户名 *</Label>
                                <Input
                                    placeholder="用户名"
                                    value={form.username}
                                    onChange={(e) => updateForm('username', e.target.value)}
                                    className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>真实姓名</Label>
                                <Input
                                    placeholder="真实姓名"
                                    value={form.realName}
                                    onChange={(e) => updateForm('realName', e.target.value)}
                                    className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>密码 *</Label>
                                <Input
                                    type="password"
                                    placeholder="密码"
                                    value={form.password}
                                    onChange={(e) => updateForm('password', e.target.value)}
                                    className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>确认密码 *</Label>
                                <Input
                                    type="password"
                                    placeholder="确认密码"
                                    value={form.confirmPassword}
                                    onChange={(e) => updateForm('confirmPassword', e.target.value)}
                                    className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)]"
                                />
                            </div>
                        </div>

                        {/* Role-specific fields */}
                        {userType === '1' && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>学号 *</Label>
                                    <Input
                                        placeholder="学号"
                                        value={form.studentId}
                                        onChange={(e) => updateForm('studentId', e.target.value)}
                                        className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>校园卡号 *</Label>
                                    <Input
                                        placeholder="校园卡号"
                                        value={form.campusCardNo}
                                        onChange={(e) => updateForm('campusCardNo', e.target.value)}
                                        className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)]"
                                    />
                                </div>
                            </div>
                        )}

                        {userType === '2' && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>企业名称 *</Label>
                                    <Input
                                        placeholder="企业名称"
                                        value={form.companyName}
                                        onChange={(e) => updateForm('companyName', e.target.value)}
                                        className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>统一社会信用代码 *</Label>
                                    <Input
                                        placeholder="信用代码"
                                        value={form.companyCode}
                                        onChange={(e) => updateForm('companyCode', e.target.value)}
                                        className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)]"
                                    />
                                </div>
                            </div>
                        )}

                        {userType === '3' && (
                            <div className="space-y-2 animate-fade-in">
                                <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>工号 *</Label>
                                <Input
                                    placeholder="教师工号"
                                    value={form.teacherNo}
                                    onChange={(e) => updateForm('teacherNo', e.target.value)}
                                    className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)]"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>手机号</Label>
                                <Input
                                    placeholder="手机号"
                                    value={form.phone}
                                    onChange={(e) => updateForm('phone', e.target.value)}
                                    className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>邮箱</Label>
                                <Input
                                    placeholder="邮箱"
                                    value={form.email}
                                    onChange={(e) => updateForm('email', e.target.value)}
                                    className="h-11 rounded-lg border-[hsl(30_12%_90%)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-[hsl(var(--primary)/0.12)]"
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
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                    注册中...
                                </div>
                            ) : '注册'}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="divider-gradient my-6" />

                    <div className="text-center text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                        已有账号？{' '}
                        <Link to="/login" className="text-[hsl(var(--primary))] font-medium accent-underline">
                            返回登录
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
