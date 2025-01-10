package com.nvd.controller;

import com.nvd.dto.request.CreatePostDTO;
import com.nvd.dto.request.CreateReplyDTO;
import com.nvd.dto.request.CreateViewsDTO;
import com.nvd.dto.response.PostDTO;
import com.nvd.dto.response.UserReplyPostDTO;
import com.nvd.exceptions.PostDoesNotExistException;
import com.nvd.exceptions.UnableToCreatePostException;
import com.nvd.models.ApplicationUser;
import com.nvd.models.Post;
import com.nvd.service.PostService;
import com.nvd.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/posts")
//@CrossOrigin("*")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final UserService userService;


    @ExceptionHandler({UnableToCreatePostException.class})
    public ResponseEntity<String> handleUnableToCreatePost() {
        return new ResponseEntity<>("Unable to create post at this time", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler({PostDoesNotExistException.class})
    public ResponseEntity<String> handlePostDoesntExist() {
        return new ResponseEntity<>("Post doesnt exist", HttpStatus.NOT_FOUND);
    }

    @GetMapping()
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @PostMapping
    public PostDTO createPost(@RequestBody CreatePostDTO postDTO) {
        return postService.createPost(postDTO);
    }

    @PostMapping("/reply")
    public Post replyToPost(@RequestBody CreateReplyDTO replyDTO) {
        return postService.replyToPost(replyDTO);
    }

    @PostMapping(value = "/reply/media", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
    public Post createReplyWithMedia(@RequestPart("reply") String reply, @RequestPart("files") List<MultipartFile> files) {
        return postService.createReplyWithMedia(reply, files);
    }

    @PostMapping(value = "/media", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
    public PostDTO createMediaPost(@RequestPart("post") String post, @RequestPart("files") List<MultipartFile> files) {
        return postService.createMediaPost(post, files);
    }

    @PutMapping("/{id}")
    public PostDTO updatePost(@PathVariable int id, @RequestBody CreatePostDTO postDTO) {
        return postService.updatePost(id, postDTO);
    }

    @GetMapping("/{id}")
    public PostDTO getPostById(@PathVariable int id) {
        return postService.getPostDTOById(id);
    }

    @GetMapping("/author/{userId}")
    public Set<PostDTO> getAllPostsByAuthor(@PathVariable("userId") Integer userId) {
        ApplicationUser author = userService.getUserById(userId);

        return postService.getAllPostsByAuthor(author);
    }

    @GetMapping("/repost/user/{userId}")
    public Set<PostDTO> getAllRepostPostsByUser(@PathVariable("userId") Integer userId) {
        return postService.getAllRepostPostsByUser(userId);
    }

    @GetMapping("/reply/user/{userId}")
    public List<UserReplyPostDTO> getAllReplyPostsByUser(@PathVariable("userId") Integer userId) {
        return postService.getAllReplyPostsByUser(userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable int id) {
        postService.deletePostById(id);
        return ResponseEntity.ok("Post deleted successfully!");
    }

    @PutMapping("/repost/{id}")
    public PostDTO repostPost(@PathVariable int id, @RequestHeader(value = "Authorization") String token) {
        return postService.repostPost(id, token);
    }

    @PutMapping("/like/{id}")
    public PostDTO likePost(@PathVariable int id, @RequestHeader(value = "Authorization") String token) {
        return postService.likePost(id, token);
    }

    @PutMapping("/give-star/{id}")
    public PostDTO giveStarToPost(@PathVariable int id, @RequestHeader(value = "Authorization") String token) {
        return postService.giveStarToPost(id, token);
    }

    @PutMapping("/view/{id}")
    public PostDTO viewPost(@PathVariable("id") int id, @RequestHeader(value = "Authorization") String token) {
        return postService.viewPost(id, token);
    }

    @PutMapping("/view/all")
    public List<Post> viewPostsById(@RequestBody CreateViewsDTO views, @RequestHeader(value = "Authorization") String token) {
        return postService.viewPosts(views.getIds(), token);
    }

    @GetMapping("/likes/{id}")
    public List<Post> getLikes(@PathVariable("id") Integer id) {
        return postService.getUsersLikes(id);
    }

}
