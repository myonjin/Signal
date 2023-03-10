package com.ssafysignal.api.auth.service;

import com.ssafysignal.api.auth.dto.request.FindEmailRequest;
import com.ssafysignal.api.auth.dto.response.LoginResponse;
import com.ssafysignal.api.auth.entity.Auth;
import com.ssafysignal.api.auth.entity.UserAuth;
import com.ssafysignal.api.auth.repository.AuthRepository;
import com.ssafysignal.api.auth.repository.UserAuthRepository;
import com.ssafysignal.api.common.dto.EmailDto;
import com.ssafysignal.api.common.service.EmailService;
import com.ssafysignal.api.global.exception.NotFoundException;
import com.ssafysignal.api.global.exception.UnAuthException;
import com.ssafysignal.api.global.jwt.JwtExpirationEnums;
import com.ssafysignal.api.global.jwt.JwtTokenUtil;
import com.ssafysignal.api.global.jwt.TokenInfo;
import com.ssafysignal.api.global.jwt.UserCodeEnum;
import com.ssafysignal.api.global.redis.LogoutAccessToken;
import com.ssafysignal.api.global.redis.LogoutAccessTokenRedisRepository;
import com.ssafysignal.api.global.redis.RefreshToken;
import com.ssafysignal.api.global.redis.RefreshTokenRedisRepository;
import com.ssafysignal.api.global.response.ResponseCode;
import com.ssafysignal.api.user.entity.User;
import com.ssafysignal.api.user.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthRepository authRepository;
    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;
    private final EmailService emailService;
    private final JwtTokenUtil jwtTokenUtil;
    private final RefreshTokenRedisRepository refreshTokenRedisRepository;
    private final LogoutAccessTokenRedisRepository logoutAccessTokenRedisRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${server.host}")
    private String host;

    @Transactional
    public LoginResponse login(String email, String password) throws RuntimeException {
        // ????????? ???????????? ??????
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));
        if (!passwordEncoder.matches(password, user.getPassword())) throw new IllegalArgumentException("??????????????? ?????? ????????????.");

        // ????????? ?????? ?????? ??????
        Auth auth = authRepository.findTop1ByUserSeqAndAuthCodeOrderByRegDtDesc(user.getUserSeq(),"AU101")
                .orElseThrow(() -> new NotFoundException(ResponseCode.UNAUTHORIZED));
        if (!auth.isAuth()) throw new NotFoundException(ResponseCode.UNAUTHORIZED);


        // ?????? ????????? ?????? ??????
        // ?????? ???????????? ????????? ????????? ?????? accessToken ????????? ???????????? ???????????? ???????????? (?????? ????????? ??????)
        if (refreshTokenRedisRepository.findById(email).isPresent()){
            try {
                RefreshToken redisRefreshToken = refreshTokenRedisRepository.findById(email).get();
                String accessToken = redisRefreshToken.getAccessToken();
                long remainMilliSeconds = jwtTokenUtil.getRemainMilliSeconds(accessToken);
                logoutAccessTokenRedisRepository.save(LogoutAccessToken.of(accessToken, email, remainMilliSeconds));
            } catch (ExpiredJwtException e) {
                e.printStackTrace();
            } finally {
                refreshTokenRedisRepository.deleteById(email);
            }
        }

        // ?????? ?????? ??????
        String accessToken = jwtTokenUtil.generateAccessToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenRedisRepository.save(
                RefreshToken.createRefreshToken(user.getEmail(),
                accessToken,
                jwtTokenUtil.generateRefreshToken(user.getEmail()),
                JwtExpirationEnums.REFRESH_TOKEN_EXPIRATION_TIME.getValue()));

        // ??????
        UserAuth userAuth = userAuthRepository.findByUser(user)
                .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));

        return LoginResponse.builder()
                .userSeq(user.getUserSeq())
                .name(user.getName())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .accessToken(accessToken)
                .refreshToken(refreshToken.getRefreshToken())
                .isAdmin(userAuth.getRole().equals("ADMIN") ? true : false)
                .build();
    }

    @Transactional
    public LoginResponse reissue (String refreshToken) throws RuntimeException {
        refreshToken = refreshToken.substring(7);

        String email =jwtTokenUtil.getUsername(refreshToken);

        RefreshToken redisRefreshToken = refreshTokenRedisRepository.findById(email)
                .orElseThrow(() -> new UnAuthException(ResponseCode.TOKEN_NOT_FOUND));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));

        // ???????????? ???????????? ????????? ????????????
        if (refreshToken.equals(redisRefreshToken.getRefreshToken())){
            // ????????? ?????? ??????
            String accessToken = jwtTokenUtil.generateAccessToken(email);
            // ???????????? ????????? ??????????????????
//            if (jwtTokenUtil.getRemainMilliSeconds(refreshToken) <= 0) {
//                refreshToken = jwtTokenUtil.generateRefreshToken(email);
//            }
            redisRefreshToken.setAccessToken(accessToken);
            refreshTokenRedisRepository.save(redisRefreshToken);

            return LoginResponse.builder()
                    .userSeq(user.getUserSeq())
                    .name(user.getName())
                    .email(user.getEmail())
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();
        }

        throw new UnAuthException(ResponseCode.INVALID_TOKEN);
    }

    @CacheEvict(value = "user", key = "#email")
    public void logout(TokenInfo tokenInfo, String email) {
        String accessToken = tokenInfo.getAccessToken().substring(7);
        long remainMilliSeconds = jwtTokenUtil.getRemainMilliSeconds(accessToken);
        refreshTokenRedisRepository.deleteById(email);
        logoutAccessTokenRedisRepository.save(LogoutAccessToken.of(accessToken, email, remainMilliSeconds));
    }

    @Transactional(readOnly = true)
    public void checkEmail(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public void checkNickname(String nickname) {
        userRepository.findByNickname(nickname)
                .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public String findEmail(FindEmailRequest findEmailRequest) {
        User user = userRepository.findByNameAndPhone(findEmailRequest.getName(), findEmailRequest.getPhone())
                .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));
        return user.getEmail();
    }

    @Transactional
    public void emailAuth(String authCode) throws RuntimeException {
        Auth auth = authRepository.findByCodeAndIsAuth(authCode, false)
                // ????????? ?????? ???????????? ????????? ?????? ??????
                .orElseThrow(() -> new UnAuthException(ResponseCode.ALREADY_AUTH));
        auth.setAuth(true);
        auth.setAuthDt(LocalDateTime.now());
        authRepository.save(auth);

        UserAuth userAuth = UserAuth.builder()
                .role(UserCodeEnum.USER.getCode())
                .user(User.builder()
                .userSeq(auth.getUserSeq())
                .build())
                .build();

        // ?????? ?????? ?????? ("USER")
        userAuthRepository.save(userAuth);
    }

    @Transactional
    public void findPassword(final String email) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));

        String authCode = UUID.randomUUID().toString();

        Auth auth = Auth.builder()
                .userSeq(user.getUserSeq())
                .authCode("AU100")
                .code(authCode)
                .build();

        // ?????? ?????? ??????
        authRepository.save(auth);

        // ????????? ?????? ????????? ??????
        emailService.sendMail(
                EmailDto.builder()
                        .receiveAddress(email)
                        .title("Signal ???????????? ?????? - ????????? ??????")
                        .content("?????? ????????? ???????????? ???????????? ??????????????????.")
                        .text("????????? ??????")
                        .host(host)
                        .url(String.format("/api/auth/password/%s", authCode))
                        .build());
    }

    @Transactional
    public void getPasswordByEmail(final String authCode) throws Exception {
        // ????????? ?????? ???????????? ????????? ?????? ??????
        Auth auth = authRepository.findByCodeAndIsAuth(authCode, false)
                .orElseThrow(() -> new NotFoundException(ResponseCode.ALREADY_AUTH));

        // ????????????
        auth.setAuth(true);
        auth.setAuthDt(LocalDateTime.now());
        authRepository.save(auth);

        //?????? ??????????????? ??????
        String tempPassword = UUID.randomUUID().toString().substring(0, 6);
        User user = userRepository.findByUserSeq(auth.getUserSeq())
                .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        //?????? ???????????? ??????
        emailService.sendMail(
                EmailDto.builder()
                        .receiveAddress(user.getEmail())
                        .title("Signal ?????? ?????? ??????")
                        .content("????????? ?????? ???????????? ?????????.\n?????? ???????????? : " + tempPassword)
                        .text("?????????")
                        .host(host)
                        .url("")
                        .build());
    }
}
