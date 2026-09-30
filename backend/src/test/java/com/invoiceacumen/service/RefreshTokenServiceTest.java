package com.invoiceacumen.service;

import com.invoiceacumen.entity.RefreshToken;
import com.invoiceacumen.entity.User;
import com.invoiceacumen.repository.RefreshTokenRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RefreshTokenServiceTest {

    @Test
    void persistsOnlyADigestButLooksUpUsingTheRawToken() {
        RefreshTokenRepository repository = mock(RefreshTokenRepository.class);
        RefreshTokenService service = new RefreshTokenService(repository);
        User user = new User();
        user.setId(8L);
        when(repository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String rawToken = service.createRefreshToken(user);

        org.mockito.ArgumentCaptor<RefreshToken> saved = org.mockito.ArgumentCaptor.forClass(RefreshToken.class);
        verify(repository).save(saved.capture());
        assertNotEquals(rawToken, saved.getValue().getToken());

        when(repository.findByToken(saved.getValue().getToken())).thenReturn(Optional.of(saved.getValue()));
        assertEquals(saved.getValue(), service.findByToken(rawToken));
    }

    @Test
    void revokesAllTokensForAUser() {
        RefreshTokenRepository repository = mock(RefreshTokenRepository.class);
        RefreshTokenService service = new RefreshTokenService(repository);

        service.revokeAllForUser(8L);

        verify(repository).deleteByUserId(eq(8L));
    }
}
