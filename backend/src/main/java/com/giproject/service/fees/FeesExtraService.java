package com.giproject.service.fees;

import java.math.BigDecimal;
import java.util.List;

public interface FeesExtraService {

    List<String> getAllTitles();

    List<List<String>> getFeeGrid();

    void saveOrUpdate(String title, String distance, BigDecimal price);

    void addTitle(String title);

    void deleteTitle(String title);
}
