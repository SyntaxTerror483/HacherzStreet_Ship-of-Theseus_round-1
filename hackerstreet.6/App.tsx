import React from 'react';
import { Box, Container, Typography, AppBar, Toolbar } from '@mui/material';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Debt Management Assistant
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <ChatInterface />
      </Container>
    </Box>
  );
};

export default App; 