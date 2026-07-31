import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { typedGet } from '@/lib/api';
import { GraduationCap, Briefcase, Users, Search, Building2, Lightbulb, ArrowRight, ChevronRight } from 'lucide-react';

const features = [
  {
    icon: Briefcase,
    title: '智能岗位匹配',
    description: '基于 AI 算法，精准匹配学生能力与企业需求，让每位学生找到最适合的实习岗位。',
  },
  {
    icon: Building2,
    title: '企业人才库',
    description: '企业可发布实习岗位、浏览学生简历、管理招聘流程，高效构建校园人才储备。',
  },
  {
    icon: Lightbulb,
    title: '科研协作平台',
    description: '连接教师科研项目与学生创新团队，促进产学研深度融合，孵化高质量科研成果。',
  },
  {
    icon: Search,
    title: '精准搜索筛选',
    description: '支持多维度搜索与筛选，快速定位理想岗位、项目和人才，提升信息获取效率。',
  },
  {
    icon: Users,
    title: '竞赛组队',
    description: '学生可发布组队需求、寻找志同道合的队友，共同参与各类学科竞赛与创新项目。',
  },
  {
    icon: GraduationCap,
    title: '全流程管理',
    description: '从投递到录用，从实习到考核，全链路数字化管理，让校园到职场的过渡更加顺畅。',
  },
];

const stats = [
  { value: '500+', label: '合作企业', key: 'enterpriseCount' },
  { value: '2,000+', label: '在校学生', key: 'userCount' },
  { value: '500+', label: '在招岗位', key: 'jobCount' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number | null>>({userCount: null, jobCount: null, enterpriseCount: null});

  useEffect(() => {
    typedGet<Record<string, number>>('/public/stats')
        .then(d => setCounts(prev => ({ ...prev, ...d })))
        .catch(e => console.error('Landing stats failed:', e));
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="dark">
      <style>{`
        @keyframes float-1 { 0%,100% { transform: translate(0,0); } 25% { transform: translate(40px,-60px); } 50% { transform: translate(80px,30px); } 75% { transform: translate(-30px,-40px); } }
        @keyframes float-2 { 0%,100% { transform: translate(0,0); } 25% { transform: translate(-50px,40px); } 50% { transform: translate(-100px,-20px); } 75% { transform: translate(30px,50px); } }
        @keyframes float-3 { 0%,100% { transform: translate(0,0); } 25% { transform: translate(60px,30px); } 50% { transform: translate(-40px,-60px); } 75% { transform: translate(50px,-10px); } }
        @keyframes float-4 { 0%,100% { transform: translate(0,0); } 25% { transform: translate(-30px,-50px); } 50% { transform: translate(50px,40px); } 75% { transform: translate(-60px,20px); } }
        @keyframes float-5 { 0%,100% { transform: translate(0,0); } 25% { transform: translate(20px,60px); } 50% { transform: translate(-70px,-30px); } 75% { transform: translate(40px,-50px); } }
        .blob { position: fixed; border-radius: 50%; pointer-events: none; filter: blur(80px); opacity: 0.3; will-change: transform; }
      `}</style>

      {/* Floating gradient blobs - fixed background across entire page */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="blob h-[350px] w-[350px]" style={{ left: '2%', top: '5%', background: 'linear-gradient(#1845ad, #23a2f6)', animation: 'float-1 14s ease-in-out infinite' }} />
        <div className="blob h-[300px] w-[300px]" style={{ right: '5%', bottom: '10%', background: 'linear-gradient(to right, #ff512f, #f09819)', animation: 'float-2 16s ease-in-out infinite' }} />
        <div className="blob h-[250px] w-[250px]" style={{ left: '35%', top: '30%', background: 'linear-gradient(#a855f7, #6366f1)', animation: 'float-3 12s ease-in-out infinite' }} />
        <div className="blob h-[200px] w-[200px]" style={{ right: '20%', top: '15%', background: 'linear-gradient(#f43f5e, #e11d48)', animation: 'float-4 18s ease-in-out infinite' }} />
        <div className="blob h-[220px] w-[220px]" style={{ left: '10%', bottom: '25%', background: 'linear-gradient(#06b6d4, #0ea5e9)', animation: 'float-5 15s ease-in-out infinite' }} />
      </div>

      {/* Entire landing page in dark mode */}
      <div className="min-h-screen bg-background text-foreground">
        {/* ========== NAVBAR ========== */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight">校园集市</span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground"
                onClick={() => navigate('/login')}
              >
                登录
              </Button>
              <Button
                className="text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[0px]"
                onClick={() => navigate('/register')}
              >
                立即注册
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </nav>
        </header>

        {/* ========== HERO ========== */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
          {/* Grid pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              校内一体化人才供需与科创协作平台
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              连接校园与职场
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                成就每一个梦想
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              校园集市致力于搭建学生、企业与学校的三方桥梁，提供实习就业、科研协作、竞赛组队等一站式服务，助力每一位学子扬帆起航。
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 w-full min-w-[180px] rounded-xl px-8 text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
                onClick={() => navigate('/register')}
              >
                立即开始
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full min-w-[180px] rounded-xl border-white/10 bg-white/5 px-8 text-base font-medium text-foreground/80 backdrop-blur-sm transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/10 hover:text-foreground sm:w-auto"
                onClick={scrollToFeatures}
              >
                了解更多
              </Button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1">
              <div className="h-2 w-1.5 rounded-full bg-white/40" />
            </div>
          </div>
        </section>

        {/* ========== FEATURES ========== */}
        <section id="features" className="relative px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            {/* Section header */}
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                一站式平台，全方位服务
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                覆盖实习就业、科研协作、竞赛组队等核心场景，为校园人才生态提供完整解决方案。
              </p>
            </div>

            {/* Feature cards grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-xl border border-white/5 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========== STATS ========== */}
        <section className="relative px-6 py-24 sm:py-32">
          {/* Divider line */}
          <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                平台数据
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                不断增长的数字背后，是越来越多的信任与选择。
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="group rounded-xl border border-white/5 bg-card p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
                >
                  <div className="mb-2 text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
                    {counts[stat.key] != null ? (counts[stat.key]! >= 1000 ? (counts[stat.key]!/1000).toFixed(1) + 'K+' : counts[stat.key] + '+') : stat.value}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CTA ========== */}
        <section className="relative px-6 py-24 sm:py-32">
          <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
              准备好开启你的校园之旅了吗？
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
              立即注册，解锁实习就业、科研协作、竞赛组队等全部功能。
            </p>
            <Button
              size="lg"
              className="h-12 rounded-xl px-10 text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/30"
              onClick={() => navigate('/register')}
            >
              免费注册
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* ========== FOOTER ========== */}
        <footer className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-bold tracking-tight">校园集市</span>
              </div>
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} 校园集市. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
