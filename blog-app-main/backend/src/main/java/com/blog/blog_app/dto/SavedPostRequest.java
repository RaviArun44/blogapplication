package com.blog.blog_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedPostRequest {
    private Integer postId;
    private Integer userId;
}
