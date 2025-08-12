package com.giproject.repository.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.payment.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long>{

}
