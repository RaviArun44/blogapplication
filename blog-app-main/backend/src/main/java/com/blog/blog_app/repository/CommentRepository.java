package com.blog.blog_app.repository;

import com.blog.blog_app.model.CommentModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentModel, Integer> {

    // Find all comments for a specific post
    @Query("SELECT c FROM CommentModel c WHERE c.post.id = :postId ORDER BY c.createdAt DESC")
    List<CommentModel> findByPostId(@Param("postId") Integer postId);

    // Find all comments by a specific user
    @Query("SELECT c FROM CommentModel c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<CommentModel> findByUserId(@Param("userId") Integer userId);

    // Count comments for a specific post
    @Query("SELECT COUNT(c) FROM CommentModel c WHERE c.post.id = :postId")
    Integer countCommentsByPostId(@Param("postId") Integer postId);

    // Delete all comments for a specific post
    @Query("DELETE FROM CommentModel c WHERE c.post.id = :postId")
    void deleteByPostId(@Param("postId") Integer postId);

    // Check if post exists by ID
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM PostModel p WHERE p.id = :postId")
    boolean existsByPostId(@Param("postId") Integer postId);
}