package com.giproject.repository.delivery;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.delivery.Delivery;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

}
