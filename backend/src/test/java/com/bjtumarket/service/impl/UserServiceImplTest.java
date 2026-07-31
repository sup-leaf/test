package com.bjtumarket.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bjtumarket.entity.User;
import com.bjtumarket.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserMapper userMapper;

    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl();
        // 通过反射注入 mock 的 baseMapper（MyBatis-Plus ServiceImpl 中为 protected 字段）
        ReflectionTestUtils.setField(userService, "baseMapper", userMapper);
    }

    @Test
    void login_shouldReturnUserWhenCredentialsMatch() {
        String username = "testuser";
        String password = "password123";
        Integer userType = 1;
        String md5Password = DigestUtils.md5DigestAsHex(password.getBytes(StandardCharsets.UTF_8));

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername(username);
        mockUser.setPassword(md5Password);
        mockUser.setUserType(userType);
        mockUser.setStatus(1);

        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(mockUser);

        User result = userService.login(username, password, userType);

        assertNotNull(result);
        assertEquals(username, result.getUsername());
        assertEquals(userType, result.getUserType());
        verify(userMapper, times(1)).selectOne(any(LambdaQueryWrapper.class));
    }

    @Test
    void login_shouldReturnNullWhenPasswordWrong() {
        String username = "testuser";
        String password = "wrongpassword";
        Integer userType = 1;

        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

        User result = userService.login(username, password, userType);
        assertNull(result);
    }

    @Test
    void login_shouldReturnNullWhenUserDisabled() {
        String username = "disableduser";
        String password = "password123";
        Integer userType = 1;

        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

        User result = userService.login(username, password, userType);
        assertNull(result);
    }

    @Test
    void register_shouldSucceedWhenUsernameNotTaken() {
        User user = new User();
        user.setUsername("newuser");
        user.setPassword("password123");
        user.setUserType(1);

        when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(userMapper.insert(any(User.class))).thenReturn(1);

        boolean result = userService.register(user);
        assertTrue(result);
        verify(userMapper, times(1)).insert(any(User.class));
    }

    @Test
    void register_shouldFailWhenUsernameExists() {
        User user = new User();
        user.setUsername("existinguser");
        user.setPassword("password123");
        user.setUserType(1);

        when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

        boolean result = userService.register(user);
        assertFalse(result);
        verify(userMapper, never()).insert(any());
    }

    @Test
    void register_shouldEncryptPassword() {
        User user = new User();
        user.setUsername("newuser");
        user.setPassword("plaintext123");
        user.setUserType(1);

        when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(userMapper.insert(any(User.class))).thenReturn(1);

        userService.register(user);

        // Verify password was MD5 encrypted
        String expectedMd5 = DigestUtils.md5DigestAsHex("plaintext123".getBytes(StandardCharsets.UTF_8));
        assertEquals(expectedMd5, user.getPassword());
        assertNotEquals("plaintext123", user.getPassword());
    }

    @Test
    void register_shouldAutoApproveDeepCooperationEnterprise() {
        User user = new User();
        user.setUsername("deepcoop");
        user.setPassword("password123");
        user.setUserType(2); // 企业
        user.setCooperationType(1); // 深度合作

        when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(userMapper.insert(any(User.class))).thenReturn(1);

        userService.register(user);
        assertEquals(1, user.getStatus()); // 自动审核通过
    }

    @Test
    void register_shouldNotAutoApproveRegularEnterprise() {
        User user = new User();
        user.setUsername("normalcoop");
        user.setPassword("password123");
        user.setUserType(2); // 企业
        user.setCooperationType(2); // 校外普通

        when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(userMapper.insert(any(User.class))).thenReturn(1);

        userService.register(user);
        assertEquals(0, user.getStatus()); // 需要审核
    }

    @Test
    void register_shouldSetDefaultValues() {
        User user = new User();
        user.setUsername("defaultuser");
        user.setPassword("password123");
        user.setUserType(1); // 学生

        when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(userMapper.insert(any(User.class))).thenReturn(1);

        userService.register(user);
        assertEquals(0, user.getMemberLevel());
        assertEquals(2, user.getCooperationType());
        assertNotNull(user.getCreateTime());
        assertNotNull(user.getUpdateTime());
    }
}
