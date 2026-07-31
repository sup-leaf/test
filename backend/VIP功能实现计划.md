# VIP 功能实现计划

> 基于立项书 S2 节 + 前端 VipPayment 页宣称的 6 项特权
> 当前状态：`memberLevel` 字段仅存储，无任何业务逻辑消费

---

## 一、所有可实现的 VIP 功能

| # | 功能 | 来源 | 说明 |
|:--:|------|:--:|------|
| 1 | VIP 简历在企业端优先展示 | 立项书 S2.2 | 企业查看投递列表时，VIP 学生的简历排在最前面 |
| 2 | VIP 岗位推荐（AI 匹配） | 立项书 S2.3 增强 | `/member/alerts` 改为基于学生专业/技能做匹配，而非简单取最新 3 条 |
| 3 | VIP 科研/竞赛提前解锁 | 立项书 S2.4 | 新发布的科研项目/竞赛招募对 VIP 提前 24 小时可见 |
| 4 | VIP 专属统计数据 | VipPayment 页"数据洞察" | 返回 VIP 专属统计：同专业岗位竞争比、平均薪资等 |
| 5 | VIP 投递上限提升 | 实用需求 | 普通学生每天投递上限 10 条，VIP 提升至 30 条 |
| 6 | VIP 面试反馈优先 | 用户体验 | 已录用/已拒绝的投递中，VIP 学生可查看 HR 的详细反馈备注 |

---

## 二、优先级排序

| 优先级 | 功能 | 理由 |
|:--:|------|------|
| **P0** | #1 VIP 简历优先展示 | 零 schema 改动，1 个方法修改，立即可见效果 |
| **P0** | #2 VIP 岗位推荐（匹配） | 增强已有端点，用户感知最强 |
| **P1** | #3 VIP 提前解锁 | 给 VIP 真实时间优势，但需加字段 |
| **P2** | #5 投递上限提升 | 保护企业不被海投轰炸，VIP 豁免 |
| **P2** | #4 专属统计数据 | 锦上添花 |
| **P3** | #6 面试反馈优先 | hrNote 字段已存在，但前端需配合 |

---

## 三、逐项实现计划

### P0-1：VIP 简历优先展示

**影响文件**：`DeliveryServiceImpl.java`（1 个方法）

`buildResult()` 在收集完所有投递后，VIP 学生的记录排在前面：

```java
// 在 return result 前插入
records.sort((a, b) -> {
    Object aGpa = a.get("studentGpa");
    Object bGpa = b.get("studentGpa");
    // 保持：VIP 排最前，GPA 高的优先
    // memberLevel 从 resumeInfo 关联查
});
```

需要从 `t_user` 获取 `memberLevel`，增加一次批量查询。

**对原有代码影响**：⭐（极低，仅改 1 个方法，加排序逻辑）

---

### P0-2：VIP 岗位推荐（技能匹配）

**影响文件**：`MemberController.java`（1 个端点）

将 `/member/alerts` 从"取最新 3 条岗位"改为"根据学生简历中的专业+技能匹配岗位"：

```java
// 当前：取最新 3 条
// 改为：取学生 resume 的 major + skills → 用 SkillMatcher 匹配 → 取匹配度最高的 3 条
```

可复用 `SkillMatcher.calculateMatchScore()`。

**对原有代码影响**：⭐（仅改 1 个端点逻辑，不新增文件）

---

### P1-3：VIP 提前解锁科研/竞赛

**影响文件**：3 个

| 文件 | 改动 |
|------|------|
| `ResearchProject.java` | 加 `visibleAfter` 字段（DATETIME，默认 NULL 即立即可见） |
| `ResearchProjectController.java` | 发布时对非 VIP 设置 `visibleAfter = now + 24h` |
| `ResearchServiceImpl.listProjects()` | 对非 VIP 用户过滤 `visibleAfter > now` 的记录 |

竞赛同理。

**需要 SQL**：`ALTER TABLE t_research_project ADD COLUMN visible_after DATETIME;`

**对原有代码影响**：⭐⭐（加字段 + 改 2-3 个查询）

---

### P2-5：投递上限提升

**影响文件**：`DeliveryController.java`（1 个端点）

在 `apply()` 方法中增加：
```java
// 查询今日投递次数
// 普通学生上限 10，VIP 上限 30
```

**对原有代码影响**：⭐（加几行判断，不改结构）

---

### P2-4：VIP 专属统计数据

**影响文件**：新增 1 个端点

`GET /api/member/stats` → 返回：
- 同专业岗位数量
- 同专业投递竞争比（投递数/岗位数）
- 平均薪资范围

**对原有代码影响**：⭐（新端点，不改现有文件）

---

### P3-6：面试反馈优先

**影响文件**：`DeliveryServiceImpl.java`

当投递状态为 3(已录用) 或 4(已拒绝) 时，VIP 学生查看自己的投递可看到详细的 hrNote。

**对原有代码影响**：⭐（hrNote 已有，仅加一个 if 判断）

---

## 四、影响总览

| 优先级 | 功能 | 改动文件数 | Schema 改动 | 工作量 |
|:--:|------|:--:|:--:|:--:|
| P0 | #1 简历优先展示 | 1 | 无 | 15 分钟 |
| P0 | #2 技能匹配推荐 | 1 | 无 | 20 分钟 |
| P1 | #3 提前解锁 | 5 | 2 个 ALTER | 1 小时 |
| P2 | #4 投递上限 | 1 | 无 | 15 分钟 |
| P2 | #5 专属统计 | 1(新) | 无 | 30 分钟 |
| P3 | #6 面试反馈 | 1 | 无 | 10 分钟 |

---

## 五、建议执行顺序

```
第 1 轮（今天）：P0-1 + P0-2
   简历排序 + 技能匹配推荐 → VIP 立刻有感知

第 2 轮：P1-3
   提前解锁 → VIP 有真实时间优势，价值感最强

第 3 轮：P2-4 + P2-5
   投递上限 + 专属统计 → 完善体验

第 4 轮：P3-6
   面试反馈 → 锦上添花
```
