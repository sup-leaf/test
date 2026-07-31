package com.bjtumarket.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("t_competition_team")
public class CompetitionTeam {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String competitionName;
    private String description;
    private String requirement;
    private String skillTags;
    private Integer maxMembers;
    private Integer currentMembers;
    private Long leaderId;
    private Integer status; // 1-招募中 2-已满员/已结束
    private LocalDate deadline;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
