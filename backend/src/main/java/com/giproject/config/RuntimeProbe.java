package com.giproject.config;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

@Configuration
class RuntimeProbe {

  @Autowired EntityManager em;

  @PostConstruct
  void check() {
    try {
      var c = com.giproject.entity.member.Member.class;

      var cs = c.getProtectionDomain() != null && c.getProtectionDomain().getCodeSource() != null
          ? c.getProtectionDomain().getCodeSource().getLocation().toString()
          : "<unknown>";
      System.out.println(">>> Member loaded from: " + cs);

      var f = c.getDeclaredField("memId");
      System.out.println(">>> memId field java type = " + f.getType());

      var idType = em.getMetamodel().entity(c).getIdType().getJavaType();
      System.out.println(">>> Hibernate id type    = " + idType);
    } catch (Exception e) {
      System.out.println(">>> RuntimeProbe error: " + e.getMessage());
      e.printStackTrace();
    }
  }
}
