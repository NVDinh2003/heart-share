package com.nvd.service;

import com.nvd.dto.FindUsernameDTO;
import com.nvd.exceptions.*;
import com.nvd.models.ApplicationUser;
import com.nvd.models.Image;
import com.nvd.models.RegistrationObject;
import com.nvd.models.Role;
import com.nvd.repositories.RoleRepository;
import com.nvd.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final ImageService imageService;

    public ApplicationUser registerUser(RegistrationObject ro) {
        ApplicationUser user = new ApplicationUser();
        user.setFirstName(ro.getFirstName());
        user.setLastName(ro.getLastName());
        user.setEmail(ro.getEmail());
        user.setDateOfBirth(ro.getDob());

        String name = user.getFirstName() + user.getLastName();
        boolean nameTaken = true;
        String tempName = "";
        while (nameTaken) {
            tempName = generateUserName(name);
            if (userRepository.findByUsername(tempName).isEmpty()) {
                nameTaken = false;
            }
        }
        user.setUsername(tempName);

        Set<Role> roles = user.getAuthorities();
        if (roleRepository.findByAuthority("USER").isPresent()) {
            roles.add(roleRepository.findByAuthority("USER").get());
            user.setAuthorities(roles);
        }

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            throw new EmailAlreadyTakenException();
        }

    }

    private String generateUserName(String name) {
        long genarateNumber = (long) Math.floor(Math.random() * 1_000_000_000);
        return name + genarateNumber;
    }

    public ApplicationUser getUserById(Integer userId) {
        return userRepository.findById(userId).orElseThrow(UserDoesNotExistException::new);
    }

    public ApplicationUser getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(UserDoesNotExistException::new);
    }

    public ApplicationUser update(ApplicationUser user) {
        try {
            return userRepository.save(user);
        } catch (Exception e) {
            throw new EmailAlreadyTakenException();
        }
    }

    public void generateEmailVerification(String username) {
        ApplicationUser user = userRepository.findByUsername(username).orElseThrow(UserDoesNotExistException::new);
        user.setVerification(generateVerificationNumber());

        try {
            mailService.sendMail(user.getEmail(), "Your verification code", "Here is your verification code: " + user.getVerification());
            userRepository.save(user);
        } catch (Exception e) {
            throw new EmailFaildToSendException();
        }
        userRepository.save(user);
    }

    public ApplicationUser verifyEmail(String username, Long code) {
        ApplicationUser user = userRepository.findByUsername(username).orElseThrow(UserDoesNotExistException::new);

        if (code.equals(user.getVerification())) {
            user.setEnabled(true);
            user.setVerification(null);
            return userRepository.save(user);
        } else {
            throw new IncorrectVerificationCodeException();
        }
    }

    public ApplicationUser setPassword(String username, String password) {
        ApplicationUser user = userRepository.findByUsername(username).orElseThrow(UserDoesNotExistException::new);

        String encodedPassword = passwordEncoder.encode(password);
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }

    private Long generateVerificationNumber() {
        return (long) Math.floor(Math.random() * 100_000_000);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        ApplicationUser u = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Set<GrantedAuthority> authorities = u.getAuthorities()
                .stream()
                .map(role -> new SimpleGrantedAuthority(role.getAuthority()))
                .collect(Collectors.toSet());

        UserDetails userDetails = new User(u.getUsername(), u.getPassword(), authorities);

        return userDetails;
    }

    public ApplicationUser setProfileOrBannerPicture(String username, MultipartFile file, String prefix)
            throws UnableToSavePhotoException {
        ApplicationUser user = userRepository.findByUsername(username).orElseThrow(UserDoesNotExistException::new);

        Image image = imageService.uploadImage(file, prefix);

        if (prefix.equals("pfp")) {
            user.setProfilePicture(image);
        } else {
            user.setBannerPicture(image);
        }

        return userRepository.save(user);
    }

    public byte[] setUserOrganization(String username, MultipartFile file, String organizationName)
            throws UnableToResolvePhotoException {
        ApplicationUser user = userRepository.findByUsername(username).orElseThrow(UserDoesNotExistException::new);

        Image orgImg = imageService.getImageByImageName(organizationName).orElseGet(() -> {
            try {
                return imageService.createOrganization(file, organizationName);
            } catch (UnableToSavePhotoException e) {
                throw null;
            }
        });

        if (orgImg != null) {
            user.setOrganization(orgImg);
            userRepository.save(user);
            try {
                return Files.readAllBytes(new File(orgImg.getImagePath()).toPath());
            } catch (IOException e) {
                throw new UnableToResolvePhotoException();
            }
        } else {
            throw new UnableToResolvePhotoException("We were unable to find or save the photo. Please try again.");
        }
    }

    public Set<ApplicationUser> followUser(String user, String followee) {
        ApplicationUser loggedInUser = userRepository.findByUsername(user).orElseThrow(UserDoesNotExistException::new);

        Set<ApplicationUser> followingList = loggedInUser.getFollowing();
        ApplicationUser followedUser = userRepository.findByUsername(followee).orElseThrow(UserDoesNotExistException::new);

        Set<ApplicationUser> followersList = followedUser.getFollowers();

        // Add the followed user to the following list
        followingList.add(followedUser);
        loggedInUser.setFollowing(followingList);

        // Add the current user to the followers list of the followee
        followersList.add(loggedInUser);
        followedUser.setFollowers(followersList);

        // Save both users
        userRepository.save(loggedInUser);
        userRepository.save(followedUser);

        return loggedInUser.getFollowing();
    }

    public Set<ApplicationUser> retrieveFollowingList(String username) {
        ApplicationUser user = userRepository.findByUsername(username).orElseThrow(UserDoesNotExistException::new);
        return user.getFollowing();
    }

    public Set<ApplicationUser> retrieveFollowersList(String username) {
        ApplicationUser user = userRepository.findByUsername(username).orElseThrow(UserDoesNotExistException::new);
        return user.getFollowers();
    }

    public String verifyUsername(FindUsernameDTO credential) {
        ApplicationUser user = userRepository.findByEmailOrPhoneOrUsername(
                        credential.getEmail(), credential.getPhone(),
                        credential.getUsername())
                .orElseThrow(UserDoesNotExistException::new);
        return user.getUsername();
    }

    public ApplicationUser getUsersEmailAndPhone(FindUsernameDTO credential) {
        return userRepository.findByEmailOrPhoneOrUsername(
                        credential.getEmail(), credential.getPhone(),
                        credential.getUsername())
                .orElseThrow(UserDoesNotExistException::new);
    }
}
