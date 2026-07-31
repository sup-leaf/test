package com.bjtumarket.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bjtumarket.entity.User;
import com.bjtumarket.mapper.UserMapper;
import com.bjtumarket.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public User login(String username, String password, Integer userType) {
        // 兼容双重 MD5（SQL 种子数据）和单次 MD5（旧注册用户）
        String doubleMd5 = DigestUtils.md5DigestAsHex(
            DigestUtils.md5DigestAsHex(password.getBytes(StandardCharsets.UTF_8)).getBytes(StandardCharsets.UTF_8)
        );
        String singleMd5 = DigestUtils.md5DigestAsHex(password.getBytes(StandardCharsets.UTF_8));

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username)
                .eq(User::getUserType, userType)
                .eq(User::getStatus, 1);
        // 先用双重 MD5 查，再用单次 MD5 查
        wrapper.and(w -> w.eq(User::getPassword, doubleMd5).or().eq(User::getPassword, singleMd5));
        return this.getOne(wrapper);
    }

    @Override
    public boolean register(User user) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, user.getUsername());
        if (this.count(wrapper) > 0) {
            return false;
        }
        // 单次 MD5（登录兼容双 MD5 验证旧密码）
        String md5Password = DigestUtils.md5DigestAsHex(
            user.getPassword().getBytes(StandardCharsets.UTF_8)
        );
        user.setPassword(md5Password);
        // S3: 深度合作企业自动审核通过
        if (user.getUserType() != null && user.getUserType() == 2) {
            boolean isDeepCooperation = user.getCooperationType() != null && user.getCooperationType() == 1;
            user.setStatus(isDeepCooperation ? 1 : 0);
        } else {
            user.setStatus(1);
        }
        if (user.getMemberLevel() == null) user.setMemberLevel(0);
        if (user.getCooperationType() == null) user.setCooperationType(2);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        return this.save(user);
    }
}