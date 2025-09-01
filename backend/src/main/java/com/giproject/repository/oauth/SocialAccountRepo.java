package com.giproject.repository.oauth;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.giproject.entity.oauth.SocialAccount;
import com.giproject.entity.oauth.SocialAccount.Provider;

public interface SocialAccountRepo extends JpaRepository<SocialAccount, Long> {
	Optional<SocialAccount> findByProviderAndProviderUserId(Provider provider, String providerUserId);
    Optional<SocialAccount> findBySignupTicket(String signupTicket);
}
