'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Interviewee support assistant. How can I help you today?",
    },
  ])
  const [isLoading,setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  const sendMessage = async () => {
    // We'll implement this function in the next section
   
        if (!message.trim()) return;  // Don't send empty messages
      
        setMessage('')
        setMessages((messages) => [
          ...messages,
          { role: 'user', content: message },
          { role: 'assistant', content: '' },
        ])
      // console.log(JSON.stringify([...messages, { role: 'user', content: message }]))
      const data = {messages:[...messages, { role: 'user', content: message }]}
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
      
          if (!response.ok) {
            throw new Error(response.body?.getReader())
          }
      
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
      
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const text = decoder.decode(value, { stream: true })
            setMessages((messages) => {
              let lastMessage = messages[messages.length - 1]
              let otherMessages = messages.slice(0, messages.length - 1)
              return [
                ...otherMessages,
                { ...lastMessage, content: lastMessage.content + text },
              ]
            })
          }
        } catch (error) {
          console.error('Error:', error)
          setMessages((messages) => [
            ...messages,
            { role: 'assistant', content: "If you are seeing this. I'm sorry, but the developer ran out of API credits!" },
          ])
        }
      
}
const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box
  sx={{
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  }}
>
  <Stack
    direction="column"
    sx={{
      width: { xs: '90%', sm: '70%', md: '50%', lg: '40%' },
      height: '80%',
      border: '1px solid #ccc',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      p: 3,
      overflow: 'hidden',
    }}
  >
    <Stack
      direction="column"
      spacing={2}
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        paddingRight: 1,
      }}
    >
      {messages.map((message, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: message.role === 'assistant' ? 'flex-start' : 'flex-end',
          }}
        >
          <Box
            sx={{
              maxWidth: '70%',
              padding: 2,
              borderRadius: '12px',
              backgroundColor: message.role === 'assistant' ? 'primary.main' : 'secondary.main',
              color: '#fff',
              border: '1px solid',
              borderColor: message.role === 'assistant' ? 'primary.dark' : 'secondary.dark',
              wordBreak: 'break-word',
            }}
          >
            {message.content}
          </Box>
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </Stack>
    <Stack
      direction="row"
      spacing={2}
      sx={{
        mt: 2,
      }}
    >
      <TextField
        label="Message"
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isLoading}
        variant="outlined"
      />
      <Button
        variant="contained"
        onClick={sendMessage}
        disabled={isLoading}
        sx={{
          minWidth: '100px',
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        {isLoading ? 'Sending...' : 'Send'}
      </Button>
    </Stack>
  </Stack>
</Box>

  )
}