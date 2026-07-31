import axios, { type AxiosRequestConfig } from 'axios';
import type { ApiResponse } from './types';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Request interceptor - attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data.code === 200) {
      return data;
    }
    return Promise.reject(new Error(data.message || '请求失败'));
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const msg = error.response?.data?.message
      || error.response?.data?.error
      || (error.response?.status === 404 ? '接口不存在'
      : error.response?.status === 403 ? '无权限访问'
      : '网络错误');
    return Promise.reject(new Error(msg));
  }
);

export default api;

// ==================== 类型安全的 API 方法 ====================
// 以下方法直接返回 T 类型的数据，无需 (res as any).data

/**
 * 类型安全的 GET 请求
 * @returns 直接返回 data 字段的内容，类型为 T
 *
 * @example
 * // 旧写法（需要 as any）:
 * const res = await api.get('/job/list', { params });
 * const data = (res as any).data;
 *
 * // 新写法（类型安全）:
 * const data = await typedGet<PaginatedData<Job>>('/job/list', { params });
 */
export async function typedGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get(url, config);
  return (res as ApiResponse<T>).data;
}

/**
 * 类型安全的 POST 请求
 * @returns 直接返回 data 字段的内容，类型为 T
 */
export async function typedPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.post(url, data, config);
  return (res as ApiResponse<T>).data;
}

/**
 * 类型安全的 PUT 请求
 * @returns 直接返回 data 字段的内容，类型为 T
 */
export async function typedPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.put(url, data, config);
  return (res as ApiResponse<T>).data;
}

/**
 * 类型安全的 DELETE 请求
 * @returns 直接返回 data 字段的内容，类型为 T
 */
export async function typedDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.delete(url, config);
  return (res as ApiResponse<T>).data;
}
