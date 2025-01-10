package com.nvd.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nvd.dto.request.CreatePostDTO;
import com.nvd.dto.request.CreateReplyDTO;
import com.nvd.dto.response.PostDTO;
import com.nvd.dto.response.UserReplyPostDTO;
import com.nvd.exceptions.PostDoesNotExistException;
import com.nvd.exceptions.UnableToCreatePostException;
import com.nvd.mappers.PostMapper;
import com.nvd.models.*;
import com.nvd.models.enums.Audience;
import com.nvd.models.enums.NotificationType;
import com.nvd.models.enums.ReplyRestriction;
import com.nvd.repositories.NotificationRepository;
import com.nvd.repositories.PostRepository;
import com.nvd.utils.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PostService {
    private final PostRepository postRepository;
    private final ImageService imageService;
    private final PollService pollService;
    private final TokenService tokenService;
    private final UserService userService;
    private final ProvinceService provinceService;
    private final DistrictService districtService;
    private final WardService wardService;
    protected final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final PostMapper postMapper;

    public PostDTO createPost(CreatePostDTO dto) {

        Image savedGif;

        // if true, there is a single gif from tenor
        if (dto.getImages() != null && dto.getImages().size() > 0) {
            List<Image> gifList = dto.getImages();
            Image gif = gifList.get(0);
            gif.setImagePath(gif.getImageURL());

            savedGif = imageService.saveGifFromPost(gif);
            gifList.remove(0);
            gifList.add(savedGif);
            dto.setImages(gifList);
        }

        // If true, there is a Poll that needs to be created
        Poll savedPoll = null;
        if (dto.getPoll() != null) {
            log.info("There was a poll in this post!");
            Poll p = new Poll();
            p.setEndTime(dto.getPoll().getEndTime());
            p.setChoices(new ArrayList<>());
            savedPoll = pollService.generatePoll(p);
            List<PollChoice> pollChoices = new ArrayList<PollChoice>();
            List<PollChoice> choices = dto.getPoll().getChoices();
            for (int i = 0; i < choices.size(); i++) {
                PollChoice choice = choices.get(i);
                choice.setPoll(savedPoll);
                choice = pollService.generateChoice(choice);
                pollChoices.add(choice);
            }

            savedPoll.setChoices(pollChoices);
            savedPoll = pollService.generatePoll(savedPoll);

            log.info(savedPoll.toString());
        }

        Post post = new Post();
        post.setContent(dto.getContent());

        // Mentioned users
        String[] words = dto.getContent().split(" ");
        List<ApplicationUser> mentionedUsers = new ArrayList<>();
        for (String word : words) {
            if (word.startsWith("@")) {
                try {
                    String username = word.substring(1).replaceAll(("[^a-zA-Z0-9]*$"), "");
                    ApplicationUser mentionedUser = userService.getUserByUsername(username);
                    mentionedUsers.add(mentionedUser);
                } catch (Exception e) {
                }
            }
        }

        if (dto.getScheduled())
            post.setPostedDate(dto.getScheduledDate());
        else
            post.setPostedDate(LocalDateTime.now());

        // location details in post
        if (dto.getAddress() != null || dto.getProvinceCode() != null) {
            post.setAddress(dto.getAddress());
            post.setProvince(provinceService.findProvinceByID(dto.getProvinceCode()));
            post.setDistrict(districtService.findByCodeAndProvinceCode(dto.getDistrictCode(), dto.getProvinceCode()));
            post.setWard(wardService.findByCodeAndDistrictCode(dto.getWardCode(), dto.getDistrictCode()));
        }

        post.setAuthor(dto.getAuthor());
        post.setReplies(dto.getReplies());
        post.setScheduled(dto.getScheduled());
        post.setScheduledDate(dto.getScheduledDate());
        post.setAudience(dto.getAudience());
        post.setReplyRestriction(dto.getReplyRestriction());
        post.setImages(dto.getImages());
        post.setPoll(savedPoll);

        try {
            Post posted = postRepository.save(post);
            notificationService.createAndSendPostNotifications(posted);
            mentionedUsers.forEach(mentionUser
                    -> notificationService.createAndSendNotifications(NotificationType.MENTION,
                    mentionUser, posted.getAuthor(), posted, null));
//            return posted;
            return postMapper.convertToDTO(posted);
        } catch (Exception e) {
            throw new UnableToCreatePostException();
        }
    }

    public PostDTO createMediaPost(String post, List<MultipartFile> files) {
        CreatePostDTO dto = new CreatePostDTO();

        try {
            ObjectMapper objectMapper = new ObjectMapper();

            objectMapper.registerModule(new JavaTimeModule());

            dto = objectMapper.readValue(post, CreatePostDTO.class);

            Post p = new Post();
            p.setContent(dto.getContent());

            // Mentioned users
            String[] words = dto.getContent().split(" ");
            List<ApplicationUser> mentionedUsers = new ArrayList<>();
            for (String word : words) {
                if (word.startsWith("@")) {
                    try {
                        String username = word.substring(1).replaceAll(("[^a-zA-Z0-9]*$"), "");
                        ApplicationUser mentionedUser = userService.getUserByUsername(username);
                        mentionedUsers.add(mentionedUser);
                    } catch (Exception e) {
                    }
                }
            }

            if (dto.getScheduled())
                p.setPostedDate(dto.getScheduledDate());
            else
                p.setPostedDate(LocalDateTime.now());

            // location details in post
            if (dto.getAddress() != null || dto.getProvinceCode() != null) {
                p.setAddress(dto.getAddress());
                p.setProvince(provinceService.findProvinceByID(dto.getProvinceCode()));
                p.setDistrict(districtService.findByCodeAndProvinceCode(dto.getDistrictCode(), dto.getProvinceCode()));
                p.setWard(wardService.findByCodeAndDistrictCode(dto.getWardCode(), dto.getDistrictCode()));
            }

            p.setAuthor(dto.getAuthor());
            p.setReplies(dto.getReplies());
            p.setScheduled(dto.getScheduled());
            p.setScheduledDate(dto.getScheduledDate());
            p.setAudience(dto.getAudience());
            p.setReplyRestriction(dto.getReplyRestriction());

            //upload the images that got passed
            List<Image> postImages = new ArrayList<>();

            for (int i = 0; i < files.size(); i++) {
                Image postImage = imageService.uploadImage(files.get(i), "post");
                postImages.add(postImage);
            }
            p.setImages(postImages);

            Post posted = postRepository.save(p);
            notificationService.createAndSendPostNotifications(posted);
            mentionedUsers.forEach(mentionUser
                    -> notificationService.createAndSendNotifications(NotificationType.MENTION,
                    mentionUser, posted.getAuthor(), posted, null));
//            return posted;
            return postMapper.convertToDTO(posted);
        } catch (Exception e) {
            e.printStackTrace();
            //throw new UnableToCreatePostException();
        }
        return null;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public PostDTO getPostDTOById(Integer id) {
        //TODO: setup custom exception for post that does not exist
        Post post = postRepository.findById(id).orElseThrow(PostDoesNotExistException::new);
        return postMapper.convertToDTO(post);
    }

    public Post getPostEntityById(Integer id) {
        return postRepository.findById(id).orElseThrow(PostDoesNotExistException::new);
    }

    public Set<PostDTO> getAllPostsByAuthor(ApplicationUser author) {
        return postRepository.findByAuthorOrderByPostedDateDesc(author)
                .stream()
                .sorted() // Sort using the compareTo method
                .map(postMapper::convertToDTO)
                .collect(Collectors.toCollection(LinkedHashSet::new)); // Maintain order
    }

    public Set<PostDTO> getAllRepostPostsByUser(Integer userId) {
        ApplicationUser user = userService.getUserById(userId);
        return postRepository.findByRepostsOrderByPostedDateDesc(user).orElse(new HashSet<>())
                .stream()
                .sorted() // Sort using the compareTo method
                .map(postMapper::convertToDTO)
                .collect(Collectors.toCollection(LinkedHashSet::new)); // Maintain order
    }

    public List<UserReplyPostDTO> getAllReplyPostsByUser(Integer userId) {
        ApplicationUser user = userService.getUserById(userId);
        List<Post> listPosts = postRepository.findByAuthorOrderByPostedDateDesc(user)
                .stream()
                .sorted() // Sort using the compareTo method
                .toList();

        return listPosts.stream()
                // loc post là reply va lấy bài post gốc mà nó reply
                .filter(Post::isReply)
                .map(post -> {
                    UserReplyPostDTO userReplyPostDTO = new UserReplyPostDTO();
                    userReplyPostDTO.setPost(postMapper.convertToDTO(post));
                    userReplyPostDTO.setReplyTo(getPostDTOById(post.getReplyTo()));
                    return userReplyPostDTO;
                }).toList();
    }

    public Page<Post> getFeedPage(Integer userId, LocalDateTime sessionStart, Integer page) {
        Pageable pageable = PageRequest.of(page, Constants.FETCH_FEED_POST_PAGE_SIZE);

        return postRepository.findFeedPosts(userId, sessionStart, pageable);
    }

    @Transactional
    public void deletePostById(int id) {
        Post post = postRepository.findById(id).orElseThrow(PostDoesNotExistException::new);

        // Delete replies related to the post
        Set<Post> replies = post.getReplies();
        postRepository.deleteAll(replies);

        // Clear all relationships
        post.getLikes().clear();
        post.getReplies().clear();
        post.getViews().clear();
        post.getReposts().clear();
        post.getStars().clear();
        post.getImages().clear();

        postRepository.delete(post);
    }

    public Post replyToPost(CreateReplyDTO replyDTO) {
        CreatePostDTO postDTO = CreatePostDTO.builder()
                .content(replyDTO.getReplyContent())
                .author(replyDTO.getAuthor())
                .replies(new HashSet<>())
                .images(replyDTO.getImages())
                .scheduled(replyDTO.getScheduled())
                .scheduledDate(replyDTO.getScheduledDate())
                .audience(Audience.EVERYONE)
                .replyRestriction(ReplyRestriction.EVERYONE)
                .poll(replyDTO.getPoll())
                .build();

//        Post reply = createPost(postDTO);
        Post reply = postMapper.convertToEntity(createPost(postDTO));
        reply.setIsReply(true);
        reply.setReplyTo(replyDTO.getOriginalPost());

        Post original = postRepository.findById(replyDTO.getOriginalPost()).orElseThrow(UnableToCreatePostException::new);
        Set<Post> originalPostReplies = original.getReplies();
        originalPostReplies.add(reply);

        original.setReplies(originalPostReplies);

        postRepository.save(original);
        Post savedReply = postRepository.save(reply);
        notificationService.createAndSendNotifications(NotificationType.REPLY,
                original.getAuthor(), savedReply.getAuthor(), original, savedReply);
        return savedReply;
    }

    public Post createReplyWithMedia(String reply, List<MultipartFile> files) {
        CreateReplyDTO dto = new CreateReplyDTO();
        ObjectMapper mapper = new ObjectMapper();

        try {
            dto = mapper.readValue(reply, CreateReplyDTO.class);

            CreatePostDTO postDTO = CreatePostDTO.builder()
                    .content(dto.getReplyContent())
                    .author(dto.getAuthor())
                    .replies(new HashSet<>())
                    .images(dto.getImages())
                    .scheduled(dto.getScheduled())
                    .scheduledDate(dto.getScheduledDate())
                    .audience(Audience.EVERYONE)
                    .replyRestriction(ReplyRestriction.EVERYONE)
                    .poll(dto.getPoll())
                    .build();

//            Post replyPost = createPost(postDTO);
            Post replyPost = postMapper.convertToEntity(createPost(postDTO));
            replyPost.setIsReply(true);
            replyPost.setReplyTo(dto.getOriginalPost());

            Post original = postRepository.findById(dto.getOriginalPost()).orElseThrow(UnableToCreatePostException::new);
            Set<Post> originalPostReplies = original.getReplies();
            originalPostReplies.add(replyPost);
            original.setReplies(originalPostReplies);
            postRepository.save(original);

            //upload the images that got passed
            List<Image> postImages = new ArrayList<>();
            for (int i = 0; i < files.size(); i++) {
                Image postImage = imageService.uploadImage(files.get(i), "reply-post");
                postImages.add(postImage);
            }
            replyPost.setImages(postImages);

            Post savedReply = postRepository.save(replyPost);
            notificationService.createAndSendNotifications(NotificationType.REPLY,
                    original.getAuthor(), savedReply.getAuthor(), original, savedReply);
            return savedReply;
        } catch (Exception e) {
            throw new UnableToCreatePostException();
        }
    }

    @Transactional
    public PostDTO updatePost(int id, CreatePostDTO postDTO) {
        Post post = postRepository.findById(id).orElseThrow(PostDoesNotExistException::new);

        post.setContent(postDTO.getContent());
        post.setScheduled(postDTO.getScheduled());
        post.setScheduledDate(postDTO.getScheduledDate());
        post.setAudience(postDTO.getAudience());
        post.setReplyRestriction(postDTO.getReplyRestriction());

        // Update images
        if (postDTO.getImages() != null) {
            post.setImages(postDTO.getImages());
        }

        if (postDTO.getPoll() != null) {
            Poll savedPoll = pollService.generatePoll(postDTO.getPoll());
            post.setPoll(savedPoll);
        }

        // Update location details
        if (postDTO.getAddress() != null || postDTO.getProvinceCode() != null) {
            post.setAddress(postDTO.getAddress());
            post.setProvince(provinceService.findProvinceByID(postDTO.getProvinceCode()));
            post.setDistrict(districtService.findByCodeAndProvinceCode(postDTO.getDistrictCode(), postDTO.getProvinceCode()));
            post.setWard(wardService.findByCodeAndDistrictCode(postDTO.getWardCode(), postDTO.getDistrictCode()));
        }

        Post updatedPost = postRepository.save(post);
        return postMapper.convertToDTO(updatedPost);
    }

    @Transactional
    public PostDTO repostPost(Integer postId, String token) {
        Post post = postRepository.findById(postId).orElseThrow(PostDoesNotExistException::new);
        String username = tokenService.getUsernameFromToken(token);
        ApplicationUser user = userService.getUserByUsername(username);

        Set<ApplicationUser> reposts = post.getReposts();
        if (reposts.contains(user)) {
            reposts.remove(user);
        } else {
            reposts.add(user);
            notificationService.createAndSendNotifications(NotificationType.REPOST, post.getAuthor(), user, post, null);
        }
        post.setReposts(reposts);
        post = postRepository.save(post);
        return postMapper.convertToDTO(post);
    }

    @Transactional
    public PostDTO likePost(Integer postId, String token) {
        Post post = postRepository.findById(postId).orElseThrow(PostDoesNotExistException::new);
        String username = tokenService.getUsernameFromToken(token);
        ApplicationUser user = userService.getUserByUsername(username);

        Set<ApplicationUser> likes = post.getLikes();
        if (likes.contains(user)) {
            likes.remove(user);
        } else {
            likes.add(user);
            notificationService.createAndSendNotifications(NotificationType.LIKE, post.getAuthor(), user, post, null);
        }
        post.setLikes(likes);
        post = postRepository.save(post);
        return postMapper.convertToDTO(post);
    }

    @Transactional
    public PostDTO giveStarToPost(Integer postId, String token) {
        Post post = postRepository.findById(postId).orElseThrow(PostDoesNotExistException::new);
        String username = tokenService.getUsernameFromToken(token);
        ApplicationUser user = userService.getUserByUsername(username);

        Set<ApplicationUser> stars = post.getStars();
        if (stars.contains(user)) {
            stars.remove(user);
        } else {
            stars.add(user);
            notificationService.createAndSendNotifications(NotificationType.STAR, post.getAuthor(), user, post, null);
        }
        post.setStars(stars);
        post = postRepository.save(post);
        return postMapper.convertToDTO(post);
    }

    @Transactional
    public synchronized PostDTO viewPost(Integer postId, String token) {
        String username = tokenService.getUsernameFromToken(token);
        ApplicationUser user = userService.getUserByUsername(username);

        Post post = postRepository.findById(postId).orElseThrow(PostDoesNotExistException::new);

        Set<ApplicationUser> views = post.getViews();

        boolean hasViewed = postRepository.hasUserViewedPost(postId, user.getUserId());
        if (!hasViewed) {
            views.add(user);
            post.setViews(views);
            post = postRepository.save(post);
            return postMapper.convertToDTO(post);
        }
        return postMapper.convertToDTO(post);
    }

    public List<Post> viewPosts(List<Integer> postIds, String token) {
        String username = tokenService.getUsernameFromToken(token);
        ApplicationUser user = userService.getUserByUsername(username);

        List<Post> posts = postRepository.findByPostIdIn(postIds).orElse(new ArrayList<>());

        List<Post> postToUpdate = posts.stream()
                .filter(post -> !post.getViews().contains(user))
                .map(post -> {
                    Set<ApplicationUser> views = post.getViews();
                    views.add(user);
                    post.setViews(views);
                    return post;
                })
                .toList();

        List<Post> updatedPosts = postRepository.saveAll(postToUpdate);

        posts.removeAll(updatedPosts);
        posts.addAll(updatedPosts);

        Collections.sort(posts);

        return posts;
    }

    public List<Post> getUsersLikes(Integer userId) {
        return postRepository.getUsersLikes(userId);
    }

    // publish schedule post
    @Transactional
    public void publishScheduledPosts() {
        LocalDateTime now = LocalDateTime.now();
        List<Post> scheduledPosts = postRepository.findAllByScheduledTrueAndScheduledDateBefore(now);

        for (Post post : scheduledPosts) {
            post.setScheduled(false);
            post.setPostedDate(now);
            postRepository.save(post);
            notificationService.createAndSendPostNotifications(post);
        }
    }

    // ==== POST STATISTICS

    public int countPostByUser(int userId) {
        return postRepository.countPostByUser(userId);
    }

    public void disable(Post post) {
        if (!post.isBan()) {
            post.setIsBan(true);
        } else {
            post.setIsBan(false);
        }
        postRepository.save(post);
    }


    Calendar now = Calendar.getInstance();
    int year = now.get(Calendar.YEAR);

    // -lấy tổng số bài đăng theo ngày
    public int getTotalPostByDay(int day, int month) {
        return postRepository.getTotalPostByDay(day, month, year);
    }

    // -lấy tổng số bài đăng theo tháng
    // lastest update 14-10
    public int getTotalPostByMonth(int month) {
        return postRepository.getTotalPostByMonth(month, year);
    }

    // -lấy tổng số bài đăng theo năm
    public int getTotalPostByYear(int year) {
        return postRepository.getTotalPostByYear(year);
    }

    //Top 5 bài đăng có lượt yêu thích nhiều stars và like nhất
    public List<Object[]> getTop5PostsByStarsAndLikesCurrentMonth() {
        return postRepository.getTop5PostsByStarsAndLikesCurrentMonth();
    }

    //Tổng số bài đăng theo từng tháng
    public List<Object[]> getTotalPostEveryMonth() {
        return postRepository.getTotalPostEveryMonth(year);
    }
}
