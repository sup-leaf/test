package com.bjtumarket.controller;

import com.bjtumarket.entity.User;
import com.bjtumarket.mapper.UserMapper;
import com.bjtumarket.vo.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;

@Api(tags = "用户模块")
@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController {

    @Autowired
    private UserMapper userMapper;

    @ApiOperation("获取当前用户个人资料")
    @GetMapping("/profile")
    public Result<User> getProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userMapper.selectById(userId);
        if (user == null) return Result.error("用户不存在");
        user.setPassword(null);
        return Result.success(user);
    }

    @ApiOperation("更新个人资料（realName/email/phone及角色字段）")
    @PostMapping("/profile/update")
    public Result<String> updateProfile(@RequestBody Map<String, String> form,
                                         HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userMapper.selectById(userId);
        if (user == null) return Result.error("用户不存在");

        if (form.containsKey("realName")) user.setRealName(form.get("realName"));
        if (form.containsKey("email")) user.setEmail(form.get("email"));
        if (form.containsKey("phone")) user.setPhone(form.get("phone"));

        Integer ut = user.getUserType();
        if (ut != null && ut == 1) {
            if (form.containsKey("studentId")) user.setStudentId(form.get("studentId"));
            if (form.containsKey("campusCardNo")) user.setCampusCardNo(form.get("campusCardNo"));
        } else if (ut != null && ut == 2) {
            if (form.containsKey("companyName")) user.setCompanyName(form.get("companyName"));
        } else if (ut != null && ut == 3) {
            if (form.containsKey("teacherNo")) user.setTeacherNo(form.get("teacherNo"));
        }

        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
        return Result.success("保存成功");
    }

    @ApiOperation("修改密码（需验证旧密码）")
    @PostMapping("/change-password")
    public Result<String> changePassword(@RequestBody Map<String, String> body,
                                          HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userMapper.selectById(userId);
        if (user == null) return Result.error("用户不存在");

        String oldPwd = body.get("oldPassword");
        String newPwd = body.get("newPassword");
        if (oldPwd == null || newPwd == null) return Result.error("参数不完整");

        String oldHash = DigestUtils.md5DigestAsHex(
            DigestUtils.md5DigestAsHex(oldPwd.getBytes(StandardCharsets.UTF_8)).getBytes(StandardCharsets.UTF_8));
        if (!oldHash.equals(user.getPassword())) return Result.error("旧密码错误");

        String newHash = DigestUtils.md5DigestAsHex(
            DigestUtils.md5DigestAsHex(newPwd.getBytes(StandardCharsets.UTF_8)).getBytes(StandardCharsets.UTF_8));
        user.setPassword(newHash);
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
        return Result.success("密码修改成功");
    }
}
