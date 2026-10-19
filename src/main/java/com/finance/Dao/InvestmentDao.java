package com.finance.Dao;

import com.finance.Bean.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvestmentDao extends JpaRepository<Investment, Long> {
    List<Investment> findByUserId(String userId);
}