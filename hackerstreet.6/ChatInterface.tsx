import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface Message {
  text: string;
  isUser: boolean;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isUser: true }]);
      setInput('');
      // TODO: Add API call to backend for response
    }
  };

  return (
    <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ flexGrow: 1, mb: 2, p: 2, overflow: 'auto' }}>
        <List>
          {messages.map((message, index) => (
            <ListItem key={index} sx={{ justifyContent: message.isUser ? 'flex-end' : 'flex-start' }}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  backgroundColor: message.isUser ? 'primary.main' : 'secondary.main',
                  color: message.isUser ? 'white' : 'black',
                }}
              >
                <ListItemText primary={message.text} />
              </Paper>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface; 