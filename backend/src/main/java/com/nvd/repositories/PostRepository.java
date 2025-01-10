package com.nvd.repositories;

import com.nvd.models.ApplicationUser;
import com.nvd.models.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
    Set<Post> findByAuthorOrderByPostedDateDesc(ApplicationUser author);

    Optional<Set<Post>> findByRepostsOrderByPostedDateDesc(ApplicationUser author);

    //    Optional<Set<Post>> findByRepliesOrderByPostedDateDesc(ApplicationUser author);

    // lấy tất cả các bài đăng có liên quan đến user,
    // union
    // lấy tất cả các bài đăng mà user đó đã repost (có following)
    // union
    // lấy tất cả các bài đăng mà user đó đang theo dõi (có following)
    String FEED_QUERY = "SELECT * FROM (\n" +
            "        SELECT *\n" +
            "        FROM posts \n" +
            "        WHERE author_id = :id\n" +
            "\n" +
            "        UNION\n" +
            "\n" +
            "        SELECT p.*\n" +
            "        FROM posts p\n" +
            "        INNER JOIN post_repost_junction prj ON p.post_id = prj.post_id\n" +
            "        WHERE prj.user_id IN (\n" +
            "            SELECT u.user_id AS following_id \n" +
            "            FROM users u\n" +
            "            INNER JOIN \"following\" f ON u.user_id = f.following_id\n" +
            "            WHERE f.user_id = :id AND NOT f.following_id = :id\n" +
            "        )\n" +
            "\n" +
            "        UNION\n" +
            "\n" +
            "        SELECT p.*\n" +
            "        FROM posts p\n" +
            "        WHERE p.author_id IN (\n" +
            "            SELECT u.user_id AS following_id\n" +
            "            FROM users u\n" +
            "            INNER JOIN \"following\" ON u.user_id = following.following_id \n" +
            "            WHERE following.user_id = :id AND NOT following.following_id = :id\n" +
            "        )\n" +
            "    ) AS p \n" +
            "    WHERE p.posted_date <= :session_start \n" +
            "    ORDER BY p.posted_date DESC";


    @Query(nativeQuery = true, value = FEED_QUERY,
            countQuery = "SELECT COUNT(*) FROM (" + FEED_QUERY + ") AS feed_count"
    )
    Page<Post> findFeedPosts(@Param("id") Integer id, @Param("session_start") LocalDateTime sessionDate, Pageable pageable);


    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN TRUE ELSE FALSE END FROM Post p JOIN p.views v WHERE p.postId = :postId AND v.userId = :userId")
    boolean hasUserViewedPost(@Param("postId") Integer postId, @Param("userId") Integer userId);

    Optional<List<Post>> findByPostIdIn(List<Integer> postIds);

    @Query(
            nativeQuery = true,
            value = "select p.post_id, p.audience, p.content, p.posted_date, p.is_reply, p.reply_restriction, p.reply_to, p.scheduled, p.scheduled_date, p.author_id, p.poll_id " +
                    "from posts p " +
                    "join post_likes_junction plj on p.post_id = plj.post_id " +
                    "where plj.user_id = :userId"
    )
    List<Post> getUsersLikes(Integer userId);

    // publish schedule post
    List<Post> findAllByScheduledTrueAndScheduledDateBefore(LocalDateTime now);

    // ===== STATICTIS posts
    @Query(value = "SELECT count(p.post_id) as CountPost FROM posts p WHERE p.author_id = :userId", nativeQuery = true)
    int countPostByUser(int userId);

    // lấy tổng số bài đăng theo ngày
    @Query(value = "SELECT COUNT(post_id) FROM post WHERE EXTRACT(DAY FROM posted_date)=:day AND EXTRACT(MONTH FROM posted_date)=:month AND EXTRACT(YEAR FROM posted_date)=:year", nativeQuery = true)
    int getTotalPostByDay(int day, int month, int year);

    // lấy tổng số bài đăng theo tháng
    @Query(value = "SELECT COUNT(post_id) FROM post WHERE EXTRACT(MONTH FROM posted_date)=:month AND EXTRACT(YEAR FROM posted_date)=:year", nativeQuery = true)
    int getTotalPostByMonth(int month, int year);

    // lấy tổng số bài đăng theo năm
    @Query(value = "SELECT COUNT(post_id) FROM post WHERE EXTRACT(YEAR FROM posted_date)=:year", nativeQuery = true)
    int getTotalPostByYear(int year);

    // Top 4 bài đăng có lượt yêu thích nhiều nhất
    @Query(value = "SELECT p.post_id, COUNT(DISTINCT psj.user_id) AS Total_Stars, COUNT(DISTINCT plj.user_id) AS Total_Likes\n" +
            " FROM posts p LEFT JOIN post_star_junction psj ON p.post_id = psj.post_id\n" +
            " LEFT JOIN post_likes_junction plj ON p.post_id = plj.post_id\n" +
            " WHERE EXTRACT(MONTH FROM p.posted_date) = EXTRACT(MONTH FROM CURRENT_DATE)\n" +
            " AND EXTRACT(YEAR FROM p.posted_date) = EXTRACT(YEAR FROM CURRENT_DATE)\n" +
            " GROUP BY p.post_id\n" +
            " ORDER BY Total_Stars DESC, Total_Likes DESC\n" +
            " LIMIT 5;", nativeQuery = true)
    List<Object[]> getTop5PostsByStarsAndLikesCurrentMonth();

    // Tổng số bài đăng theo từng tháng
    @Query(value = "SELECT EXTRACT(MONTH FROM posted_date) AS MONTH, COUNT(*) \r\n"
            + "FROM post WHERE EXTRACT(YEAR FROM posted_date)=:year\r\n" + "GROUP BY EXTRACT(MONTH FROM posted_date) \r\n"
            + "ORDER BY EXTRACT(MONTH FROM posted_date) ASC;", nativeQuery = true)
    List<Object[]> getTotalPostEveryMonth(int year);
}
