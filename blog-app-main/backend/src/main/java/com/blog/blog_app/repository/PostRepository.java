package com.blog.blog_app.repository;

import com.blog.blog_app.model.PostModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<PostModel, Long> {

    List<PostModel> findByCategory(String category);

    boolean existsById(Integer id);

    // This query will be used only for legacy support
    @Modifying
    @Query(value = "UPDATE posts SET likes = JSON_ARRAY_APPEND(COALESCE(likes, '[]'), '$', :userId) WHERE id = :postId", nativeQuery = true)
    void addUserToLikes(@Param("postId") Long postId, @Param("userId") Integer userId);

    @Modifying
    @Query(value = "UPDATE posts SET likes = JSON_REMOVE(likes, JSON_UNQUOTE(JSON_SEARCH(likes, 'one', :userId))) WHERE id = :postId AND JSON_SEARCH(likes, 'one', :userId) IS NOT NULL", nativeQuery = true)
    void removeUserFromLikes(@Param("postId") Long postId, @Param("userId") Integer userId);

    // Legacy methods for backward compatibility
    @Modifying
    @Query(value = "UPDATE posts p SET p.likes = JSON_ARRAY() WHERE p.id = :postId AND p.likes IS NULL", nativeQuery = true)
    void initializeLikesIfNull(@Param("postId") Long postId);

    @Modifying
    @Query(value = "UPDATE posts SET likes = CASE WHEN JSON_LENGTH(COALESCE(likes, '[]')) > 0 THEN JSON_ARRAY_APPEND(likes, '$', -1) ELSE JSON_ARRAY(-1) END WHERE id = :postId", nativeQuery = true)
    void incrementLikes(@Param("postId") Long postId);

    @Modifying
    @Query(value = "UPDATE posts SET likes = JSON_REMOVE(likes, '$[JSON_LENGTH(likes) - 1]') WHERE id = :postId AND JSON_LENGTH(likes) > 0", nativeQuery = true)
    void decrementLikes(@Param("postId") Long postId);

    @Query(value = """
            SELECT jt.value
            FROM posts p,
            JSON_TABLE(p.likes, '$[*]' COLUMNS (value INT PATH '$')) AS jt
            WHERE p.id = :postId
            """, nativeQuery = true)
    List<Integer> getLikesByPostId(@Param("postId") Integer postId);

    @Modifying
    @Query(value = "SELECT COUNT(*) > 0 FROM posts WHERE id = :postId AND JSON_CONTAINS(likes, CAST(:userId AS JSON), '$') = 1", nativeQuery = true)
    Boolean hasUserLikedPost(@Param("postId") Integer postId, @Param("userId") Integer userId);

    Optional<PostModel> findById(Integer id);

    List<PostModel> findByUserId(Integer userId);

}