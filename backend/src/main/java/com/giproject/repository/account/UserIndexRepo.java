package com.giproject.repository.account;

import com.giproject.entity.account.UserIndex;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserIndexRepo extends JpaRepository<UserIndex, String> {
    boolean existsByLoginId(String loginId);
    Optional<UserIndex> findByLoginId(String loginId);
}