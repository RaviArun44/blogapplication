package com.blog.blog_app.controller;

import com.blog.blog_app.dto.CommentRequest;
import com.blog.blog_app.dto.CommentResponse;
import com.blog.blog_app.service.CommentService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private static final Logger logger = LoggerFactory.getLogger(CommentController.class);
    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable Integer postId,
            @RequestBody CommentRequest commentRequest,
            @RequestParam Integer userId) {

        logger.info("Create comment for postId={} by userId={}", postId, userId);
        return handle(() -> {
            CommentResponse saved = commentService.createComment(commentRequest, postId, userId);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        });
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> getCommentsByPostId(@PathVariable Integer postId) {
        logger.info("Get comments for postId={}", postId);
        return handle(() -> {
            List<CommentResponse> comments = commentService.getCommentsByPostId(postId);
            return comments.isEmpty()
                    ? ResponseEntity.noContent().build()
                    : ResponseEntity.ok(comments);
        });
    }

    @GetMapping("/comments/{commentId}")
    public ResponseEntity<?> getCommentById(@PathVariable Integer commentId) {
        logger.info("Get comment by commentId={}", commentId);
        return handle(() -> ResponseEntity.ok(commentService.getCommentById(commentId)));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Integer commentId,
            @RequestBody CommentRequest request,
            @RequestParam Integer userId) {

        logger.info("Update commentId={} by userId={}", commentId, userId);
        return handle(() -> ResponseEntity.ok(commentService.updateComment(commentId, request, userId)));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Integer commentId,
            @RequestParam Integer userId) {

        logger.info("Delete commentId={} by userId={}", commentId, userId);
        return handle(() -> {
            commentService.deleteComment(commentId, userId);
            return ResponseEntity.ok(Collections.singletonMap("message", "Comment deleted successfully"));
        });
    }

    @GetMapping("/posts/{postId}/comments/count")
    public ResponseEntity<?> getCommentCount(@PathVariable Integer postId) {
        logger.info("Get comment count for postId={}", postId);
        return handle(() -> {
            Integer count = commentService.getCommentCountForPost(postId);
            return ResponseEntity.ok(Collections.singletonMap("count", count));
        });
    }

    @GetMapping("/users/{userId}/comments")
    public ResponseEntity<?> getCommentsByUserId(@PathVariable Integer userId) {
        logger.info("Get comments by userId={}", userId);
        return handle(() -> {
            List<CommentResponse> comments = commentService.getCommentsByUserId(userId);
            return comments.isEmpty()
                    ? ResponseEntity.noContent().build()
                    : ResponseEntity.ok(comments);
        });
    }

    // -------------------------------
    // 🔧 Private Utility Method
    // -------------------------------
    private ResponseEntity<?> handle(SupplierWithException<ResponseEntity<?>> action) {
        try {
            return action.get();
        } catch (RuntimeException e) {
            String message = e.getMessage().toLowerCase();
            if (message.contains("not found")) {
                logger.warn("Resource not found: {}", e.getMessage());
                return ResponseEntity.notFound().build();
            } else if (message.contains("not authorized")) {
                logger.warn("Unauthorized access: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: " + e.getMessage());
            } else {
                logger.error("Internal error: ", e);
                return ResponseEntity.internalServerError()
                        .body("Server error: " + e.getMessage());
            }
        } catch (Exception e) {
            logger.error("Unhandled exception: ", e);
            return ResponseEntity.internalServerError()
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    @FunctionalInterface
    private interface SupplierWithException<T> {
        T get() throws Exception;
    }
}
