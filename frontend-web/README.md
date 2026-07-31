# 校园集市 - 前端

> 校内一体化人才供需与科创协作平台

## 技术栈

- **框架**：React 18 + TypeScript
- **构建**：Vite
- **样式**：Tailwind CSS + shadcn/ui 组件库
- **路由**：React Router v6
- **HTTP 请求**：Axios
- **图表**：Recharts
- **图标**：Lucide React
- **通知**：Sonner

## 快速开始

### 环境要求

- Node.js >= 18

- npm >= 9

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── Layout.tsx       # 主布局（侧边栏 + 内容区）
│   └── ui/              # shadcn/ui 基础组件
├── hooks/               # 自定义 Hooks
├── lib/                 # 工具库
│   ├── api.ts           # Axios 实例及拦截器
│   ├── auth.tsx         # 认证相关（登录状态、用户信息）
│   ├── config.ts        # 运行时配置
│   └── utils.ts         # 通用工具函数
├── pages/               # 页面组件
│   ├── Login.tsx        # 登录页
│   ├── Register.tsx     # 注册页
│   ├── student/         # 学生端页面
│   ├── enterprise/      # 企业端页面
│   └── admin/           # 管理端页面
├── App.tsx              # 路由配置
├── main.tsx             # 入口文件
└── index.css            # 全局样式
```

## 功能模块

### 学生端

| 页面 | 路径 | 功能 |
|---|---|---|
| 岗位广场 | `/jobs` | 浏览、搜索岗位，按类型筛选 |
| 岗位详情 | `/jobs/:id` | 查看岗位详情，一键投递 |
| 岗位地图 | `/job-map` | 按城市查看岗位分布 |
| 我的投递 | `/my-deliveries` | 查看投递记录和状态 |
| 我的简历 | `/resume` | 编辑个人信息、技能经历，上传简历附件，AI 优化 |
| 科研项目 | `/research` | 浏览科研项目，申请加入 |
| 竞赛组队 | `/competition` | 发布组队招募、申请加入、管理申请 |
| 我的实习 | `/my-internships` | 查看实习记录，提交周日志，下载证明 |
| 个人中心 | `/profile` | 个人统计、成长时间线、VIP 会员管理 |

### 企业端

| 页面 | 路径 | 功能 |
|---|---|---|
| 我的岗位 | `/my-jobs` | 发布、编辑、删除岗位，查看详情 |
| 收到的投递 | `/received-deliveries` | 查看申请人详情，筛选，更新状态 |
| 实习生管理 | `/my-interns` | 查看实习生，评分，消息沟通 |

### 管理端（教师）

| 页面 | 路径 | 功能 |
|---|---|---|
| 数据大屏 | `/dashboard` | 概览统计、趋势图表、排行榜 |
| 企业审核 | `/enterprise-audit` | 审核企业注册申请 |
| 科研项目 | `/research-manage` | 发布、编辑科研项目，审核申请 |
| 用户管理 | `/user-manage` | 查看用户列表，启用/禁用用户 |
| 爬虫管理 | `/crawler-manage` | 触发爬虫、查看爬取历史 |

### 公共页面

| 页面 | 路径 | 功能 |
|---|---|---|
| 登录 | `/login` | 支持学生/企业/教师三种角色登录 |
| 注册 | `/register` | 按角色注册账号 |
| 证书验证 | `/certificate/verify/:id` | 验证实习证明真伪（无需登录） |

## 用户角色

| 角色 | userType | 说明 |
|---|---|---|
| 学生 | `1` | 浏览岗位、投递、管理简历、参与科研、竞赛组队、实习 |
| 企业 | `2` | 发布岗位、查看投递、管理实习生 |
| 教师 | `3` | 数据统计、企业审核、科研管理、用户管理 |

## 认证机制

- 登录后将 JWT Token 存储在 `localStorage`
- Axios 请求拦截器自动在请求头中添加 `Authorization: Bearer <token>`
- 响应拦截器处理 401 自动跳转登录页
- 路由守卫 `ProtectedRoute` 和 `RoleRoute` 控制页面访问权限

## 配置说明

### 环境变量

创建 `.env` 文件配置后端地址：

```
VITE_API_BASE_URL=http://localhost:8080
```

### 运行时配置

支持通过 `/api/config` 接口动态加载配置，适用于部署环境。

## 后端接口

前端对接后端 Spring Boot API，主要模块：

- `/api/auth/*` - 认证（登录、注册）
- `/api/job/*` - 岗位管理
- `/api/delivery/*` - 投递管理
- `/api/resume/*` - 简历管理
- `/api/file/*` - 文件上传
- `/api/internship/*` - 实习管理（含证书验证）
- `/api/research/*` - 科研项目
- `/api/competition/*` - 竞赛组队
- `/api/admin/*` - 管理后台（含爬虫管理）
- `/api/notification/*` - 消息通知
- `/api/member/*` - 会员管理
- `/api/profile/*` - 个人中心

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90
