package com.nvd.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.*;

@AllArgsConstructor
//@NoArgsConstructor
@Getter
@Setter
@Entity
@Builder
@Table(name = "users")
public class ApplicationUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    private String firstName;
    private String lastName;
    private String phone;
    @Column(unique = true)
    private String email;
    @Column(name = "dob")
    private Date dateOfBirth;
    @Column(unique = true)
    private String username;
    @JsonIgnore
    private String password;

    private String bio;
    private String nickname;

    @Column(name = "create_ts")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTimestamp;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_picture", referencedColumnName = "image_id")
    private Image profilePicture;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "banner_picture", referencedColumnName = "image_id")
    private Image bannerPicture;

    @Column(name = "verified_account")
    private Boolean verifiedAccount;
    private Boolean enabled;
    private Boolean privateAccount;
    @JsonIgnore
    private Long verification;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Image organization;

    @Column(name = "location", length = 30)
    private String location;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "following",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "following_id")
    )
    @JsonIgnore
    private Set<ApplicationUser> following;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "followers",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    @JsonIgnore
    private Set<ApplicationUser> followers;

    // security related
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles_junction",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> authorities;  // set để không trùng role

    @JsonIgnore
    @OneToMany(mappedBy = "userSendReport")
    private List<UserReported> userSendReports;

    @JsonIgnore
    @OneToMany(mappedBy = "reportedUser")
    private List<UserReported> reportedUsers;

    public ApplicationUser() {
        this.createTimestamp = LocalDateTime.now();
        this.authorities = new HashSet<>();
        this.following = new HashSet<>();
        this.followers = new HashSet<>();
        this.reportedUsers = new ArrayList<>();
        this.userSendReports = new ArrayList<>();
        this.enabled = false;
    }

    public Boolean getVerifiedAccount() {
        if (verifiedAccount == null) {
            return false;
        }
        return verifiedAccount;
    }

    public Boolean getEnabled() {
        if (enabled == null) {
            return false;
        }
        return enabled;
    }

    public Boolean getPrivateAccount() {
        if (privateAccount == null) {
            return false;
        }
        return privateAccount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ApplicationUser that = (ApplicationUser) o;
        return Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId);
    }
}