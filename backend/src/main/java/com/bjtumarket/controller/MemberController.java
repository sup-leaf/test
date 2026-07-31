package com.bjtumarket.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bjtumarket.entity.Delivery;
import com.bjtumarket.entity.Job;
import com.bjtumarket.entity.Resume;
import com.bjtumarket.entity.User;
import com.bjtumarket.mapper.DeliveryMapper;
import com.bjtumarket.service.JobService;
import com.bjtumarket.service.ResumeService;
import com.bjtumarket.service.UserService;
import com.bjtumarket.util.SkillMatcher;
import com.bjtumarket.vo.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Api(tags = "会员模块")
@RestController
@RequestMapping("/api/member")
@CrossOrigin
public class MemberController {

    @Autowired
    private JobService jobService;

    @Autowired
    private UserService userService;

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private DeliveryMapper deliveryMapper;

    @ApiOperation("VIP专属提醒：根据简历技能匹配的岗位推荐")
    @GetMapping("/alerts")
    public Result<Map<String, Object>> vipAlerts(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Integer userType = (Integer) request.getAttribute("userType");
        if (userType == null || userType != 1) return Result.error(403, "仅学生可用");

        Map<String, Object> result = new HashMap<>();

        Resume resume = resumeService.getResumeByUserId(userId);
        String skills = resume != null ? resume.getSkills() : "";
        String major = resume != null ? resume.getMajor() : "";

        LambdaQueryWrapper<Job> w = new LambdaQueryWrapper<>();
        w.eq(Job::getStatus, 1).orderByDesc(Job::getCreateTime);
        List<Job> allJobs = jobService.list(w);

        if (resume != null && (StringUtils.hasText(skills) || StringUtils.hasText(major))) {
            List<Map<String, Object>> scored = new ArrayList<>();
            for (Job job : allJobs) {
                double score = SkillMatcher.calculateMatchScore(skills,
                        job.getSkillTags() != null ? job.getSkillTags() : "");
                if (StringUtils.hasText(major) && StringUtils.hasText(job.getRequirement())
                        && job.getRequirement().contains(major)) {
                    score += 20;
                }
                Map<String, Object> m = new HashMap<>();
                m.put("job", job);
                m.put("score", score);
                scored.add(m);
            }
            scored.sort((a, b) -> Double.compare((double) b.get("score"), (double) a.get("score")));
            result.put("latestJobs", scored.stream().limit(3).map(s -> s.get("job")).collect(Collectors.toList()));
        } else {
            result.put("latestJobs", allJobs.stream().limit(3).collect(Collectors.toList()));
        }

        return Result.success(result);
    }

    @ApiOperation("VIP专属统计：同专业岗位数、竞争比等数据洞察")
    @GetMapping("/stats")
    public Result<Map<String, Object>> vipStats(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Integer userType = (Integer) request.getAttribute("userType");
        if (userType == null || userType != 1) return Result.error(403, "仅学生可用");

        Map<String, Object> result = new HashMap<>();

        Resume resume = resumeService.getResumeByUserId(userId);
        String major = resume != null ? resume.getMajor() : "";

        // 同专业岗位数
        long majorJobCount = 0;
        if (StringUtils.hasText(major)) {
            majorJobCount = jobService.lambdaQuery()
                    .eq(Job::getStatus, 1)
                    .like(Job::getRequirement, major)
                    .count();
        }

        // 全部活跃岗位
        long totalJobs = jobService.lambdaQuery().eq(Job::getStatus, 1).count();

        // 今日投递总数
        long todayDeliveries = deliveryMapper.selectCount(
            new LambdaQueryWrapper<Delivery>()
                .ge(Delivery::getCreateTime, LocalDate.now().atStartOfDay()));

        // 竞争比
        double ratio = totalJobs > 0 ? (double) todayDeliveries / totalJobs : 0;

        result.put("major", major);
        result.put("totalJobs", totalJobs);
        result.put("majorJobCount", majorJobCount);
        result.put("todayDeliveries", todayDeliveries);
        result.put("competitionRatio", Math.round(ratio * 100.0) / 100.0);

        return Result.success(result);
    }

    @ApiOperation("查询当前用户会员等级")
    @GetMapping("/level")
    public Result<Map<String, Object>> myLevel(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userService.getById(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("memberLevel", user != null ? user.getMemberLevel() : 0);
        return Result.success(result);
    }

    @ApiOperation("切换会员等级（0免费↔1VIP，测试用）")
    @PutMapping("/toggle")
    public Result<Map<String, Object>> toggleVip(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Integer userType = (Integer) request.getAttribute("userType");
        if (userType == null || userType != 1) return Result.error(403, "仅学生可用");
        User user = userService.getById(userId);
        if (user == null) return Result.error("用户不存在");
        int newLevel = (user.getMemberLevel() == null || user.getMemberLevel() == 0) ? 1 : 0;
        user.setMemberLevel(newLevel);
        userService.updateById(user);
        Map<String, Object> result = new HashMap<>();
        result.put("memberLevel", newLevel);
        result.put("message", newLevel == 1 ? "已升级为VIP" : "已降为普通用户");
        return Result.success(result);
    }
}
