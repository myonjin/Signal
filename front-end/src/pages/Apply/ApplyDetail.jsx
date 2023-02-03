import React, { useState, useEffect } from 'react'
import '../../assets/styles/applyDetail.css'
import '../../assets/styles/skill.css'
import { getPositionName } from 'data/Positiondata'
import ApplyDelete from '../../components/Apply/ApplyDelete'
import skillImage from '../../assets/image/Skilltest/React.png'
import { Button } from '@mui/material'
import { Experimental_CssVarsProvider as CssVarsProvider, styled } from '@mui/material/styles'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SignalBtn from 'components/common/SignalBtn'
import axios from 'axios'

// import { useLocation } from 'react-router'

const ApplyModify = styled(Button)(({ theme }) => ({
  backgroundColor: '#574B9F',
  color: theme.vars.palette.common.white,
  '&:hover': {
    backgroundColor: theme.vars.palette.common.white,
    color: '#574B9F',
  },
}))

function ApplyDetail() {
  const navigate = useNavigate()

  const location = useLocation()
  const userSeq = location.state.userSeq
  const applySeq = location.state.applySeq

  const postingSeq = 458
  const [posting, setPosting] = useState('458')

  const [apply, setApply] = useState([])
  const [user, setUser] = useState([])
  const [position, setPosition] = useState([])

  const applyFetch = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_API_URL + '/apply/' + applySeq)
      setApply(res.data.body)
      console.log(res.data.body)
      setPosition(getPositionName(res.data.body.position.code))
      postingFetch(res.data.body.postingSeq)
      console.log('applyFetch', res.data.body)
    } catch (error) {
      console.log(error)
    }
  }

  const userFetch = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_API_URL + '/user/' + userSeq)
      setUser(res.data.body)
    } catch (error) {
      console.log(error)
    }
  }

  const postingFetch = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_API_URL + '/posting/' + postingSeq)
      setPosting(res.data.body)
      console.log('postingFetch', res.data.body)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    applyFetch()
    userFetch()
  }, [])

  return (
    <CssVarsProvider>
      <div className="apply-detail-container">
        <div className="apply-detail-width-section">
          <div className="apply-detail-project-name-section">
            <div>
              <div className="apply-detail-project-name-label">프로젝트 이름</div>
              <div className="apply-detail-project-title">싸피 프로젝트 모집</div>
            </div>
            <div className="apply-detail-cancle-section">
              <Link to={'/applymodify'} state={{ applySeq }}>
                <ApplyModify variant="contained" startIcon={<ModeEditIcon />}>
                  지원 수정
                </ApplyModify>
              </Link>

              <ApplyDelete open={open} applySeq={applySeq}></ApplyDelete>
            </div>
          </div>
          <hr className="apply-detail-hr" />
          <div className="apply-detail-application-section">
            <div className="apply-detail-name-position-section">
              <div className="apply-detail-name-section">
                <div style={{ display: 'flex' }}>
                  <div className="apply-detail-label">이름</div>
                  <div className="apply-detail-text-value">{user.nickname}</div>
                </div>
              </div>
              <div className="apply-detail-position-section">
                <div style={{ display: 'flex' }}>
                  <div className="apply-detail-label">포지션</div>
                  <div className="apply-detail-text-value">{position}</div>
                </div>
              </div>
            </div>
            <div className="apply-detail-phone-section">
              <div style={{ display: 'flex' }}>
                <div className="apply-detail-label">전화번호</div>
                <div className="apply-detail-text-value">{user.phone}</div>
              </div>
            </div>
            <div className="apply-detail-email-section">
              <div style={{ display: 'flex' }}>
                <div className="apply-detail-label">이메일</div>
                <div className="apply-detail-text-value">{user.email}</div>
              </div>
            </div>
            <div className="apply-detail-skill-section">
              <div style={{ minWidth: '12.5%', alignItems: 'center' }}>
                <span className="apply-detail-skill-label">사용기술</span>
              </div>
              <div className="apply-detail-skillList-section">
                {apply.skillList &&
                  apply.skillList.map((skill, index) => (
                    <div key={index} style={{ display: 'inline-block', marginRight: '7px' }}>
                      <div className="apply-detail-skill" key={index}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <img src={skillImage} alt="skillImage" className="apply-detail-skill-image" />
                          <span>{skill.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="apply-detail-career-exp-section">
              <div style={{ width: '50%' }}>
                <div className="apply-detail-career-section">
                  <div className="apply-detail-career-label">
                    <div className="apply-detail-career-label">경력</div>
                    <hr className="apply-detail-hr-small" />
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '90%' }}>
                      {apply.careerList &&
                        apply.careerList.map((item) => (
                          <div className="apply-detail-career" key={item.applyCareerSeq}>
                            {item.content}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ width: '50%' }}>
                <div className="apply-detail-exp-section">
                  <div className="apply-detail-exp-label">
                    <div className="apply-detail-exp-label">경험</div>
                    <hr className="apply-detail-hr-small" />
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '90%' }}>
                      {apply.expList &&
                        apply.expList.map((item) => (
                          <div className="apply-detail-exp" key={item.applyExpSeq}>
                            {item.content}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="apply-detail-content-section">
              <div className="apply-detail-label">하고싶은 말</div>
              <div className="apply-detail-content">{apply.content}</div>
            </div>
            <div className="apply-detail-question-answer-section">
              <div className="apply-detail-label">공고 작성자가 궁금한 점</div>
              <div style={{ margin: '10px 0px' }}>
                {posting.postingQuestionList &&
                  posting.postingQuestionList.map((question) => (
                    <div key={question.postingQuestionSeq} style={{ margin: '10px 0px' }}>
                      <div className="apply-question-content">{question.content}</div>
                      <div className="apply-answer-content">
                        {apply.answerList
                          .filter((answer) => answer.postingQuestionSeq === question.postingQuestionSeq)
                          .map((item) => (
                            <div key={item.applyAnswerSeq}>{item.content}</div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div>
            <SignalBtn
              sigwidth="20%"
              sigheight="40px"
              sigmargin="auto"
              sigborderradius="100px"
              onClick={() => navigate(-1)}
            >
              돌아가기
            </SignalBtn>
          </div>
        </div>
      </div>
    </CssVarsProvider>
  )
}
export default ApplyDetail