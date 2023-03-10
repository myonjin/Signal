package com.ssafysignal.api.project.service;

import com.ssafysignal.api.apply.entity.Apply;
import com.ssafysignal.api.apply.repository.ApplyRepository;
import com.ssafysignal.api.global.exception.NotFoundException;
import com.ssafysignal.api.global.response.ResponseCode;
import com.ssafysignal.api.posting.entity.PostingMeeting;
import com.ssafysignal.api.profile.entity.UserHeartLog;
import com.ssafysignal.api.profile.repository.UserHeartLogRepository;
import com.ssafysignal.api.project.dto.reponse.FindAllProjectResponse;
import com.ssafysignal.api.project.dto.reponse.FindAllProjectDto;
import com.ssafysignal.api.project.dto.reponse.FindProjectResponse;
import com.ssafysignal.api.project.dto.reponse.FindAllProjectUserHeartLogResponse;
import com.ssafysignal.api.project.entity.*;
import com.ssafysignal.api.project.repository.ProjectRepository;
import com.ssafysignal.api.project.repository.ProjectUserHeartLogRepository;
import com.ssafysignal.api.project.repository.ProjectUserRepository;
import com.ssafysignal.api.user.entity.User;
import com.ssafysignal.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectUserRepository projectUserRepository;
    private final ApplyRepository applyRepository;
    private final ProjectUserHeartLogRepository projectUserHeartLogRepository;
    private final UserRepository userRepository;
    private final UserHeartLogRepository userHeartLogRepository;


    @Transactional
    public void registProject(Integer postingSeq) throws RuntimeException {
        Project project = projectRepository.findByPostingSeq(postingSeq)
                .orElseThrow(() -> new NotFoundException(ResponseCode.REGIST_NOT_FOUNT));

        // ?????? ?????? ?????? ?????? ?????????
        for (PostingMeeting postingMeeting : project.getPosting().getPostingMeetingList()) {
            postingMeeting.setPostingMeetingCode("PM101");
        }

        // ????????? ???????????? ?????? ??????
        List<Apply> applyList = applyRepository.findByPostingSeq(postingSeq);
        for (Apply apply : applyList) {
            // ?????????
            if (apply.getApplyCode().equals("AS101")){
                project.getProjectUserList().add(ProjectUser.fromEntity(apply));
            }
            apply.setStateCode("PAS109");
            apply.setApplyCode("AS109");
            applyRepository.save(apply);
        }

        // ???????????? ????????? ??? ?????? ??? ??????
        Map<String, Integer> positionCount = new HashMap<>();
        for (ProjectUser user : project.getProjectUserList()) {
            String code = user.getPositionCode();
            if (positionCount.get(code) == null){
                positionCount.put(code, 1);
            } else {
                positionCount.put(code, positionCount.get(code) + 1);
            }
        }

        project.getProjectPositionList().clear();
        for (String key : positionCount.keySet()) {
            project.getProjectPositionList().add(ProjectPosition.builder()
                    .projectSeq(project.getProjectSeq())
                    .positionCode(key)
                    .positionCnt(positionCount.get(key))
                    .build());
        }

        // ???????????? "?????????" PS100
        project.setProjectCode("PS100");
        // ?????? "?????? ??????" PPS101
        project.getPosting().setPostingCode("PPS101");
        // ???????????? ?????? ????????? ??????
        project.setEvaluationDt(LocalDate.now().plusDays(7));
        projectRepository.save(project);

        for (ProjectUser projectUser : project.getProjectUserList()) {
            if (!projectUser.isLeader()) {
                projectUserHeartLogRepository.save(ProjectUserHeartLog.builder()
                        .projectUserSeq(projectUser.getProjectUserSeq())
                        .heartCnt(100)
                        .content(project.getSubject() + " ???????????? ??????")
                        .build());
            }
        }
    }

    @Transactional(readOnly = true)
    public FindAllProjectResponse findAllProject(Integer userSeq) {
        List<Project> endProjectList = projectRepository.findAll(ProjectSpecification.byUserSeq(userSeq, "PS101"));
        List<Project> ingProjectList = projectRepository.findAll(ProjectSpecification.byUserSeq(userSeq, "PS100"));

        return FindAllProjectResponse.builder()
                .endProjectList(endProjectList.stream()
                        .map(FindAllProjectDto::fromEntity)
                        .collect(Collectors.toList()))
                .ingProjectList(ingProjectList.stream()
                        .map(FindAllProjectDto::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public FindProjectResponse findProject(Integer userSeq, Integer projectSeq) throws RuntimeException {
        Project project = projectRepository.findById(projectSeq)
                .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));

        List<ProjectUser> projectUserList = projectUserRepository.findByProjectSeq(projectSeq);
        if (projectUserList.size() == 0) throw new NotFoundException(ResponseCode.NOT_FOUND);

        ProjectUser projectUser = projectUserRepository.findByUserSeqAndProjectSeq(userSeq, projectSeq)
                .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));

        FindProjectResponse findProjectResponse = FindProjectResponse.fromEntity(project);
        findProjectResponse.setProjectUserList(projectUserList.stream()
                .map(user -> new HashMap<String, Object>() {{
                    put("userSeq", user.getUserSeq());
                    put("projectUserSeq", user.getProjectUserSeq());
                    put("nickname", user.getUser().getNickname());
                    put("userImageUrl", user.getUser().getImageFile());
                }})
                .collect(Collectors.toList()));

        findProjectResponse.setHeartCnt(projectUser.getHeartCnt());
        findProjectResponse.setWarningCnt(projectUser.getWarningCnt());
        findProjectResponse.setIsMyProject(userSeq.equals(project.getPosting().getUserSeq()));

        return findProjectResponse;
    }

    @Transactional
    public void finishProject(Integer projectSeq) throws RuntimeException {
        Project project = projectRepository.findById(projectSeq)
                .orElseThrow(() -> new NotFoundException(ResponseCode.MODIFY_NOT_FOUND));
        project.setProjectCode("PS101");

        List<ProjectUser> projectUserList = projectUserRepository.findByProjectSeq(projectSeq);

        for (ProjectUser projectUser:projectUserList) {

            // global user ????????????
            User user = projectUser.getUser();

            userHeartLogRepository.save(UserHeartLog.builder()
                    .userSeq(user.getUserSeq())
                    .heartCnt(projectUser.getHeartCnt())
                    .content(project.getSubject()+" ????????? ?????? ????????? ??????")
                    .build());

            // global user??? ???????????? ????????????
            user.setHeartCnt(user.getHeartCnt() + projectUser.getHeartCnt());

            // project user??? ?????? ????????? ????????? ?????? ?????? ?????? ??? ??????
            projectUserHeartLogRepository.save(ProjectUserHeartLog.builder()
                    .projectUserSeq(projectUser.getProjectUserSeq())
                    .heartCnt(-projectUser.getHeartCnt())
                    .content(project.getSubject()+" ????????? ?????? ????????? ??????")
                    .build());

            // project user??? ?????? 0?????? ?????????
            projectUser.setHeartCnt(0);

            // projectUser, globalUser ??????
            userRepository.save(user);
            projectUserRepository.save(projectUser);
        }

        projectRepository.save(project);
    }

    @Transactional
    public FindAllProjectUserHeartLogResponse findAllProjectUserHeartLog(Integer userSeq, Integer projectSeq) {
        Integer projectUserSeq = projectUserRepository.findByUserSeqAndProjectSeq(userSeq, projectSeq).orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND)).getProjectUserSeq();
        List<ProjectUserHeartLog> projectUserHeartLogList = projectUserHeartLogRepository.findAllByProjectUserSeq(projectUserSeq, Sort.by(Sort.Order.desc("regDt")));
        return FindAllProjectUserHeartLogResponse.fromEntity(projectUserHeartLogList);
    }

    @Transactional
    public Integer findProjectUserHeartCnt(Integer userSeq, Integer projectSeq) {
        ProjectUser projectUser = projectUserRepository.findByUserSeqAndProjectSeq(userSeq, projectSeq).orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));
        return projectUser.getHeartCnt();
    }
}
