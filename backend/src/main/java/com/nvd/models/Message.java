package com.nvd.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nvd.models.enums.MessageType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@AllArgsConstructor
@Getter
@Setter
@Entity
@Builder
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "message_id")
    private Integer messageId;

    @Enumerated(EnumType.ORDINAL)
    @Column(name = "message_type")
    private MessageType messageType;

    @ManyToOne
    @JoinColumn(name = "sent_by")
    private ApplicationUser sentBy;

    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    @JsonIgnore
    private Conversation conversation;

    @Column(name = "message_text", length = 2056)
    private String messageText;

    @Column(name = "sent_at")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:sss")
    private LocalDateTime sentAt;

    @ManyToMany
    @JoinTable(
            name = "message_seen_by",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "message_id")
    )
    private Set<ApplicationUser> seenBy;

    @Column(name = "message_image", nullable = true)
    private String messageImage;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "message_reply_to", referencedColumnName = "message_id")
    private Message replyTo;

    @ManyToMany
    @JoinTable(
            name = "message_reactions_junction",
            joinColumns = @JoinColumn(name = "reaction_id"),
            inverseJoinColumns = @JoinColumn(name = "message_id")
    )
    private Set<MessageReaction> reactions;

    @ManyToMany
    @JoinTable(
            name = "message_hidden_by",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "message_id")
    )
    private Set<ApplicationUser> hiddenBy;

    public Message() {
        this.seenBy = new HashSet<>();
//        this.sentAt = LocalDateTime.now();
        this.hiddenBy = new HashSet<>();
        this.reactions = new HashSet<>();
    }

    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Message message = (Message) o;
        return Objects.equals(messageId, message.messageId) && messageType == message.messageType && Objects.equals(sentBy, message.sentBy) && Objects.equals(conversation, message.conversation) && Objects.equals(messageText, message.messageText) && Objects.equals(sentAt, message.sentAt) && Objects.equals(seenBy, message.seenBy) && Objects.equals(messageImage, message.messageImage) && Objects.equals(replyTo, message.replyTo) && Objects.equals(reactions, message.reactions) && Objects.equals(hiddenBy, message.hiddenBy);
    }

    @Override
    public int hashCode() {
        return Objects.hash(messageId, messageType, sentBy, conversation, messageText, sentAt, seenBy, messageImage, replyTo, reactions, hiddenBy);
    }
}
