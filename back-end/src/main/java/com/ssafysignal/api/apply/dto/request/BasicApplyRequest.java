package com.ssafysignal.api.apply.dto.request;

import io.swagger.annotations.ApiModel;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ApiModel(value = "ApplyBasicRequest", description = "지원서 등록, 수정을 위한 정보")
public class BasicApplyRequest {
    @Schema(description = "지원서 작성자 Seq", example = "1", required = true)
    private Integer userSeq;
    @Schema(description = "지원서 내용", example = "저는 프로젝트 팀 구하는 게 힘들었던 경험이 있어 이 프로젝트에 지원합니다.", required = true)
    private String content;
    @Schema(description = "포지션 코드", example = "PO100", required = true)
    private String positionCode;
    @Schema(description = "사전 미팅 seq", example = "123", required = true)
    private Integer postingMeetingSeq;
    @Schema(description = "지원자의 경력 리스트")
    private List<String> applyCareerList;
    @Schema(description = "지원자의 이전 프로젝트 리스트", example = "applyExp")
    private List<String> applyExpList;
    @Schema(description = "지원자의 기술 스택 리스트")
    private List<String> applySkillList;
    @Schema(description = "지원자의 사전 질문 답변")
    private List<Map<String, Object>> applyAnswerList;
}
