import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { TextField, MenuItem, InputLabel, FormControl, Select } from '@mui/material'
import plusButton from '../../assets/image/plusButton.png'
import ExpList from '../../components/Apply/ExpList'
import CareerList from '../../components/Apply/CareerList'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import '../../assets/styles/applyRegister.css'
import Skill from '../../data/Skilldata'
import { getPositionName, getPositionCode } from 'data/Positiondata'
import QnAList from 'components/Apply/QnaList'
import SkillList from 'components/Apply/SkillList'
import MeetingDtSelect from 'components/Meeting/MeetingDtSelect'
import { useLocation } from 'react-router-dom'
import SignalBtn from 'components/common/SignalBtn'
import moment from 'moment/moment'

const inputStyle = {
  backgroundColor: '#f3f5f7',
  position: 'static',
  width: '300px',
}

const textAreaStyle = {
  backgroundColor: '#f3f5f7',
  margin: '10px 0px',
}

function ApplyRegister() {
  const location = useLocation()

  const userSeq = 1
  const postingSeq = 458
  const applySeq = location.state.applySeq

  // start >> useState

  const [user, setUser] = useState([])
  const [posting, setPosting] = useState([{}])
  const [apply, setApply] = useState([{}])
  const [position, setPosition] = useState('')
  const [careerList, setCareerList] = useState([])
  const [expList, setExpList] = useState([])
  const [skillList, setSkillList] = useState([])
  const [content, setContent] = useState([])
  const [questionList, setQuestionList] = useState([])
  const [answerList, setAnswerList] = useState([])
  const [careerSeq, setCareerSeq] = useState(0)
  const [expSeq, setExpSeq] = useState(0)
  const [meetingList, setMeetingList] = useState([])
  const [meetingSeq, setMeetingSeq] = useState('')
  const [meetingSeqCheck, setMeetingSeqCheck] = useState('true')
  const [meetingDafault, setMeetingDafault] = useState('')
  // ene >> useState

  // start >> Fetch
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
      const answerArr = []
      res.data.body.postingQuestionList.map((item) =>
        answerArr.push({
          postingQuestionSeq: item.postingQuestionSeq,
          content: '',
        })
      )
      meetingFetchFilter(res.data.body.postingMeetingList)
      console.log('공고', res.data.body)
      setQuestionList(res.data.body.postingQuestionList)
    } catch (error) {
      console.log(error)
    }
  }

  const applyFetch = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_API_URL + '/apply/' + applySeq)
      setApply(res.data.body)
      careerFetchFilter(res.data.body.careerList)
      expFetchFilter(res.data.body.careerList)
      skillFetchFilter(res.data.body.skillList)
      setPosition(res.data.body.position.name)
      setContent(res.data.body.content)
      setAnswerList(res.data.body.answerList)
      setMeetingSeq(res.data.body.postingMeeting.postingMeetingSeq)
      console.log('지원서', res.data.body)
      console.log(apply)
    } catch (error) {
      console.log(error)
    }
  }

  // end >> Fetch

  // start >> Data filter

  const careerFetchFilter = (list) => {
    const careerArr = []
    list.map((item, index) =>
      careerArr.push({
        seq: item.applyCareerSeq,
        content: item.content,
      })
    )
    setCareerSeq(list.length)
    setCareerList(careerArr)
  }

  const expFetchFilter = (list) => {
    const expArr = []
    list.map((item, index) =>
      expArr.push({
        seq: item.applyExpSeq,
        content: item.content,
      })
    )
    setExpSeq(list.length)
    setExpList(expArr)
  }
  //  apply detail 나오면 default 잘 들어가는 지, meetingList에 내가 선택한 미팅 시간도 포함된 리스트인 지 확인
  const meetingFetchFilter = (list) => {
    const meetingDtArr = []
    list.forEach((item) => {
      if (item.postingMeetingCode === 'PM102' || item.postingMeetingSeq === meetingSeq) {
        setMeetingDafault(item.meetingDt)
        meetingDtArr.push({
          postingMeetingSeq: item.postingMeetingSeq,
          meetingDt: item.meetingDt,
        })
      }
    })

    setMeetingList(meetingDtArr)
  }

  const skillFetchFilter = (list) => {
    const skillArr = []
    list.forEach((item) => {
      skillArr.push(item.name)
    })

    setSkillList(skillArr)
  }

  const careerPostFilter = (list) => {
    const careerArr = []
    list.map((item) => careerArr.push(item.content))
    return careerArr
  }

  const expPostFilter = (list) => {
    const expArr = []
    list.map((item) => expArr.push(item.content))
    return expArr
  }

  const skillPostFilter = (list) => {
    const skillArr = []
    list.map((item) => skillArr.push(Skill.getSkillCode(item)))
    return skillArr
  }

  const answerPostFilter = (list) => {
    // const answerArr = []
    console.log('list입니두', list)

    list.forEach((item) => apply.answerList.forEach((item2) => item.postingQuestionSeq))
    // list.map((item) =>(
    //   apply.answerList.filter(answer)=>
    //     item.postingQuestionSeq === answer.postingQuestionSeq

    //   item.postingQuestionSeq === apply.postingQuestionSeq

    //     applyAnswerSeq: item.applyAnswerSeq + '',
    //     content: item.content,

    // return answerArr
  }

  // start >> handle position

  const handlePositionChange = (event) => {
    setPosition(event.target.value)
  }
  // end >> handle position

  // start >> handle skill

  const handleSkillInput = (value) => {
    const skillArr = [...skillList, value]
    const set = new Set(skillArr)
    const uniqueArr = Array.from(set)
    setSkillList(uniqueArr)
  }

  const handleSkillRemove = (id) => {
    setSkillList(
      skillList.filter((skill) => {
        return skill !== id
      })
    )
  }

  // start >> skill filter
  const skillSearchFilter = createFilterOptions({
    matchFrom: 'start',
    stringify: (option) => option.name,
  })

  // end >> skill filter

  // end >> handle skill

  // start >> handle career

  const handleCareerAdd = () => {
    const careerArr = [...careerList]
    const career = {
      seq: careerSeq + 1,
      content: '',
    }
    setCareerSeq(careerSeq + 1)
    careerArr.push(career)
    setCareerList(careerArr)
  }

  const handleCareerChange = (value, key) => {
    const careerArr = [...careerList]
    const newCareerArr = [...careerList]

    for (let index = 0; index < careerArr.length; index++) {
      if (careerArr[index].seq === key) {
        newCareerArr.splice(index, 1, { seq: key, content: value })
      }
    }

    setCareerList(newCareerArr)
  }

  const handleCareerRemove = (key) => {
    setCareerList(careerList.filter((career) => career.seq !== key))
  }

  // end >> handle career

  // start >> handle exp

  const handleExpAdd = () => {
    const expArr = [...expList]
    const exp = {
      seq: expSeq + 1,
      content: '',
    }
    setExpSeq(expSeq + 1)
    expArr.push(exp)
    setExpList(expArr)
  }

  const handleExpChange = (value, key) => {
    const expArr = [...expList]
    const newExpArr = [...expList]

    for (let index = 0; index < expArr.length; index++) {
      if (expArr[index].seq === key) {
        newExpArr.splice(index, 1, { seq: key, content: value })
      }
    }
    setExpList(newExpArr)
  }

  const handleExpRemove = (key) => {
    setExpList(expList.filter((exp) => exp.seq !== key))
  }

  // end >> handle exp

  // start >> handle content

  const handleContentChange = (event) => {
    setContent(event.target.value)
  }

  // end >> handle content

  // start >> handle qna

  const handleQnAChange = (value, key) => {
    const answerArr = [...answerList]
    answerList.forEach((item, index) => {
      if (item.postingQuestionSeq === key) {
        answerArr.splice(index, 1, {
          postingQuestionSeq: key,
          content: value,
        })
      }
    })

    setAnswerList(answerArr)
  }

  // end >> handle qna

  const handleMeetingDtChange = (key) => {
    setMeetingSeqCheck(false)
    setMeetingSeq(key)
  }

  const handleApplyModify = async () => {
    try {
      const req = {
        applyAnswerList: answerPostFilter(answerList),
        applyCareerList: careerPostFilter(careerList),
        applyExpList: expPostFilter(expList),
        applySkillList: skillPostFilter(skillList),
        content,
        postingMeetingSeq: meetingSeq + '',
        positionCode: getPositionCode(position),
        userSeq,
      }
      console.log(JSON.stringify(req))
      const config = { 'Content-Type': 'application/json' }
      await axios
        .put(process.env.REACT_APP_API_URL + '/apply/' + applySeq, req, config)
        .then((res) => {
          console.log(res)
        })
        .catch((err) => {
          console.log(err)
        })

      console.log('지원서 put')
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    userFetch()
    postingFetch()
    applyFetch()
  }, [])

  return (
    <div className="apply-modify-container">
      <div className="apply-modify-width-section">
        <div>
          <div className="apply-modify-title">{user.nickname} 님의지원서</div>
        </div>
        <hr className="apply-modify-hr" />
        <div className="apply-modify-application-section">
          <div className="apply-modify-user-detail-section">
            <div className="apply-modify-phone-section">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="apply-modify-label">전화번호</div>
                <TextField disabled value={user.phone || ''} sx={inputStyle} />
              </div>
            </div>
            <div className="apply-modify-email-section">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="apply-modify-label">이메일</div>
                <TextField disabled value={user.email || ''} sx={inputStyle} />
              </div>
            </div>
          </div>
          <div className="apply-modify-position-meeting-section">
            <div className="apply-modify-position-section">
              <div style={{ display: 'flex' }}>
                <div className="apply-modify-label" style={{ display: 'flex', alignItems: 'center' }}>
                  포지션
                </div>
                <FormControl style={inputStyle}>
                  <InputLabel id="demo-simple-select-label" sx={inputStyle}></InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={position || ''}
                    onChange={handlePositionChange}
                    inputProps={{ 'aria-label': 'Without label' }}
                  >
                    {posting.postingPositionList &&
                      posting.postingPositionList.map((item, index) => (
                        <MenuItem value={getPositionName(item.positionCode) || ''} key={item.positionCode + index}>
                          {getPositionName(item.positionCode)}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="apply-modify-meeting-section">
              <div style={{ display: 'flex' }}>
                <div className="apply-modify-label" style={{ display: 'flex', alignItems: 'center' }}>
                  화상미팅 예약
                </div>
                <div>
                  <MeetingDtSelect
                    open={open}
                    meetingList={meetingList}
                    onChange={handleMeetingDtChange}
                    meetingSeq={meetingSeq}
                  ></MeetingDtSelect>
                  {meetingSeqCheck === 'true' ? (
                    <div style={{ textAlign: 'center' }}>{moment(meetingDafault).format('YYYY-MM-DD')}</div>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="apply-modify-skill-section">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ minWidth: '12.5%', alignItems: 'center' }}>
                <span className="apply-modify-label">사용기술</span>
              </div>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                sx={{ width: 300 }}
                options={Skill.Skilldata}
                getOptionLabel={(option) => option.name}
                filterOptions={skillSearchFilter}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        handleSkillInput(e.target.value)
                      }
                    }}
                    sx={inputStyle}
                  />
                )}
              />
            </div>
          </div>
          <div style={{ display: 'inline-block', marginRight: '7px' }}>
            <SkillList skillList={skillList} onRemove={handleSkillRemove}></SkillList>
          </div>
          <div className="apply-modify-career-exp-section">
            <div style={{ width: '50%' }}>
              <div className="apply-modify-career-section">
                <div className="apply-modify-career-label">
                  <div style={{ padding: '0px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>경력</div>
                      <img
                        src={plusButton}
                        alt="plusButton"
                        className="apply-modify-plus-button"
                        onClick={handleCareerAdd}
                      />
                    </div>
                  </div>
                  <hr></hr>
                </div>
                <CareerList
                  careerList={careerList}
                  onRemove={handleCareerRemove}
                  onChange={handleCareerChange}
                ></CareerList>
              </div>
            </div>
            <div style={{ width: '50%' }}>
              <div className="apply-modify-exp-section">
                <div className="apply-modify-exp-label">
                  <div style={{ padding: '0px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>경험</div>
                      <img
                        src={plusButton}
                        alt="plusButton"
                        className="apply-modify-plus-button"
                        onClick={handleExpAdd}
                      />
                    </div>
                  </div>
                  <hr></hr>
                </div>
                <ExpList expList={expList} onRemove={handleExpRemove} onChange={handleExpChange}></ExpList>
              </div>
            </div>
          </div>
          <div className="apply-modify-content-section">
            <div className="apply-modify-label">하고싶은 말</div>
            <TextField
              style={textAreaStyle}
              fullWidth={true}
              multiline={true}
              minRows="5"
              defaultValue={content || ''}
              onChange={handleContentChange}
            />
          </div>
          <div className="apply-modify-question-answer-section">
            <div className="apply-modify-question-section">
              <div className="apply-modify-label">지원자에게 궁금한 점</div>
            </div>
            <div style={{ margin: '10px 0px' }}>
              <QnAList questionList={questionList} answerList={answerList} onChange={handleQnAChange}></QnAList>
            </div>
          </div>
        </div>
        <div className="apply-modify-submit-button">
          <SignalBtn onClick={handleApplyModify} style={{ width: '50%' }}>
            수정하기
          </SignalBtn>
        </div>
      </div>
    </div>
  )
}

export default ApplyRegister
