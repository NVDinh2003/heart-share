package com.nvd.dto.response;

import com.nvd.models.Conversation;
import com.nvd.models.Notification;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReadMessageResponseDTO {
    private List<MessageDTO> readMessages;
    private Conversation conversation;
    private List<Notification> notifications;

}
