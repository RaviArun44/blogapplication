package com.blog.blog_app.controller;

import com.blog.blog_app.dto.PostRequest;
import com.blog.blog_app.dto.PostResponse;
import com.blog.blog_app.model.PostModel;
import com.blog.blog_app.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody PostRequest postRequest, @RequestParam("userId") Integer userId) {
        logger.info("Received request to create post with title: {} for user ID: {}",
                postRequest.getTitle(), userId);

        try {
            PostResponse savedPost = postService.createPost(postRequest, userId);
            logger.info("Post created successfully with ID: {}", savedPost.getId());
            return new ResponseEntity<>(savedPost, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating post: ", e);
            return ResponseEntity.internalServerError().body("Failed to create post: " + e.getMessage());
        }
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Integer postId, @RequestParam("userId") Integer userId) {
        logger.info("Received request to delete post with ID: {} by user ID: {}", postId, userId);
        try {
            postService.deletePost(postId, userId);
            logger.info("Post deleted successfully with ID: {}", postId);
            return ResponseEntity.ok("Post deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting post: ", e);
            return ResponseEntity.internalServerError().body("Failed to delete post: " + e.getMessage());
        }
    }

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(@PathVariable Integer postId,
            @RequestBody PostRequest postRequest,
            @RequestParam("userId") Integer userId) {
        logger.info("Received request to update post with ID: {} by user ID: {}", postId, userId);
        try {
            postRequest.setId(postId);
            PostResponse updatedPost = postService.updatePost(postRequest, userId);
            logger.info("Post updated successfully with ID: {}", updatedPost.getId());
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            logger.error("Error updating post: ", e);
            return ResponseEntity.internalServerError().body("Failed to update post: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts(
            @RequestParam(required = false) Integer userId) {
        logger.info("Received request to get all posts");

        try {
            List<PostResponse> posts;
            if (userId != null) {
                posts = postService.getAllPosts(userId);
                logger.info("Retrieved {} posts with user ID: {}", posts.size(), userId);
            } else {
                posts = postService.getAllPosts();
                logger.info("Retrieved {} posts", posts.size());
            }
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            logger.error("Error retrieving posts: ", e);
            return ResponseEntity.internalServerError().body(null);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUserId(@PathVariable Integer userId) {
        logger.info("Received request to get posts for user: {}", userId);

        try {
            List<PostResponse> posts = postService.getPostsByUserId(userId);

            if (posts.isEmpty()) {
                logger.warn("No posts found for user: {}", userId);
                return ResponseEntity.noContent().build(); // 204 No Content
            }

            logger.info("Found {} posts for user: {}", posts.size(), userId);
            return ResponseEntity.ok(posts); // 200 OK with posts

        } catch (RuntimeException e) {
            logger.warn("Error retrieving posts for user: {}", userId);
            return ResponseEntity.notFound().build(); // 404 Not Found
        } catch (Exception e) {
            logger.error("Internal server error retrieving posts for user {}: ", userId, e);
            return ResponseEntity.internalServerError().body("Error retrieving posts: " + e.getMessage());
        }
    }

    @GetMapping("/{category}")
    public ResponseEntity<?> getPostsByCategory(
            @PathVariable String category,
            @RequestParam(required = false) Integer userId) {
        logger.info("Received request to get posts for category: {}", category);

        try {
            List<PostResponse> posts;
            if (userId != null) {
                posts = postService.getPostsByCategory(category, userId);
            } else {
                posts = postService.getPostsByCategory(category);
            }

            if (posts.isEmpty()) {
                logger.warn("No posts found for category: {}", category);
                return ResponseEntity.noContent().build(); // Return 204 No Content if no posts found
            }

            logger.info("Found {} posts for category: {}", posts.size(), category);
            return ResponseEntity.ok(posts); // Return the posts

        } catch (RuntimeException e) {
            logger.warn("Error retrieving posts for category: {}", category);
            return ResponseEntity.notFound().build(); // Return 404 Not Found in case of any issue
        } catch (Exception e) {
            logger.error("Error retrieving posts for category {}: ", category, e);
            return ResponseEntity.internalServerError().body("Error retrieving posts: " + e.getMessage());
        }
    }

    @PostMapping("/{postId}/toggle-like")
    public ResponseEntity<?> toggleLike(@PathVariable Integer postId, @RequestBody Map<String, Integer> payload) {
        Integer userId = payload.get("userId");
        logger.info("Received request to toggle like for post ID: {} by user ID: {}", postId, userId);

        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }

            Map<String, Object> result = postService.toggleLike(postId, userId);
            logger.info("Like successfully toggled for post ID: {} by user ID: {}", postId, userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                logger.warn("Post not found with ID: {}", postId);
                return ResponseEntity.notFound().build();
            } else {
                logger.error("Error toggling like for post with ID {}: ", postId, e);
                return ResponseEntity.internalServerError()
                        .body("Error toggling like: " + e.getMessage());
            }
        }
    }

    @GetMapping("/{postId}/likes")
    public ResponseEntity<?> getLikes(@PathVariable Integer postId,
            @RequestParam(required = false) Integer userId) {
        logger.info("Received request to get likes for post ID: {} for user ID: {}", postId, userId);

        try {
            List<Integer> userIds = postService.getLikeUserIds(postId, userId);
            return ResponseEntity.ok(userIds);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                logger.warn("Post not found with ID: {}", postId);
                return ResponseEntity.notFound().build();
            } else {
                logger.error("Error getting likes for post with ID {}: ", postId, e);
                return ResponseEntity.internalServerError()
                        .body("Error getting likes: " + e.getMessage());
            }
        }
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable Integer postId, @RequestParam Integer userId) {
        logger.info("Received request to like post with ID: {} by user ID: {}", postId, userId);

        try {
            Map<String, Object> result = postService.addLike(postId, userId);
            logger.info("Post liked successfully with ID: {} by user ID: {}", postId, userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                logger.warn("Post not found with ID: {}", postId);
                return ResponseEntity.notFound().build();
            } else {
                logger.error("Error liking post with ID {}: ", postId, e);
                return ResponseEntity.internalServerError()
                        .body("Error liking post: " + e.getMessage());
            }
        }
    }

    @PostMapping("/{postId}/unlike")
    public ResponseEntity<?> unlikePost(@PathVariable Integer postId, @RequestParam Integer userId) {
        logger.info("Received request to unlike post with ID: {} by user ID: {}", postId, userId);

        try {
            Map<String, Object> result = postService.removeLike(postId, userId);
            logger.info("Post unliked successfully with ID: {} by user ID: {}", postId, userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                logger.warn("Post not found with ID: {}", postId);
                return ResponseEntity.notFound().build();
            } else {
                logger.error("Error unliking post with ID {}: ", postId, e);
                return ResponseEntity.internalServerError()
                        .body("Error unliking post: " + e.getMessage());
            }
        }
    }
}