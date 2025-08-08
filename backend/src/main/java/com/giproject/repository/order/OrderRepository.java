package com.giproject.repository.order;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.order.OrderSheet;

public interface OrderRepository extends JpaRepository<OrderSheet, Long>{

}
