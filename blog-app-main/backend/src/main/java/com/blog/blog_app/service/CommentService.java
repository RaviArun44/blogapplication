package com.blog.blog_app.service;

import com.blog.blog_app.dto.CommentRequest;
import com.blog.blog_app.dto.CommentResponse;
import com.blog.blog_app.model.CommentModel;
import com.blog.blog_app.model.PostModel;
import com.blog.blog_app.model.SignUpModel;
import com.blog.blog_app.repository.CommentRepository;
import com.blog.blog_app.repository.PostRepository;
import com.blog.blog_app.repository.SignUpRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private static final Logger logger = LoggerFactory.getLogger(CommentService.class);

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private SignUpRepository userRepository;

    private CommentResponse mapToResponse(CommentModel comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setMessage(comment.getMessage());
        response.setAuthor(comment.getAuthor());
        response.setPostId(comment.getPost().getId());
        response.setUserId(comment.getUser().getId());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        return response;
    }

    public CommentResponse createComment(CommentRequest commentRequest, Integer postId, Integer userId) {
        PostModel post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        SignUpModel user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (commentRequest.getMessage() == null || commentRequest.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }

        CommentModel comment = new CommentModel();
        comment.setPost(post);
        comment.setUser(user);
        comment.setMessage(commentRequest.getMessage());
        comment.setAuthor(user.getUsername());
        comment.setCreatedAt(comment.getCreatedAt());
        comment.setUpdatedAt(comment.getUpdatedAt());

        CommentModel saved = commentRepository.save(comment);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPostId(Integer postId) {
        logger.info("Fetching comments for post ID: {}", postId);

        if (!postRepository.existsById(postId)) {
            logger.error("Post with ID {} not found", postId);
            throw new RuntimeException("Post not found with id: " + postId);
        }

        List<CommentModel> comments = commentRepository.findByPostId(postId);
        logger.info("Found {} comments for post ID: {}", comments.size(), postId);

        return comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CommentResponse getCommentById(Integer commentId) {
        logger.info("Fetching comment with ID: {}", commentId);

        CommentModel comment = commentRepository.findById(commentId)
                .orElseThrow(() -> {
                    logger.error("Comment with ID {} not found", commentId);
                    return new RuntimeException("Comment not found with id: " + commentId);
                });

        return convertToDto(comment);
    }

    @Transactional
    public CommentResponse updateComment(Integer commentId, CommentRequest commentRequest, Integer userId) {
        logger.info("Updating comment with ID: {} by user ID: {}", commentId, userId);

        CommentModel comment = commentRepository.findById(commentId)
                .orElseThrow(() -> {
                    logger.error("Comment with ID {} not found", commentId);
                    return new RuntimeException("Comment not found with id: " + commentId);
                });

        // Verify the user is the owner of the comment
        if (comment.getUser().getId() != userId) {
            logger.error("User with ID {} is not authorized to update comment with ID {}", userId, commentId);
            throw new RuntimeException("User is not authorized to update this comment");
        }

        // Update comment content
        comment.setMessage(commentRequest.getMessage());
        CommentModel updatedComment = commentRepository.save(comment);
        logger.info("Comment updated successfully with ID: {}", updatedComment.getId());

        return convertToDto(updatedComment);
    }

    @Transactional
    public void deleteComment(Integer commentId, Integer userId) {
        logger.info("Deleting comment with ID: {} by user ID: {}", commentId, userId);

        CommentModel comment = commentRepository.findById(commentId)
                .orElseThrow(() -> {
                    logger.error("Comment with ID {} not found", commentId);
                    return new RuntimeException("Comment not found with id: " + commentId);
                });

        // Verify the user is the owner of the comment or the post owner
        boolean isCommentOwner = (comment.getUser().getId() == userId);
        boolean isPostOwner = (comment.getPost().getUser().getId() == userId);

        if (!(isCommentOwner || isPostOwner)) {
            logger.error("User with ID {} is not authorized to delete comment with ID {}", userId, commentId);
            throw new RuntimeException("User is not authorized to delete this comment");
        }

        commentRepository.delete(comment);
        logger.info("Comment deleted successfully with ID: {}", commentId);
    }

    @Transactional(readOnly = true)
    public Integer getCommentCountForPost(Integer postId) {
        logger.info("Getting comment count for post ID: {}", postId);

        if (!postRepository.existsById(postId)) {
            logger.error("Post with ID {} not found", postId);
            throw new RuntimeException("Post not found with id: " + postId);
        }

        Integer count = commentRepository.countCommentsByPostId(postId);
        logger.info("Found {} comments for post ID: {}", count, postId);

        return count;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByUserId(Integer userId) {
        logger.info("Fetching comments by user ID: {}", userId);

        if (!userRepository.existsById(userId)) {
            logger.error("User with ID {} not found", userId);
            throw new RuntimeException("User not found with id: " + userId);
        }

        List<CommentModel> comments = commentRepository.findByUserId(userId);
        logger.info("Found {} comments by user ID: {}", comments.size(), userId);

        return comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private CommentResponse convertToDto(CommentModel comment) {
        CommentResponse dto = new CommentResponse();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPost().getId());
        dto.setUserId(comment.getUser().getId());
        dto.setAuthor(comment.getUser().getUsername());
        dto.setMessage(comment.getMessage());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
}
