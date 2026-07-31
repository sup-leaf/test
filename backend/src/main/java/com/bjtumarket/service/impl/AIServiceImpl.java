package com.bjtumarket.service.impl;

import com.bjtumarket.service.AIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class AIServiceImpl implements AIService {

    @Value("${ai.deepseek.api-key:}")
    private String apiKey;

    @Value("${ai.deepseek.model:deepseek-reasoner}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String API_URL = "https://api.deepseek.com/chat/completions";

    @Override
    public String optimizeResume(String resumeContent, String jobDescription) {
        log.info("开始调用 DeepSeek 优化简历...");
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            String systemPrompt = "你是一位资深的职业发展专家和简历优化师。请根据用户提供的简历内容和目标岗位描述，给出针对性的简历优化建议。";

            String userPrompt = String.format(
                "【简历内容】：\n%s\n\n" +
                "【目标岗位描述】：\n%s\n\n" +
                "请从以下几个方面给出建议：\n" +
                "1. 技能匹配度分析\n" +
                "2. 简历内容的针对性修改建议（如关键词增强、经历描述优化等）\n" +
                "3. 面试准备建议\n\n" +
                "请保持语气专业且富有鼓励性，字数控制在500字以内。",
                resumeContent, jobDescription
            );

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", userPrompt));
            body.put("messages", messages);
            body.put("stream", false);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(API_URL, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                Map responseBody = response.getBody();
                if (responseBody != null && responseBody.containsKey("choices")) {
                    List choices = (List) responseBody.get("choices");
                    if (!choices.isEmpty()) {
                        Map choice = (Map) choices.get(0);
                        Map message = (Map) choice.get("message");
                        String content = (String) message.get("content");
                        // DeepSeek reasoner 可能返回 reasoning_content + content
                        if (content == null || content.isEmpty()) {
                            content = (String) message.get("reasoning_content");
                        }
                        return content != null ? content : "AI 暂无优化建议";
                    }
                }
                if (responseBody != null && responseBody.containsKey("error")) {
                    Map error = (Map) responseBody.get("error");
                    return "服务异常: " + error.get("message");
                }
            }
            return "AI 优化暂时不可用，请稍后再试。";
        } catch (Exception e) {
            log.error("DeepSeek 请求失败: {}", e.getMessage());
            return "服务异常: " + e.getMessage();
        }
    }
}
