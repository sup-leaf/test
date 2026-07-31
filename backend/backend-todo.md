# 后端待开发功能清单

## 1. 公开统计接口（高优先级）

**需求：** 首页、登录页展示平台统计数据，当前硬编码。

```
GET /api/public/stats
```

**返回：**
```json
{
  "userCount": 2000,
  "jobCount": 500,
  "enterpriseCount": 100,
  "internshipCount": 300
}
```

**实现：**
- 新建 `PublicController.java`
- 路径加入 `InterceptorConfig.excludePathPatterns`（免登录）
- 从 `AdminServiceImpl.statsOverview()` 复用统计逻辑
- 建议 Redis 缓存 5 分钟

**涉及页面：** `Welcome.tsx`、`Login.tsx`、`Landing.tsx`

---

## 2. 忘记密码（中优先级）

**需求：** 用户忘记密码时通过邮箱重置。

**发送重置邮件：**
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
```

**重置密码：**
```
POST /api/auth/reset-password
Body: { "token": "xxx", "newPassword": "encrypted" }
```

**实现：**
- `AuthController` 新增接口
- 生成带时效 Token（Redis 存储，30 分钟过期）
- 校验邮箱是否已注册（不暴露是否存在）

**涉及页面：** `ForgotPassword.tsx`

---

## 3. 修改密码（低优先级）

**需求：** 用户在个人设置页修改密码。

```
POST /api/user/change-password
Body: { "oldPassword": "encrypted", "newPassword": "encrypted" }
```

**涉及页面：** `Profile.tsx` — "修改密码"按钮
