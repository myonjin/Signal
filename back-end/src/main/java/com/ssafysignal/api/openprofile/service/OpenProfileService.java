package com.ssafysignal.api.openprofile.service;

import com.ssafysignal.api.global.exception.NotFoundException;
import com.ssafysignal.api.global.response.ResponseCode;
import com.ssafysignal.api.openprofile.dto.response.FindAllReq;
import com.ssafysignal.api.openprofile.entity.OpenProfile;
import com.ssafysignal.api.openprofile.repository.OpenProfileRepository;
import com.ssafysignal.api.profile.dto.response.ProfileBasicResponse;
import com.ssafysignal.api.profile.service.ProfileService;
import com.ssafysignal.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OpenProfileService {
    private final OpenProfileRepository openProfileRepository;
    private final UserRepository userRepository;
    private final ProfileService profileService;

    @Transactional
    public void registOpenProfile(int userSeq){
        userRepository.findByUserSeq(userSeq)
            .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));

        if(openProfileRepository.findByUserSeq(userSeq) !=null)
                throw new NotFoundException(ResponseCode.REGIST_ALREADY);
        OpenProfile openProfile = OpenProfile.builder()
                .userSeq(userSeq)
                .build();
        openProfileRepository.save(openProfile);
    }

    @Transactional(readOnly = true)
    public List<FindAllReq> findAllOpenProfile(int size, int page){
        Page<OpenProfile> openProfileList = openProfileRepository.findAll(PageRequest.of(page - 1, size, Sort.Direction.DESC, "openProfileSeq"));
        List<FindAllReq> profileList = new ArrayList<>();
        for(OpenProfile openProfile : openProfileList){
            int userSeq = openProfile.getUserSeq();
            ProfileBasicResponse profileBasic =profileService.findProfile(userSeq);
            FindAllReq profile = FindAllReq.builder()
                    .userSeq(userSeq)
                    .regDt(openProfile.getRegDt())
                    .userPositionList(profileBasic.getUserPositionList())
                    .userSkillList(profileBasic.getUserSkillList())
                    .userCareerList(profileBasic.getUserCareerList())
                    .userExpList(profileBasic.getUserExpList())
                    .build();
            profileList.add(profile);
        }
        return profileList;

    }
}
