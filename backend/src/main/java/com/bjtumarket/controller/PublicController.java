package com.bjtumarket.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bjtumarket.entity.Job;
import com.bjtumarket.mapper.InternshipMapper;
import com.bjtumarket.mapper.JobMapper;
import com.bjtumarket.mapper.UserMapper;
import com.bjtumarket.vo.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Api(tags = "公开接口")
@RestController
@RequestMapping("/api/public")
@CrossOrigin
public class PublicController {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JobMapper jobMapper;

    @Autowired
    private InternshipMapper internshipMapper;

    @ApiOperation("平台公开统计数据（免登录）")
    @GetMapping("/stats")
    @Cacheable(value = "publicStats", key = "'overview'")
    public Result<Map<String, Object>> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userCount", userMapper.countStudents());
        result.put("enterpriseCount", userMapper.countApprovedEnterprises());
        result.put("jobCount", jobMapper.countActiveJobs());
        result.put("internshipCount", internshipMapper.countAll());

        List<Job> recentJobs = jobMapper.selectList(
            new LambdaQueryWrapper<Job>()
                .eq(Job::getStatus, 1)
                .ge(Job::getCreateTime, java.time.LocalDateTime.now().withHour(0).withMinute(0).withSecond(0))
                .orderByDesc(Job::getCreateTime)
                .last("LIMIT 3"));
        result.put("todayJobCount", recentJobs.size());
        result.put("recentJobs", recentJobs.stream().map(j -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", j.getTitle());
            m.put("location", j.getLocation());
            return m;
        }).collect(Collectors.toList()));

        return Result.success(result);
    }
}
