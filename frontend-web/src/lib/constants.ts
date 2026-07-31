// ============================================================
// 共享业务常量 — BJTU 校园集市前端
// 所有业务枚举、状态映射、类型映射统一定义在此文件
// ============================================================

// ==================== 类型定义 ====================

export interface StatusBadge {
  label: string;
  color: string;
}

// ==================== 用户类型 ====================

export const USER_TYPE = {
  STUDENT: 1,
  ENTERPRISE: 2,
  TEACHER: 3,
} as const;

export const USER_TYPE_MAP: Record<number, string> = {
  [USER_TYPE.STUDENT]: '学生',
  [USER_TYPE.ENTERPRISE]: '企业',
  [USER_TYPE.TEACHER]: '教师',
};

export const getUserTypeLabel = (userType: number): string =>
  USER_TYPE_MAP[userType] || '未知';

// ==================== 岗位类型 ====================

export const JOB_TYPE = {
  INTERN: 1,
  FULLTIME: 2,
  RESEARCH_ASSISTANT: 3,
} as const;

export const JOB_TYPE_MAP: Record<number, string> = {
  [JOB_TYPE.INTERN]: '实习',
  [JOB_TYPE.FULLTIME]: '全职',
  [JOB_TYPE.RESEARCH_ASSISTANT]: '科研助理',
};

export const JOB_TYPE_COLORS: Record<number, string> = {
  [JOB_TYPE.INTERN]: 'bg-green-100 text-green-800',
  [JOB_TYPE.FULLTIME]: 'bg-blue-100 text-blue-800',
  [JOB_TYPE.RESEARCH_ASSISTANT]: 'bg-teal-100 text-teal-800',
};

export const DEFAULT_JOB_TYPE_COLOR = 'bg-gray-100 text-gray-800';

// ==================== 投递状态 ====================

export const DELIVERY_STATUS = {
  PENDING: 0,
  VIEWED: 1,
  INTERVIEW: 2,
  ACCEPTED: 3,
  REJECTED: 4,
} as const;

export const DELIVERY_STATUS_MAP: Record<number, StatusBadge> = {
  [DELIVERY_STATUS.PENDING]: { label: '待处理', color: 'bg-yellow-100 text-yellow-800' },
  [DELIVERY_STATUS.VIEWED]: { label: '已查看', color: 'bg-blue-100 text-blue-800' },
  [DELIVERY_STATUS.INTERVIEW]: { label: '面试邀请', color: 'bg-purple-100 text-purple-800' },
  [DELIVERY_STATUS.ACCEPTED]: { label: '已录用', color: 'bg-green-100 text-green-800' },
  [DELIVERY_STATUS.REJECTED]: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
};

export const DEFAULT_DELIVERY_STATUS: StatusBadge = {
  label: '未知',
  color: 'bg-gray-100 text-gray-800',
};

// ==================== 审核状态（通用） ====================

export const AUDIT_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const;

export const AUDIT_STATUS_MAP: Record<number, StatusBadge> = {
  [AUDIT_STATUS.PENDING]: { label: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  [AUDIT_STATUS.APPROVED]: { label: '已通过', color: 'bg-green-100 text-green-800' },
  [AUDIT_STATUS.REJECTED]: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
};

export const DEFAULT_AUDIT_STATUS: StatusBadge = {
  label: '未知',
  color: 'bg-gray-100 text-gray-800',
};

// ==================== 实习状态 ====================

export const INTERNSHIP_STATUS = {
  ACTIVE: 0,
  COMPLETED: 1,
  TERMINATED: 2,
} as const;

export const INTERNSHIP_STATUS_MAP: Record<number, StatusBadge> = {
  [INTERNSHIP_STATUS.ACTIVE]: { label: '进行中', color: 'bg-blue-100 text-blue-800' },
  [INTERNSHIP_STATUS.COMPLETED]: { label: '已完成', color: 'bg-green-100 text-green-800' },
  [INTERNSHIP_STATUS.TERMINATED]: { label: '提前终止', color: 'bg-red-100 text-red-800' },
};

export const DEFAULT_INTERNSHIP_STATUS: StatusBadge = {
  label: '未知',
  color: 'bg-gray-100 text-gray-800',
};

// ==================== 竞赛队伍状态 ====================

export const TEAM_STATUS = {
  RECRUITING: 1,
  CLOSED: 2,
} as const;

export const TEAM_STATUS_MAP: Record<number, StatusBadge> = {
  [TEAM_STATUS.RECRUITING]: { label: '招募中', color: 'bg-green-50 text-green-600 border border-green-200' },
  [TEAM_STATUS.CLOSED]: { label: '已结束', color: 'bg-gray-50 text-gray-500 border border-gray-200' },
};

// ==================== 企业状态 ====================

export const ENTERPRISE_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const;

export const ENTERPRISE_STATUS_MAP: Record<number, StatusBadge> = {
  [ENTERPRISE_STATUS.PENDING]: { label: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  [ENTERPRISE_STATUS.APPROVED]: { label: '已通过', color: 'bg-green-100 text-green-800' },
  [ENTERPRISE_STATUS.REJECTED]: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
};

// ==================== 用户状态 ====================

export const USER_STATUS = {
  ENABLED: 1,
  DISABLED: 2,
} as const;

export const USER_STATUS_MAP: Record<number, StatusBadge> = {
  [USER_STATUS.ENABLED]: { label: '正常', color: 'bg-green-100 text-green-800' },
  [USER_STATUS.DISABLED]: { label: '已禁用', color: 'bg-red-100 text-red-800' },
};

// ==================== 爬虫状态 ====================

export const CRAWL_STATUS = {
  RUNNING: 0,
  SUCCESS: 1,
  FAILED: 2,
} as const;

export const CRAWL_STATUS_MAP: Record<number, StatusBadge> = {
  [CRAWL_STATUS.RUNNING]: { label: '进行中', color: 'bg-blue-100 text-blue-800' },
  [CRAWL_STATUS.SUCCESS]: { label: '成功', color: 'bg-green-100 text-green-800' },
  [CRAWL_STATUS.FAILED]: { label: '失败', color: 'bg-red-100 text-red-800' },
};

// ==================== 通用默认值 ====================

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const NOTIFICATION_POLL_INTERVAL = 30000; // 30s
