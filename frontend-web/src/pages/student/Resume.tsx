import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Save, Upload, FileText, X, Sparkles, Loader2,
  User, Code, Briefcase, Trophy, ClipboardList,
  Mail, Phone, GraduationCap, Target, CheckCircle2,
  FileUp, Lightbulb, FileCheck,
} from 'lucide-react';
import { typedGet, typedPost } from '@/lib/api';
import { getFileURL } from '@/lib/utils';
import { MAX_FILE_SIZE } from '@/lib/constants';
import type { Resume as ResumeType } from '@/lib/types';
import { toast } from 'sonner';

interface ResumeData {
  id?: number;
  name: string;
  gender: string;
  age: string;
  phone: string;
  email: string;
  major: string;
  grade: string;
  gpa: string;
  skills: string;
  projects: string;
  awards: string;
  experience: string;
  selfEvaluation: string;
  fileUrl: string;
}

/** Fields that count toward completeness */
const COMPLETENESS_FIELDS: (keyof ResumeData)[] = [
  'name', 'gender', 'age', 'phone', 'email',
  'major', 'grade', 'gpa', 'skills', 'projects',
  'awards', 'experience', 'selfEvaluation',
];

export default function Resume() {
  const [form, setForm] = useState<ResumeData>({
    name: '', gender: '', age: '', phone: '', email: '',
    major: '', grade: '', gpa: '', skills: '', projects: '',
    awards: '', experience: '', selfEvaluation: '', fileUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const data = await typedGet<ResumeType>('/resume/detail');
        if (data) {
          setForm({
            ...data,
            age: data.age?.toString() || '',
            gpa: data.gpa?.toString() || '',
          });
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('404')) {
          toast.error('加载简历失败：' + err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, []);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await typedPost('/resume/save', {
        ...form,
        age: form.age ? parseInt(form.age) : null,
        gpa: form.gpa ? parseFloat(form.gpa) : null,
      });
      toast.success('简历保存成功');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('文件大小不能超过5MB');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = await typedPost<string>('/file/upload', formData, {
        timeout: 60000,
      });
      updateField('fileUrl', url);
      toast.success('文件上传成功');
    } catch (err: any) {
      toast.error(err.message || '上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = () => {
    updateField('fileUrl', '');
    toast.success('已移除附件');
  };

  const handleAiOptimize = async () => {
    setAiOptimizing(true);
    setAiResult('');
    try {
      const result = await typedPost<string>('/resume/ai-optimize', { jobDescription });
      setAiResult(result || '优化完成');
    } catch (err: any) {
      toast.error(err.message || 'AI优化失败');
    } finally {
      setAiOptimizing(false);
    }
  };

  /** Calculate completeness percentage */
  const completeness = (() => {
    const filled = COMPLETENESS_FIELDS.filter((k) => {
      const v = form[k];
      return v !== undefined && v !== null && String(v).trim() !== '';
    }).length;
    return Math.round((filled / COMPLETENESS_FIELDS.length) * 100);
  })();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-[hsl(var(--primary))]" />
        <span className="text-muted-foreground text-sm" style={{fontFamily: 'var(--font-body)'}}>加载简历中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">

      {/* ========== Hero Header ========== */}
      <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,.3),transparent_32%),linear-gradient(135deg,#0f172a,#1e3a5f_55%,#3b82f6)] p-6 md:p-8 text-white shadow-2xl shadow-blue-900/20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/15 border-white/20 text-white rounded-full px-3 py-1">
              <FileCheck className="h-3.5 w-3.5 mr-1" /> Resume Builder
            </Badge>
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>我的简历</h1>
              <p className="mt-2 max-w-2xl text-sm text-blue-50/80" style={{fontFamily: 'var(--font-body)'}}>
                打造一份出色的简历，让企业看到你的实力。完善信息可大幅提升简历曝光率。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-6 mr-2">
              <div className="text-center">
                <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{completeness}%</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>完整度</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl text-white" style={{fontFamily: 'var(--font-display)'}}>{COMPLETENESS_FIELDS.filter(k => form[k]?.trim()).length}/{COMPLETENESS_FIELDS.length}</p>
                <p className="text-[11px] text-white/40" style={{fontFamily: 'var(--font-body)'}}>已填写</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setAiDialogOpen(true)}
              className="rounded-xl bg-white/15 text-white border border-white/20 hover:bg-white/25 gap-2"
            >
              <Sparkles className="h-4 w-4" />AI 优化
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-white text-blue-700 hover:bg-blue-50 gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? '保存中...' : '保存简历'}
            </Button>
          </div>
        </div>
      </section>

      {/* ========== Completeness Indicator ========== */}
      <Card className="rounded-xl border-[hsl(30_12%_92%)] card-lift bg-white">
        <CardContent className="py-4 px-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>简历完整度</span>
            </div>
            <span className="text-sm font-semibold text-[hsl(var(--primary))]" style={{fontFamily: 'var(--font-body)'}}>{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
          {completeness < 100 && (
            <p className="text-xs text-muted-foreground mt-2" style={{fontFamily: 'var(--font-body)'}}>
              <Lightbulb className="h-3 w-3 inline-block mr-1 -mt-0.5" />
              完善所有信息可大幅提升简历曝光率
            </p>
          )}
          {completeness === 100 && (
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1" style={{fontFamily: 'var(--font-body)'}}>
              <CheckCircle2 className="h-3 w-3" />
              太棒了！你的简历信息已经非常完整
            </p>
          )}
        </CardContent>
      </Card>

      {/* ========== Form Cards ========== */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Basic Info Card */}
        <Card className="rounded-xl border-[hsl(30_12%_92%)] card-lift bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2.5" style={{fontFamily: 'var(--font-display)'}}>
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.08)] to-[hsl(var(--accent)/0.06)] flex items-center justify-center border border-[hsl(var(--primary)/0.1)]">
                <User className="h-5 w-5 text-[hsl(var(--primary))]" />
              </span>
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                  <User className="h-3 w-3" />姓名
                </Label>
                <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                  <User className="h-3 w-3" />性别
                </Label>
                <Input value={form.gender} onChange={(e) => updateField('gender', e.target.value)} placeholder="男/女" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                  <User className="h-3 w-3" />年龄
                </Label>
                <Input type="number" value={form.age} onChange={(e) => updateField('age', e.target.value)} />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                  <GraduationCap className="h-3 w-3" />GPA
                </Label>
                <Input type="number" step="0.01" value={form.gpa} onChange={(e) => updateField('gpa', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                  <GraduationCap className="h-3 w-3" />专业
                </Label>
                <Input value={form.major} onChange={(e) => updateField('major', e.target.value)} />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                  <GraduationCap className="h-3 w-3" />年级
                </Label>
                <Input value={form.grade} onChange={(e) => updateField('grade', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                  <Phone className="h-3 w-3" />手机
                </Label>
                <Input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                  <Mail className="h-3 w-3" />邮箱
                </Label>
                <Input value={form.email} onChange={(e) => updateField('email', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Experience Card */}
        <Card className="rounded-xl border-[hsl(30_12%_92%)] card-lift bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2.5" style={{fontFamily: 'var(--font-display)'}}>
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.08)] to-[hsl(var(--primary)/0.06)] flex items-center justify-center border border-[hsl(var(--accent)/0.1)]">
                <Code className="h-5 w-5 text-[hsl(var(--accent))]" />
              </span>
              技能与经历
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                <Code className="h-3 w-3" />技能标签（逗号分隔）
              </Label>
              <Input value={form.skills} onChange={(e) => updateField('skills', e.target.value)} placeholder="Java, Python, React" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                <Briefcase className="h-3 w-3" />项目经验
              </Label>
              <Textarea value={form.projects} onChange={(e) => updateField('projects', e.target.value)} rows={3} />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                <Trophy className="h-3 w-3" />获奖经历
              </Label>
              <Textarea value={form.awards} onChange={(e) => updateField('awards', e.target.value)} rows={2} />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                <Briefcase className="h-3 w-3" />实习经历
              </Label>
              <Textarea value={form.experience} onChange={(e) => updateField('experience', e.target.value)} rows={2} />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5" style={{fontFamily: 'var(--font-body)'}}>
                <ClipboardList className="h-3 w-3" />自我评价
              </Label>
              <Textarea value={form.selfEvaluation} onChange={(e) => updateField('selfEvaluation', e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========== File Upload Card ========== */}
      <Card className="rounded-xl border-[hsl(30_12%_92%)] card-lift bg-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2.5" style={{fontFamily: 'var(--font-display)'}}>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.08)] to-[hsl(var(--accent)/0.06)] flex items-center justify-center border border-[hsl(var(--primary)/0.1)]">
              <FileUp className="h-5 w-5 text-[hsl(var(--primary))]" />
            </span>
            简历附件
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="resume-file-upload"
          />
          {!form.fileUrl ? (
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-[hsl(var(--primary)/0.4)] transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 text-[hsl(var(--primary))] mx-auto mb-2 animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2 group-hover:text-[hsl(var(--primary))] transition-colors" />
              )}
              <p className="text-sm font-medium" style={{fontFamily: 'var(--font-body)'}}>{uploading ? '文件上传中...' : '点击或拖拽上传简历附件'}</p>
              <p className="text-xs text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>支持 PDF、DOC、DOCX 格式，最大 5MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-emerald-50/80 rounded-xl border border-emerald-200/60">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-emerald-800 block" style={{fontFamily: 'var(--font-body)'}}>已上传附件</span>
                <a
                  href={getFileURL(form.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 underline truncate block mt-0.5"
                >
                  {form.fileUrl.split('/').pop() || '查看文件'}
                </a>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0 hover:bg-red-50" onClick={removeFile}>
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== AI Optimize Dialog ========== */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-lg p-0 max-h-[85vh] flex flex-col rounded-2xl overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] p-5 pb-4 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5" />
                AI 简历优化
              </DialogTitle>
            </DialogHeader>
            <p className="text-white/60 text-sm mt-1">输入目标岗位描述，AI 将为你量身定制简历优化建议</p>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                目标岗位描述
              </Label>
              <Textarea
                placeholder="粘贴目标岗位的职位描述，AI 将根据岗位要求优化你的简历..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="mt-1.5"
              />
            </div>
            <Button
              onClick={handleAiOptimize}
              disabled={aiOptimizing || !jobDescription.trim()}
              className="w-full gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] text-white shadow-md shadow-[hsl(var(--primary)/0.2)]"
            >
              {aiOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiOptimizing ? 'AI 分析中...' : '开始优化'}
            </Button>
            {aiResult && (
              <div className="rounded-xl border border-[hsl(var(--primary)/0.15)] bg-[hsl(var(--primary)/0.03)]">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[hsl(var(--primary)/0.06)] border-b border-[hsl(var(--primary)/0.1)]">
                  <Lightbulb className="h-4 w-4 text-[hsl(var(--accent))]" />
                  <h4 className="font-semibold text-sm">优化建议</h4>
                </div>
                <div className="p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiResult}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
