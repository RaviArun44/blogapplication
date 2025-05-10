package com.blog.blog_app.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedPostResponse {
    private Integer id;
    private Integer userId;
    private Integer postId;
    private LocalDateTime createdAt;
    private PostRequest post;
}