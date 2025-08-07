package com.giproject.repository.order;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.order.Order;

public interface OrderRepository extends JpaRepository<Order, Long>{

}
