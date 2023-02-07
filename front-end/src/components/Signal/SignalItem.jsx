import * as React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Box } from '@mui/system'
import { useNavigate } from 'react-router-dom'
// import { useNavigate } from 'react-router-dom'
export default function SignalItem({ signal }) {
  const navigate = useNavigate()
  return (
    <Card
      onClick={() => {
        navigate('/signalDetail', { state: signal.signalweekSeq })
      }}
      sx={{
        minWidth: 275,
        mb: 2,
        mr: 2,
        '&:hover': {
          boxShadow: '0 0 0 2px #bcb7d9',
          cursor: 'pointer',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex' }}>{signal.title}</Box>
        <Typography sx={{ fontSize: 20 }} color="black" gutterBottom>
          {signal.title}
        </Typography>
        {/* 여기는 스킬아이콘 */}
        <hr />
        <Typography sx={{ fontSize: 20 }} color="black" gutterBottom>
          {signal.title}
        </Typography>
      </CardContent>
    </Card>
  )
}
