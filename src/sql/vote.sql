CREATE TABLE admin(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    account VARCHAR(64) NOT NULL COMMENT '管理员账户',
    password VARCHAR(64) NOT NULL COMMENT '管理员密码 md5',
    create_time int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
    update_time int(11) NOT NULL DEFAULT '0' COMMENT '更新时间'
) DEFAULT CHARSET UTF8 COMMENT '管理员账户表';

CREATE TABLE election(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    name VARCHAR(64) NOT NULL COMMENT '选举名称',
    description VARCHAR(255) NOT NULL COMMENT '选举描述',
    create_time int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
    update_time int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
    status TINYINT NOT NULL DEFAULT '0' COMMENT '选举状态 0-未开始 1-进行中 2-已结束'
) DEFAULT CHARSET UTF8 COMMENT '发起选举活动表';

CREATE TABLE candidate(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    election_id int(11) NOT NULL COMMENT '候选人参与的选举活动id',
    name VARCHAR(64) NOT NULL COMMENT '候选人姓名',
    id_card VARCHAR(64) NOT NULL COMMENT '候选人身份证 唯一标识',
    result TINYINT NOT NULL DEFAULT '0' COMMENT '参选结果0-落选 1-中选',
    create_time int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
    update_time int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
    UNIQUE KEY election_candidate_key (election_id, id_card)
) DEFAULT CHARSET UTF8 COMMENT '候选人信息表';

CREATE TABLE vote(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    email VARCHAR(64) NOT NULL COMMENT '投票人邮箱',
    id_card VARCHAR(64) NOT NULL COMMENT '投票人身份证 唯一标识',
    candidate_id TINYINT NOT NULL COMMENT '投票的候选人id',
    create_time int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
    update_time int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
    UNIQUE KEY id_card_key (id_card)
) DEFAULT CHARSET UTF8 COMMENT '投票纪录表';