package com.nvd.service.spam_filter;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.nvd.models.cache.BlockSpam;
import com.nvd.utils.CacheConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final CacheService cacheService;
    private final ObjectMapper objectMapper;

    public boolean allowRequest(String ipAddress, long maxRequests, long timeIntervalInSeconds) {

        try {
            String key = "ip:" + ipAddress;
            Long currentTime = System.currentTimeMillis() / 1000;
            // Hiển thị key đang kiểm tra
            System.out.println("Checking rate limit for key: " + key);
            // Lấy dữ liệu từ Redis
            String dataIP = cacheService.getByKey(key);
            System.out.println("Data retrieved from cache for " + key + ": " + dataIP);

            // Nếu không có dữ liệu trong cache, nghĩa là đây là request đầu tiên
            if (dataIP == null) {
                BlockSpam bs = new BlockSpam(currentTime, 1);
                cacheService.writeCacheAtTime(key, bs, timeIntervalInSeconds, CacheConstants.TimeUnit_SECONDS);
                System.out.println("First request from " + ipAddress + ", setting up new entry in cache.");
                return true;
            }

            // Parse dữ liệu từ cache
            BlockSpam b = objectMapper.readValue(dataIP, BlockSpam.class);
            System.out.println("Current request count for " + ipAddress + ": " + b.getCountRequest());

            // Tăng số lượng request
            b.setCountRequest(b.getCountRequest() + 1);

            // Kiểm tra xem số lượng request có vượt quá giới hạn không
            if ((b.getCountRequest()) < maxRequests) {
                cacheService.writeCacheAtTime(key, b, timeIntervalInSeconds, CacheConstants.TimeUnit_SECONDS);
                System.out.println("Request allowed for " + ipAddress + ". Current request count: " + b.getCountRequest());
                return true;
            }

            // Trường hợp vượt quá giới hạn request
            System.out.println("Request blocked for " + ipAddress + ". Exceeded limit of " + maxRequests + " requests in " + timeIntervalInSeconds + " seconds.");
        } catch (Exception e) {
            System.out.println("Error during rate limit check: " + e.getMessage());
            return true;  // Cho phép request trong trường hợp lỗi để tránh gián đoạn
        }

        // Trường hợp không được phép tiếp tục request
        return false;
    }
}