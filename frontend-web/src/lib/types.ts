// ============================================================
// 共享类型定义 — BJTU 校园集市前端
// 所有业务实体和 API 响应类型统一定义在此文件
// ============================================================

// ==================== API 响应 ====================

/** 后端统一响应包装 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** 分页数据 */
export interface PaginatedData<T> {
  records: T[];
  total: number;
  pages?: number;
  current?: number;
}

// ==================== 用户 ====================

export interface User {
  id: number;
  username: string;
  userType: number; // 1-学生 2-企业 3-教师
  realName?: string;
  studentId?: string;
  campusCardNo?: string;
  companyName?: string;
  companyCode?: string;
  teacherNo?: string;
  phone?: string;
  email?: string;
  status: number; // 0-禁用 1-正常
  memberLevel?: number; // 0-免费 1-VIP
  cooperationType?: number; // 1-深度合作 2-校外普通
  createTime?: string;
  updateTime?: string;
}

// ==================== 岗位 ====================

export interface Job {
  id: number;
  title: string;
  description: string;
  requirement: string;
  skillTags: string;
  jobType: number; // 1-实习 2-全职 3-科研助理
  location: string;
  salaryMin: number;
  salaryMax: number;
  duration: number;
  publisherId: number;
  publisherType?: number;
  status: number;
  viewCount: number;
  deliveryCount: number;
  createTime: string;
  updateTime?: string;
}

// ==================== 投递 ====================

export interface Delivery {
  id: number;
  jobId: number;
  resumeId: number;
  jobPublisherId: number;
  status: number; // 0-待处理 1-已查看 2-面试邀请 3-已录用 4-已拒绝
  hrNote?: string;
  jobTitle?: string;
  companyName?: string;
  createTime: string;
  updateTime?: string;
}

export interface DeliveryReview {
  id: number;
  deliveryId: number;
  studentId: number;
  rating: number;
  review: string;
  createTime: string;
}

// ==================== 简历 ====================

export interface Resume {
  id?: number;
  userId?: number;
  name: string;
  gender: string;
  age?: number;
  phone: string;
  email: string;
  avatar?: string;
  major: string;
  grade: string;
  gpa?: number;
  skills: string;
  projects: string;
  awards: string;
  experience: string;
  selfEvaluation: string;
  fileUrl: string;
  status?: number; // 0-未完善 1-已完善
}

// ==================== 竞赛组队 ====================

export interface CompetitionTeam {
  id: number;
  title: string;
  competitionName: string;
  description: string;
  requirement: string;
  skillTags: string;
  maxMembers: number;
  currentMembers: number;
  leaderId: number;
  status: number; // 1-招募中 2-已结束/满员
  deadline: string;
  createTime: string;
  updateTime: string;
}

export interface TeamApplication {
  application: {
    id: number;
    teamId: number;
    studentId: number;
    status: number; // 0-待审核 1-已通过 2-已拒绝
    note: string;
    createTime: string;
    updateTime?: string;
  };
  teamTitle?: string;
  competitionName?: string;
  studentName?: string;
  studentId?: string;
  studentMajor?: string;
  phone?: string;
}

export interface TeamMessage {
  id: number;
  teamId: number;
  senderId: number;
  senderName?: string;
  content: string;
  createTime: string;
}

// ==================== 科研项目 ====================

export interface ResearchProject {
  id: number;
  title: string;
  description: string;
  requirement: string;
  background?: string;
  funding?: string;
  duration?: string;
  publisherId: number;
  status: number;
  createTime: string;
  updateTime?: string;
}

export interface ResearchApplication {
  id: number;
  projectId: number;
  studentId: number;
  status: number; // 0-待审核 1-已通过 2-已拒绝
  note: string;
  projectTitle?: string;
  studentName?: string;
  createTime: string;
  updateTime?: string;
}

// ==================== 实习 ====================

export interface Internship {
  id: number;
  studentId: number;
  resumeId?: number;
  jobId: number;
  deliveryId?: number;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  status: number; // 0-进行中 1-已完成 2-提前终止
  rating?: number;
  review?: string;
  createTime: string;
  updateTime?: string;
}

export interface InternshipLog {
  id: number;
  internshipId: number;
  weekNum: number;
  content: string;
  createTime: string;
}

export interface InternshipMessage {
  id: number;
  internshipId: number;
  senderId: number;
  senderName?: string;
  content: string;
  createTime: string;
}

export interface InternshipStudentReview {
  id: number;
  internshipId: number;
  studentId: number;
  rating: number;
  review: string;
  createTime: string;
}

// ==================== 通知 ====================

export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  relatedId: number;
  isRead: number;
  createTime: string;
}

// ==================== 爬虫 ====================

export interface CrawlHistory {
  id: number;
  source: string;
  status: number; // 0-进行中 1-成功 2-失败
  jobsFound: number;
  jobsAdded: number;
  errorMessage?: string;
  startTime: string;
  endTime?: string;
}

// ==================== 管理后台统计 ====================

export interface AdminOverview {
  studentCount: number;
  enterpriseCount: number;
  pendingEnterpriseCount?: number;
  jobCount: number;
  deliveryCountThisMonth: number;
  internshipRate: number;
  internshipTotal: number;
  internshipActive: number;
  warnings?: Array<{ major: string; rate: number; threshold: number }>;
}

export interface MajorStat {
  major: string;
  studentCount: number;
  acceptedCount: number;
  rate: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface TopEnterprise {
  rank?: number;
  name: string;
  jobCount: number;
  applicantCount: number;
}

export interface HotJob {
  rank?: number;
  title: string;
  company?: string;
  applicants: number;
}

export interface EnterpriseRating {
  name: string;
  avgRating: number;
  reviewCount: number;
}

export interface InternshipStats {
  totalInternships: number;
  activeInternships: number;
  majorDistribution?: Array<{
    major: string;
    count: number;
    avgRating?: number;
  }>;
  topCompanies?: Array<{ name: string; count: number }>;
}

// ==================== VIP / 个人中心 ====================

export interface TimelineEvent {
  id: number;
  type: string;
  title: string;
  description?: string;
  time: string;
}

export interface VipAlert {
  jobId: number;
  title: string;
  companyName?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  reason?: string;
}

// ==================== 地图 ====================

export interface CityJobData {
  city: string;
  lat: number | null;
  lng: number | null;
  count: number;
  jobs: Array<{ id: number; title: string; jobType: number }>;
}
