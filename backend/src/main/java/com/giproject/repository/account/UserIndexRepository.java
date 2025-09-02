package com.giproject.repository.account;

import com.giproject.entity.account.UserIndex;
import com.giproject.entity.account.UserIndex.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserIndexRepository extends JpaRepository<UserIndex, String> {

    List<UserIndex> findByRole(Role role);

    @Query("SELECT ui FROM UserIndex ui WHERE ui.role = :role AND (LOWER(ui.loginId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(ui.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<UserIndex> findByRoleAndKeyword(@Param("role") Role role, @Param("keyword") String keyword);

    @Query("SELECT ui FROM UserIndex ui WHERE ui.role IN :roles AND (LOWER(ui.loginId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(ui.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<UserIndex> findByRolesAndKeyword(@Param("roles") List<Role> roles, @Param("keyword") String keyword);

    @Query("SELECT ui FROM UserIndex ui WHERE ui.role IN :roles")
    List<UserIndex> findByRoles(@Param("roles") List<Role> roles);

    Optional<UserIndex> findByLoginId(String loginId);
}
