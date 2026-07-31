import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  User, Mail, Phone, Building2, GraduationCap, BookOpen,
  Save, Edit3, Shield, Award, Calendar, MapPin, Briefcase,
  Star, TrendingUp, Sparkles, Camera, Lock, Bell, Palette,
} from 'lucide-react';
import { getUser, setUser, getUserTypeLabel } from '@/lib/auth';
import { typedGet, typedPost } from '@/lib/api';
import { toast } from 'sonner';

interface UserProfile {
  id: number;
  username: string;
  realName: string;
  email: string;
  phone: string;
  userType: number;
  status: number;
  memberLevel: number;
  // Student fields
  studentId: string;
  campusCardNo: string;
  // Enterprise fields
  companyName: string;
  companyCode: string;
  // Teacher fields
  teacherNo: string;
  // Common
  createTime: string;
}

const roleConfig: Record<number, { label: string; icon: typeof User; color: string; bg: string; gradient: string }> = {
  1: { label: '学生', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100', gradient: 'from-blue-500 to-indigo-500' },
  2: { label: '企业', icon: Building2, color: 'text-violet-600', bg: 'bg-violet-100', gradient: 'from-violet-500 to-purple-500' },
  3: { label: '教师', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', gradient: 'from-emerald-500 to-teal-500' },
};

export default function Profile() {
  const user = getUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [editForm, setEditForm] = useState({
    realName: '',
    email: '',
    phone: '',
    studentId: '',
    campusCardNo: '',
    companyName: '',
    teacherNo: '',
  });
  const [showPwdDialog, setShowPwdDialog] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await typedGet<UserProfile>('/user/profile');
      setProfile(data);
      setEditForm({
        realName: data.realName || '',
        email: data.email || '',
        phone: data.phone || '',
        studentId: data.studentId || '',
        campusCardNo: data.campusCardNo || '',
        companyName: data.companyName || '',
        teacherNo: data.teacherNo || '',
      });
    } catch (err: any) {
      toast.error(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await typedPost('/user/profile/update', editForm);
      toast.success('保存成功');
      setEditing(false);
      fetchProfile();
      // Update local user info
      if (user) {
        setUser({ ...user, realName: editForm.realName, email: editForm.email });
      }
    } catch (err: any) {
      toast.error(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePwd = async () => {
    if (!pwdForm.oldPassword || !pwdForm.newPassword) {
      toast.error('请填写旧密码和新密码');
      return;
    }
    setSavingPwd(true);
    try {
      await typedPost('/user/change-password', pwdForm);
      toast.success('密码修改成功，请重新登录');
      setShowPwdDialog(false);
      setPwdForm({ oldPassword: '', newPassword: '' });
    } catch (err: any) {
      toast.error(err.message || '修改失败');
    } finally {
      setSavingPwd(false);
    }
  };

  const role = roleConfig[user?.userType || 1] || roleConfig[1];
  const RoleIcon = role.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-[hsl(var(--primary))]" />
          <p className="text-sm text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>加载个人资料...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---- Hero header ---- */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(20_12%_18%)] via-[hsl(25_10%_22%)] to-[hsl(30_8%_16%)] p-6 md:p-8 text-white transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="absolute inset-0 noise" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[hsl(var(--primary)/0.12)] rounded-full blur-[80px]" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[hsl(var(--accent)/0.1)] rounded-full blur-[60px]" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] flex items-center justify-center text-3xl font-bold shadow-lg shadow-[hsl(var(--primary)/0.3)]" style={{fontFamily: 'var(--font-display)'}}>
              {(profile?.realName || profile?.username || '?')[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                {profile?.realName || profile?.username || '用户'}
              </h2>
              <Badge className={`${role.bg} ${role.color} border-0 text-xs px-2.5 py-0.5 rounded-lg`}>
                <RoleIcon className="h-3 w-3 mr-1" />
                {role.label}
              </Badge>
            </div>
            <p className="text-white/40 text-sm" style={{fontFamily: 'var(--font-body)'}}>
              {profile?.email || '暂未设置邮箱'}
            </p>
            {profile?.createTime && (
              <p className="text-white/30 text-xs mt-1" style={{fontFamily: 'var(--font-body)'}}>
                注册时间：{new Date(profile.createTime).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>

          {/* Edit Button */}
          <Button
            onClick={() => setEditing(true)}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            编辑资料
          </Button>
        </div>
      </div>

      {/* ---- Profile Content ---- */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info Card */}
        <Card className="rounded-xl border-[hsl(30_12%_92%)] bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2" style={{fontFamily: 'var(--font-display)'}}>
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.08)] flex items-center justify-center">
                <User className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(30_12%_96%)]">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>用户名</p>
                <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{profile?.username || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(30_12%_96%)]">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>真实姓名</p>
                <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{profile?.realName || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(30_12%_96%)]">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>邮箱</p>
                <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{profile?.email || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(30_12%_96%)]">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>手机号</p>
                <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{profile?.phone || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-specific Info Card */}
        <Card className="rounded-xl border-[hsl(30_12%_92%)] bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2" style={{fontFamily: 'var(--font-display)'}}>
              <div className={`w-8 h-8 rounded-lg ${role.bg} flex items-center justify-center`}>
                <RoleIcon className={`h-4 w-4 ${role.color}`} />
              </div>
              {role.label}信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.userType === 1 && (
              <>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-xs text-blue-600" style={{fontFamily: 'var(--font-body)'}}>学号</p>
                    <p className="text-sm font-medium text-blue-800" style={{fontFamily: 'var(--font-body)'}}>{profile?.studentId || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50">
                  <Award className="h-4 w-4 text-indigo-500" />
                  <div className="flex-1">
                    <p className="text-xs text-indigo-600" style={{fontFamily: 'var(--font-body)'}}>校园卡号</p>
                    <p className="text-sm font-medium text-indigo-800" style={{fontFamily: 'var(--font-body)'}}>{profile?.campusCardNo || '-'}</p>
                  </div>
                </div>
              </>
            )}
            {user?.userType === 2 && (
              <>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-50">
                  <Building2 className="h-4 w-4 text-violet-500" />
                  <div className="flex-1">
                    <p className="text-xs text-violet-600" style={{fontFamily: 'var(--font-body)'}}>企业名称</p>
                    <p className="text-sm font-medium text-violet-800" style={{fontFamily: 'var(--font-body)'}}>{profile?.companyName || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-xs text-purple-600" style={{fontFamily: 'var(--font-body)'}}>统一社会信用代码</p>
                    <p className="text-sm font-medium text-purple-800" style={{fontFamily: 'var(--font-body)'}}>{profile?.companyCode || '-'}</p>
                  </div>
                </div>
              </>
            )}
            {user?.userType === 3 && (
              <>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                  <div className="flex-1">
                    <p className="text-xs text-emerald-600" style={{fontFamily: 'var(--font-body)'}}>工号</p>
                    <p className="text-sm font-medium text-emerald-800" style={{fontFamily: 'var(--font-body)'}}>{profile?.teacherNo || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50">
                  <Shield className="h-4 w-4 text-teal-500" />
                  <div className="flex-1">
                    <p className="text-xs text-teal-600" style={{fontFamily: 'var(--font-body)'}}>身份</p>
                    <p className="text-sm font-medium text-teal-800" style={{fontFamily: 'var(--font-body)'}}>管理员 / 教师</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="rounded-xl border-[hsl(30_12%_92%)] bg-white md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2" style={{fontFamily: 'var(--font-display)'}}>
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent)/0.08)] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
              </div>
              快捷操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {user?.userType === 1 && (
                <>
                  <Button variant="outline" className="h-auto py-4 rounded-xl flex-col gap-2" onClick={() => window.location.href = '/app/resume'}>
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-xs" style={{fontFamily: 'var(--font-body)'}}>我的简历</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 rounded-xl flex-col gap-2" onClick={() => window.location.href = '/app/my-deliveries'}>
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-violet-500" />
                    </div>
                    <span className="text-xs" style={{fontFamily: 'var(--font-body)'}}>投递记录</span>
                  </Button>
                </>
              )}
               <Button variant="outline" className="h-auto py-4 rounded-xl flex-col gap-2" onClick={() => setShowPwdDialog(true)}>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-amber-500" />
                </div>
                <span className="text-xs" style={{fontFamily: 'var(--font-body)'}}>修改密码</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 rounded-xl flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="text-xs" style={{fontFamily: 'var(--font-body)'}}>通知设置</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>编辑个人资料</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>真实姓名</Label>
                <Input
                  value={editForm.realName}
                  onChange={(e) => setEditForm({...editForm, realName: e.target.value})}
                  className="mt-2 rounded-xl"
                  placeholder="请输入真实姓名"
                />
              </div>
              <div>
                <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>邮箱</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="mt-2 rounded-xl"
                  placeholder="请输入邮箱"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>手机号</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                className="mt-2 rounded-xl"
                placeholder="请输入手机号"
              />
            </div>

            {user?.userType === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>学号</Label>
                    <Input
                      value={editForm.studentId}
                      onChange={(e) => setEditForm({...editForm, studentId: e.target.value})}
                      className="mt-2 rounded-xl"
                      placeholder="请输入学号"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>校园卡号</Label>
                    <Input
                      value={editForm.campusCardNo}
                      onChange={(e) => setEditForm({...editForm, campusCardNo: e.target.value})}
                      className="mt-2 rounded-xl"
                      placeholder="请输入校园卡号"
                    />
                  </div>
                </div>
              </>
            )}

            {user?.userType === 2 && (
              <>
                <div>
                  <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>企业名称</Label>
                  <Input
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                    className="mt-2 rounded-xl"
                    placeholder="请输入企业名称"
                  />
                </div>
              </>
            )}

            {user?.userType === 3 && (
              <>
                <div>
                  <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>工号</Label>
                  <Input
                    value={editForm.teacherNo}
                    onChange={(e) => setEditForm({...editForm, teacherNo: e.target.value})}
                    className="mt-2 rounded-xl"
                    placeholder="请输入工号"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl"
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white rounded-xl shadow-lg shadow-[hsl(var(--primary)/0.2)]"
              >
                {saving ? '保存中...' : '保存修改'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPwdDialog} onOpenChange={setShowPwdDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader className="dialog-header-gradient pb-4">
            <DialogTitle className="text-lg" style={{fontFamily: 'var(--font-display)'}}>修改密码</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>旧密码</Label>
              <Input type="password" value={pwdForm.oldPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                className="mt-2 rounded-xl" placeholder="请输入旧密码" />
            </div>
            <div>
              <Label className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>新密码</Label>
              <Input type="password" value={pwdForm.newPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                className="mt-2 rounded-xl" placeholder="请输入新密码" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowPwdDialog(false)} className="flex-1 rounded-xl">取消</Button>
              <Button onClick={handleSavePwd} disabled={savingPwd}
                className="flex-1 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white rounded-xl shadow-lg shadow-[hsl(var(--primary)/0.2)]">
                {savingPwd ? '保存中...' : '确认修改'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
