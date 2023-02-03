import React, { useState, useEffect } from 'react'
import '../../assets/styles/applyDetail.css'
import '../../assets/styles/skill.css'
import PostingDelete from 'components/Posting/PostingDelete'
import { Fielddata } from 'data/Fielddata'
import { Button } from '@mui/material'
import { Experimental_CssVarsProvider as CssVarsProvider, styled } from '@mui/material/styles'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Localdata from 'data/Localdata'
import { Box } from '@mui/system'
import SignalBtn from 'components/common/SignalBtn'
// import { useLocation } from 'react-router'

const ApplyModify = styled(Button)(({ theme }) => ({
  backgroundColor: '#574B9F',
  color: theme.vars.palette.common.white,
  '&:hover': {
    backgroundColor: theme.vars.palette.common.white,
    color: '#574B9F',
  },
}))

function PostingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  // console.log(id)
  // const location = useLocation()
  // const userSeq = location.state.userSeq
  // const applySeq = location.state.applySeq

  const postingSeq = id

  const [posting, setPosting] = useState()

  const postingGetFetch = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_API_URL + '/posting/' + postingSeq)
      setPosting(res.data.body)
      console.log(res.data.body)
      // console.log('applyFetch', res.data.body)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    postingGetFetch()
  }, [])

  return (
    <CssVarsProvider>
      <div className="apply-detail-container">
        <div className="apply-detail-width-section">
          <div className="apply-detail-project-name-section">
            <div>
              <div className="apply-detail-project-name-label">
                마감기한 : {posting ? posting.postingEndDt.slice(0, 10) : null}
              </div>
              <div className="apply-detail-project-title">{posting ? posting.subject : null}</div>
            </div>
            <div className="apply-detail-cancle-section">
              {posting && (
                <Link to={'/postingModify'} state={{ postingSeq: posting.postingSeq }}>
                  <ApplyModify variant="contained" startIcon={<ModeEditIcon />}>
                    공고 수정
                  </ApplyModify>
                </Link>
              )}
              <PostingDelete open={open} postingSeq={postingSeq}></PostingDelete>
            </div>
          </div>
          <hr className="apply-detail-hr" />
          <div className="apply-detail-application-section">
            <div className="apply-detail-name-position-section2">
              <div className="apply-detail-name-section">
                <div style={{ display: 'flex' }}>
                  <div className="apply-detail-label">프로젝트 기간</div>
                  <div className="apply-detail-text-value">{posting ? posting.term + ' 주' : null}</div>
                </div>
              </div>
              <div className="apply-detail-position-section">
                <div style={{ display: 'flex' }}>
                  <div className="apply-detail-label">분야</div>
                  <div className="apply-detail-text-value">{posting ? Fielddata[posting.fieldCode].name : null}</div>
                </div>
              </div>
            </div>
            <div className="apply-detail-name-position-section2">
              <div className="apply-detail-name-section">
                <div style={{ display: 'flex' }}>
                  <div className="apply-detail-label">진행 유형</div>
                  <div className="apply-detail-text-value">
                    {posting ? (posting.isContact ? '대면' : '비대면') : null}
                  </div>
                </div>
              </div>
              <div className="apply-detail-position-section">
                <div style={{ display: 'flex' }}>
                  <div className="apply-detail-label">진행 지역</div>
                  <div className="apply-detail-text-value">{posting ? Localdata[posting.localCode].name : null}</div>
                </div>
              </div>
            </div>
            <div className="apply-detail-name-position-section2">
              <div className="apply-detail-name-section">
                <div style={{ display: 'flex' }}>
                  <div className="apply-detail-label">난이도</div>
                  <div className="apply-detail-text-value">Level : {posting ? posting.level : null}</div>
                </div>
              </div>
              <div className="apply-detail-position-section">
                <div style={{ display: 'flex' }}>
                  <div className="apply-detail-label">포지션 인원</div>
                  <div className="apply-detail-text-value">
                    {posting &&
                      posting.postingPositionList.map((e, i) => (
                        <p key={i}>
                          {e.code.name} : {e.positionCnt}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <Box sx={{ display: 'flex' }}>
              <div style={{ minWidth: '12.5%', alignItems: 'center' }}>
                <span className="apply-detail-skill-label">사용기술</span>
              </div>
              {posting &&
                posting.postingSkillList.map((ele, i) => (
                  <p style={{ marginRight: '5px' }} key={i}>
                    {ele.skillCode}
                  </p>
                ))}
            </Box>

            <div className="apply-detail-content-section">
              <div className="apply-detail-label">프로젝트 소개</div>
              <div className="apply-detail-content">{posting && posting.content}</div>
            </div>
            <div className="apply-register-submit-button">
              <SignalBtn
                style={{ width: '50%' }}
                onClick={() => {
                  navigate('/applyregister', { state: posting.postingSeq })
                }}
              >
                지원하기
              </SignalBtn>
              {/* 팀원 선택 페이지 ( 작성자용 ) */}
            </div>
          </div>
        </div>
      </div>
    </CssVarsProvider>
  )
}
export default PostingDetail