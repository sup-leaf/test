import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getAPIBaseURL } from './config';

// ==================== CSS 类名合并 ====================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==================== 日期时间格式化 ====================

/**
 * 格式化时间为 "YYYY-MM-DD HH:mm" 格式
 * 13 个文件中重复定义的同名函数的统一版本
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '-';
  return time.replace('T', ' ').slice(0, 16);
}

/**
 * 格式化日期为 "YYYY-MM-DD" 格式
 */
export function formatDate(time: string | null | undefined): string {
  if (!time) return '-';
  return time.slice(0, 10);
}

// ==================== 文件 URL 处理 ====================

/**
 * 将相对文件路径转为完整 URL
 * 原本仅在 ReceivedDeliveries.tsx 中定义，现提取为全局工具
 */
export function getFileURL(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return getAPIBaseURL().replace('/api', '') + url;
}

// ==================== 薪资格式化 ====================

/**
 * 格式化薪资范围
 * 原本在 JobDetail/MyJobs/Profile 中各自实现
 */
export function formatSalary(min?: number | null, max?: number | null): string {
  if (min && max) return `${min}-${max}元`;
  if (min) return `${min}元起`;
  if (max) return `最高${max}元`;
  return '';
}

// ==================== 评分显示 ====================

/**
 * 生成星级显示字符串
 */
export function formatRating(rating: number | null | undefined): string {
  if (!rating || rating <= 0) return '';
  return '⭐'.repeat(Math.min(5, Math.max(1, rating)));
}
