package com.bjtumarket.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bjtumarket.entity.Delivery;
import com.bjtumarket.entity.Job;
import com.bjtumarket.entity.Resume;
import com.bjtumarket.entity.User;
import com.bjtumarket.mapper.DeliveryMapper;
import com.bjtumarket.mapper.UserMapper;
import com.bjtumarket.service.JobService;
import com.bjtumarket.service.ResumeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceImplTest {

    @Mock
    private DeliveryMapper deliveryMapper;
    @Mock
    private JobService jobService;
    @Mock
    private ResumeService resumeService;
    @Mock
    private UserMapper userMapper;

    private DeliveryServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new DeliveryServiceImpl();
        ReflectionTestUtils.setField(service, "baseMapper", deliveryMapper);
        ReflectionTestUtils.setField(service, "jobService", jobService);
        ReflectionTestUtils.setField(service, "resumeService", resumeService);
        ReflectionTestUtils.setField(service, "userMapper", userMapper);
    }

    @Test
    void apply_shouldRejectWhenNormalUserExceedsDailyLimit() {
        Long userId = 1L;
        when(jobService.getById(any())).thenReturn(mockJob());
        when(resumeService.getResumeByUserId(userId)).thenReturn(mockResume(userId));
        when(userMapper.selectById(userId)).thenReturn(mockUser(userId, 0));
        // 限制检查：今日 10 条，普通上限 10 → 达上限，直接拒绝（只调用 1 次 selectCount）
        when(deliveryMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(10L);

        assertFalse(service.apply(1L, userId));
    }

    @Test
    void apply_shouldAllowVipToExceedNormalLimit() {
        Long userId = 1L;
        when(jobService.getById(any())).thenReturn(mockJob());
        when(resumeService.getResumeByUserId(userId)).thenReturn(mockResume(userId));
        when(userMapper.selectById(userId)).thenReturn(mockUser(userId, 1));
        // 限制检查：10 条 < VIP上限 30 → 继续；查重：0 条 → 不重复 → 创建成功
        when(deliveryMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(10L, 0L);
        when(jobService.updateById(any())).thenReturn(true);
        when(deliveryMapper.insert(any(Delivery.class))).thenReturn(1);

        assertTrue(service.apply(1L, userId));
    }

    @Test
    void apply_shouldRejectWhenVipExceedsVipLimit() {
        Long userId = 1L;
        when(jobService.getById(any())).thenReturn(mockJob());
        when(resumeService.getResumeByUserId(userId)).thenReturn(mockResume(userId));
        when(userMapper.selectById(userId)).thenReturn(mockUser(userId, 1));
        // 限制检查：今日 30 条，VIP上限 30 → 达上限，直接拒绝
        when(deliveryMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(30L);

        assertFalse(service.apply(1L, userId));
    }

    private Job mockJob() {
        Job job = new Job();
        job.setId(1L);
        job.setPublisherId(100L);
        job.setDeliveryCount(0);
        return job;
    }

    private Resume mockResume(Long userId) {
        Resume resume = new Resume();
        resume.setId(1L);
        resume.setUserId(userId);
        return resume;
    }

    private User mockUser(Long userId, int memberLevel) {
        User user = new User();
        user.setId(userId);
        user.setMemberLevel(memberLevel);
        return user;
    }
}
