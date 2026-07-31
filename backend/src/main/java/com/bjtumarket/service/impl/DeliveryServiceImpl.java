package com.bjtumarket.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bjtumarket.entity.Delivery;
import com.bjtumarket.entity.Job;
import com.bjtumarket.entity.Resume;
import com.bjtumarket.entity.User;
import com.bjtumarket.mapper.DeliveryMapper;
import com.bjtumarket.mapper.UserMapper;
import com.bjtumarket.service.DeliveryService;
import com.bjtumarket.service.JobService;
import com.bjtumarket.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DeliveryServiceImpl extends ServiceImpl<DeliveryMapper, Delivery> implements DeliveryService {

    @Autowired
    private JobService jobService;

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private UserMapper userMapper;

    private static final int DAILY_LIMIT_NORMAL = 10;
    private static final int DAILY_LIMIT_VIP = 30;

    @Override
    @CacheEvict(value = "adminStats", allEntries = true, beforeInvocation = true)
    public boolean apply(Long jobId, Long userId) {
        Job job = jobService.getById(jobId);
        if (job == null) {
            return false;
        }
        Resume resume = resumeService.getResumeByUserId(userId);
        if (resume == null) {
            return false;
        }

        // VIP 投递上限检查
        long todayCount = this.lambdaQuery()
                .eq(Delivery::getResumeId, resume.getId())
                .ge(Delivery::getCreateTime, LocalDate.now().atStartOfDay())
                .count();
        User user = userMapper.selectById(userId);
        int limit = (user != null && user.getMemberLevel() != null && user.getMemberLevel() == 1)
                ? DAILY_LIMIT_VIP : DAILY_LIMIT_NORMAL;
        if (todayCount >= limit) {
            return false;
        }

        LambdaQueryWrapper<Delivery> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Delivery::getJobId, jobId).eq(Delivery::getResumeId, resume.getId());
        if (this.count(wrapper) > 0) {
            return false;
        }

        Delivery delivery = new Delivery();
        delivery.setJobId(jobId);
        delivery.setResumeId(resume.getId());
        delivery.setJobPublisherId(job.getPublisherId());
        delivery.setStatus(0);
        delivery.setCreateTime(LocalDateTime.now());
        delivery.setUpdateTime(LocalDateTime.now());

        job.setDeliveryCount(job.getDeliveryCount() + 1);
        jobService.updateById(job);

        return this.save(delivery);
    }

    @Override
    public Map<String, Object> getJobDeliveries(Long jobId, Integer page, Integer size,
                                                  Double gpaMin, String major, String skillTag) {
        Page<Delivery> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Delivery> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Delivery::getJobId, jobId)
                .orderByDesc(Delivery::getCreateTime);
        Page<Delivery> pageResult = this.page(pageParam, wrapper);
        return buildResult(pageResult, gpaMin, major, skillTag);
    }

    @Override
    public Map<String, Object> getMyDeliveries(Long userId, Integer page, Integer size) {
        Resume resume = resumeService.getResumeByUserId(userId);
        if (resume == null) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("records", Collections.emptyList());
            empty.put("total", 0L);
            return empty;
        }
        Page<Delivery> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Delivery> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Delivery::getResumeId, resume.getId())
                .orderByDesc(Delivery::getCreateTime);
        Page<Delivery> pageResult = this.page(pageParam, wrapper);
        return buildResult(pageResult, null, null, null);
    }

    @Override
    public Map<String, Object> getDeliveriesByPublisher(Long publisherId, Integer page, Integer size,
                                                         Double gpaMin, String major, String skillTag) {
        Page<Delivery> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Delivery> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Delivery::getJobPublisherId, publisherId)
                .orderByDesc(Delivery::getCreateTime);
        Page<Delivery> pageResult = this.page(pageParam, wrapper);
        return buildResult(pageResult, gpaMin, major, skillTag);
    }

    @Override
    @CacheEvict(value = "adminStats", allEntries = true, beforeInvocation = true)
    public boolean updateStatus(Long deliveryId, Long publisherId, Integer deliveryStatus, String note) {
        Delivery delivery = this.getById(deliveryId);
        if (delivery == null) {
            return false;
        }
        if (!delivery.getJobPublisherId().equals(publisherId)) {
            return false;
        }
        delivery.setStatus(deliveryStatus);
        if (StringUtils.hasText(note)) {
            delivery.setHrNote(note);
        }
        delivery.setUpdateTime(LocalDateTime.now());
        return this.updateById(delivery);
    }

    private Map<String, Object> buildResult(Page<Delivery> pageResult,
                                             Double gpaMin, String major, String skillTag) {
        List<Map<String, Object>> records = new ArrayList<>();
        Map<Long, String> jobTitleCache = new HashMap<>();
        Map<Long, Map<String, Object>> resumeCache = new HashMap<>();

        for (Delivery d : pageResult.getRecords()) {
            Map<String, Object> vo = new LinkedHashMap<>();
            vo.put("id", d.getId());
            vo.put("jobId", d.getJobId());
            vo.put("resumeId", d.getResumeId());
            vo.put("jobPublisherId", d.getJobPublisherId());
            vo.put("status", d.getStatus());
            vo.put("hrNote", d.getHrNote());
            vo.put("createTime", d.getCreateTime());
            vo.put("updateTime", d.getUpdateTime());

            String jobTitle = jobTitleCache.computeIfAbsent(d.getJobId(), jid -> {
                Job job = jobService.getById(jid);
                return job != null ? job.getTitle() : "";
            });
            vo.put("jobTitle", jobTitle);

            Map<String, Object> resumeInfo = resumeCache.computeIfAbsent(d.getResumeId(), rid -> {
                Resume r = resumeService.getById(rid);
                if (r == null) return Collections.emptyMap();
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("studentName", r.getName());
                m.put("studentMajor", r.getMajor());
                m.put("studentPhone", r.getPhone());
                m.put("studentEmail", r.getEmail());
                m.put("studentSkills", r.getSkills());
                m.put("studentAwards", r.getAwards());
                m.put("studentGrade", r.getGrade());
                m.put("studentGpa", r.getGpa());
                m.put("studentFileUrl", r.getFileUrl());
                return m;
            });
            vo.putAll(resumeInfo);

            if (!matchFilter(vo, gpaMin, major, skillTag)) {
                continue;
            }
            records.add(vo);
        }

        // VIP 简历优先排序
        if (!records.isEmpty()) {
            Set<Long> resumeIds = records.stream()
                    .map(r -> (Long) r.get("resumeId")).collect(Collectors.toSet());
            List<Resume> resumes = resumeService.listByIds(resumeIds);
            Map<Long, Long> resumeUserId = new HashMap<>();
            for (Resume r : resumes) {
                if (r != null && r.getUserId() != null) resumeUserId.put(r.getId(), r.getUserId());
            }
            Set<Long> userIds = new HashSet<>(resumeUserId.values());
            Map<Long, Integer> vipMap = new HashMap<>();
            if (!userIds.isEmpty()) {
                List<User> users = userMapper.selectBatchIds(userIds);
                for (User u : users) {
                    vipMap.put(u.getId(), (u.getMemberLevel() != null && u.getMemberLevel() == 1) ? 1 : 0);
                }
            }
            records.sort((a, b) -> {
                Long uidA = resumeUserId.get((Long) a.get("resumeId"));
                Long uidB = resumeUserId.get((Long) b.get("resumeId"));
                int va = uidA != null ? vipMap.getOrDefault(uidA, 0) : 0;
                int vb = uidB != null ? vipMap.getOrDefault(uidB, 0) : 0;
                return Integer.compare(vb, va);
            });
        }

        Map<String, Object> result = new HashMap<>();
        result.put("records", records);
        result.put("total", (long) records.size());
        return result;
    }

    private boolean matchFilter(Map<String, Object> vo, Double gpaMin, String major, String skillTag) {
        if (gpaMin != null) {
            Object gpaObj = vo.get("studentGpa");
            if (gpaObj == null) return false;
            double gpa = gpaObj instanceof Double ? (Double) gpaObj : 0;
            if (gpa < gpaMin) return false;
        }
        if (StringUtils.hasText(major)) {
            Object majorObj = vo.get("studentMajor");
            if (majorObj == null || !majorObj.toString().contains(major)) return false;
        }
        if (StringUtils.hasText(skillTag)) {
            Object skillsObj = vo.get("studentSkills");
            if (skillsObj == null || !skillsObj.toString().contains(skillTag)) return false;
        }
        return true;
    }
}
