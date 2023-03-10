package com.ssafysignal.api.profile.repository;

import com.ssafysignal.api.profile.entity.UserHeartLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserHeartLogRepository extends JpaRepository<UserHeartLog, Integer> {
    List<UserHeartLog> findAllByUserSeq(Integer userSeq, Sort sort);
}
