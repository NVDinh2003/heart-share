package com.nvd.dto.request.message;

import com.nvd.models.ApplicationUser;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageReactDTO {

    private ApplicationUser user;
    private Integer messageId;
    private String reaction;
}
