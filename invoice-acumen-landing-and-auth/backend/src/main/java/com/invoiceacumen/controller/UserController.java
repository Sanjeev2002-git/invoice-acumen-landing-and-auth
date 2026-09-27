package com.invoiceacumen.controller;

import com.invoiceacumen.dto.ApiResponse;
import com.invoiceacumen.dto.AuthResponse;
import com.invoiceacumen.dto.ChangePasswordRequest;
import com.invoiceacumen.dto.ProfileSummary;
import com.invoiceacumen.dto.UpdateProfileRequest;
import com.invoiceacumen.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/me")
    public ApiResponse<AuthResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        return ApiResponse.ok("Profile updated successfully",
                userService.updateMyProfile(authentication.getName(), request));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AuthResponse> updateMyAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        return ApiResponse.ok("Profile picture updated successfully",
                userService.updateMyAvatar(authentication.getName(), file));
    }

    @PutMapping("/me/password")
    public ApiResponse<Void> changeMyPassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        userService.changeMyPassword(authentication.getName(), request);
        return ApiResponse.ok("Password updated successfully", null);
    }

    @GetMapping("/me/summary")
    public ApiResponse<ProfileSummary> getMyProfileSummary(Authentication authentication) {
        return ApiResponse.ok(userService.getMyProfileSummary(authentication.getName()));
    }
}
