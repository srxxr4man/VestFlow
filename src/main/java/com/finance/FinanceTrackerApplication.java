package com.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.finance.Bean")
@EnableJpaRepositories(basePackages = "com.finance.Dao")

public class FinanceTrackerApplication {
    public static void main(String[] args) {
        SpringApplication.run(FinanceTrackerApplication.class, args);
    }
}