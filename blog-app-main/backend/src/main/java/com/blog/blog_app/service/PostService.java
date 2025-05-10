package com.blog.blog_app.service;

import com.blog.blog_app.dto.PostRequest;
import com.blog.blog_app.dto.PostResponse;
import com.blog.blog_app.exception.ResourceNotFoundException;
import com.blog.blog_app.model.PostModel;
import com.blog.blog_app.model.SignUpModel;
import com.blog.blog_app.repository.PostRepository;
import com.blog.blog_app.repository.SignUpRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostService.class);
    private final ObjectMapper objectMapper;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private SignUpRepository userRepository;

    @Autowired
    public PostService(PostRepository postRepository, ObjectMapper objectMapper) {
        this.postRepository = postRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public PostResponse createPost(PostRequest postRequest, Integer userId) {
        logger.info("Creating new post for user with ID: {}", userId);

        Optional<SignUpModel> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            logger.error("User with ID {} not found", userId);
            throw new RuntimeException("User not found");
        }

        PostModel post = new PostModel();
        post.setTitle(postRequest.getTitle());
        post.setExcerpt(postRequest.getExcerpt());
        post.setCategory(postRequest.getCategory());
        post.setCoverImage(postRequest.getCoverImage());
        post.setContent(postRequest.getContent());
        post.setLikes(new ArrayList<>());
        post.setUser(userOptional.get());

        PostModel savedPost = postRepository.save(post);
        logger.info("Post saved successfully with ID: {}", savedPost.getId());

        return convertToDto(savedPost, null);
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Integer postId, Integer userId) {
        logger.info("Fetching post with ID: {}", postId);

        PostModel post = postRepository.findById(postId.longValue())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        return convertToDto(post, userId);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        logger.info("Fetching all posts");

        List<PostModel> posts = postRepository.findAll();
        return posts.stream()
                .map(post -> convertToDto(post, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts(Integer userId) {
        logger.info("Fetching all posts with user like status for user ID: {}", userId);

        List<PostModel> posts = postRepository.findAll();
        return posts.stream()
                .map(post -> convertToDto(post, userId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByCategory(String category) {
        logger.info("Fetching posts by category: {}", category);

        List<PostModel> posts;

        if ("all".equalsIgnoreCase(category)) {
            posts = postRepository.findAll(); // Fetch all posts
        } else {
            posts = postRepository.findByCategory(category); // Fetch posts by category
        }

        return posts.stream()
                .map(post -> convertToDto(post, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByCategory(String category, Integer userId) {
        logger.info("Fetching posts by category: {} with user like status for user ID: {}", category, userId);

        List<PostModel> posts;

        if ("all".equalsIgnoreCase(category)) {
            posts = postRepository.findAll(); // Fetch all posts
        } else {
            posts = postRepository.findByCategory(category); // Fetch posts by category
        }

        return posts.stream()
                .map(post -> convertToDto(post, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> toggleLike(Integer postId, Integer userId) {
        logger.info("Toggling like for post ID: {} by user ID: {}", postId, userId);

        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        PostModel post = postRepository.findById(postId.longValue())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        boolean hasLiked = post.hasUserLiked(userId);
        Map<String, Object> result = new HashMap<>();

        if (hasLiked) {
            // User already liked the post, remove the like
            post.removeLike(userId);
            result.put("action", "unlike");
        } else {
            // User hasn't liked the post, add the like
            post.addLike(userId);
            result.put("action", "like");
        }

        postRepository.save(post);

        result.put("postId", postId);
        result.put("userId", userId);
        result.put("likeCount", post.getLikes().size());
        result.put("userHasLiked", !hasLiked); // Changed from userLiked to userHasLiked for consistency

        logger.info("Like toggled for post ID: {}. Action: {}", postId, result.get("action"));

        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLikesInfo(Integer postId, Integer userId) {
        logger.info("Getting likes info for post ID: {} for user ID: {}", postId, userId);

        PostModel post = postRepository.findById(postId.longValue())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        Map<String, Object> likesInfo = new HashMap<>();
        likesInfo.put("postId", postId);
        likesInfo.put("likeCount", post.getLikes().size());

        // Always include userHasLiked flag for consistent API responses
        if (userId != null) {
            likesInfo.put("userHasLiked", post.hasUserLiked(userId)); // Changed from userLiked to userHasLiked for
                                                                      // consistency
        } else {
            likesInfo.put("userHasLiked", false);
        }

        return likesInfo;
    }

    // Implementation for the addLike method
    @Transactional
    public Map<String, Object> addLike(Integer postId, Integer userId) {
        logger.info("Adding like to post with ID: {} by user ID: {}", postId, userId);

        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        PostModel post = postRepository.findById(postId.longValue())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        boolean hasLiked = post.hasUserLiked(userId);
        Map<String, Object> result = new HashMap<>();

        // Only add like if user hasn't already liked the post
        if (!hasLiked) {
            post.addLike(userId);
            postRepository.save(post);
            logger.info("Like added to post with ID: {} by user ID: {}", postId, userId);
        } else {
            logger.info("User ID: {} has already liked post ID: {}", userId, postId);
        }

        result.put("postId", postId);
        result.put("userId", userId);
        result.put("likeCount", post.getLikes().size());
        result.put("userHasLiked", true);
        result.put("action", "like");

        return result;
    }

    // Implementation for the removeLike method
    @Transactional
    public Map<String, Object> removeLike(Integer postId, Integer userId) {
        logger.info("Removing like from post with ID: {} by user ID: {}", postId, userId);

        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        PostModel post = postRepository.findById(postId.longValue())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        boolean hasLiked = post.hasUserLiked(userId);
        Map<String, Object> result = new HashMap<>();

        // Only remove like if user has already liked the post
        if (hasLiked) {
            post.removeLike(userId);
            postRepository.save(post);
            logger.info("Like removed from post with ID: {} by user ID: {}", postId, userId);
        } else {
            logger.info("User ID: {} has not liked post ID: {}, nothing to remove", userId, postId);
        }

        result.put("postId", postId);
        result.put("userId", userId);
        result.put("likeCount", post.getLikes().size());
        result.put("userHasLiked", false);
        result.put("action", "unlike");

        return result;
    }

    // Legacy methods for backward compatibility
    @Transactional
    public PostResponse likePost(Integer postId) {
        logger.info("Adding legacy like to post with ID: {}", postId);

        PostModel post = postRepository.findById(postId.longValue())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        postRepository.initializeLikesIfNull(postId.longValue());
        postRepository.incrementLikes(postId.longValue());

        // Refresh post from database to get updated likes
        post = postRepository.findById(postId.longValue()).get();

        logger.info("Legacy like added to post with ID: {}", postId);

        return convertToDto(post, null);
    }

    @Transactional
    public PostResponse unlikePost(Integer postId) {
        logger.info("Removing legacy like from post with ID: {}", postId);

        PostModel post = postRepository.findById(postId.longValue())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        if (post.getLikes() != null && !post.getLikes().isEmpty()) {
            postRepository.decrementLikes(postId.longValue());

            // Refresh post from database to get updated likes
            post = postRepository.findById(postId.longValue()).get();
            logger.info("Legacy like removed from post with ID: {}", postId);
        } else {
            logger.warn("Cannot remove like from post with ID: {} as it has no likes", postId);
        }

        return convertToDto(post, null);
    }

    private PostResponse convertToDto(PostModel post, Integer userId) {
        PostResponse dto = new PostResponse();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setExcerpt(post.getExcerpt());
        dto.setCategory(post.getCategory());
        dto.setCoverImage(post.getCoverImage());
        dto.setContent(post.getContent());
        dto.setLikes(post.getLikes());
        dto.setUserId(post.getUser().getId());
        dto.setUsername(post.getUser().getUsername());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());

        // Set whether the current user has liked this post
        if (userId != null) {
            dto.setUserLiked(post.hasUserLiked(userId));
        }

        return dto;
    }

    public List<Integer> getLikeUserIds(Integer postId, Integer userId) {
        List<Integer> likesJson = postRepository.getLikesByPostId(postId);

        if (likesJson == null) {
            throw new RuntimeException("Post not found with ID: " + postId);
        }

        try {

            return likesJson;
        } catch (Exception e) {
            logger.error("Error parsing likes JSON for post ID: {}", postId, e);
            throw new RuntimeException("Error processing likes data: " + e.getMessage());
        }
    }

    // public List<PostModel> getPostsByUserId(Integer userId) {
    // return postRepository.findByUserId(userId);
    // }
    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByUserId(@PathVariable Integer userId) {
        logger.info("Fetching posts created by user ID: {} with like status", userId);

        List<PostModel> posts = postRepository.findByUserId(userId);

        return posts.stream()
                .map(post -> convertToDto(post, userId))
                .collect(Collectors.toList());
    }

    public void deletePost(Integer postId, Integer userId) {
        PostModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        // Check if the post belongs to the user
        if (post.getUser().getId() != userId) {
            throw new RuntimeException("You are not authorized to delete this post");
        }

        postRepository.delete(post);
    }

    private PostResponse mapToPostResponse(PostModel postModel) {
        PostResponse postResponse = new PostResponse();
        postResponse.setId(postModel.getId());
        postResponse.setTitle(postModel.getTitle());
        postResponse.setExcerpt(postModel.getExcerpt());
        postResponse.setCategory(postModel.getCategory());
        postResponse.setCoverImage(postModel.getCoverImage());
        postResponse.setContent(postModel.getContent());
        postResponse.setUserId(postModel.getUser().getId());
        postResponse.setCreatedAt(postModel.getCreatedAt());
        postResponse.setUpdatedAt(postModel.getUpdatedAt());
        return postResponse;
    }

    public PostResponse updatePost(PostRequest postRequest, Integer userId) {
        // Get the post by id
        PostModel post = postRepository.findById(postRequest.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postRequest.getId()));

        // Check if the post belongs to the user
        if (post.getUser().getId() != userId) {
            throw new RuntimeException("You are not authorized to update this post");
        }

        post.setTitle(postRequest.getTitle());
        post.setExcerpt(postRequest.getExcerpt());
        post.setCategory(postRequest.getCategory());
        post.setCoverImage(postRequest.getCoverImage());
        post.setContent(postRequest.getContent());

        PostModel updatedPost = postRepository.save(post);
        return mapToPostResponse(updatedPost);
    }

}