'use client';

import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: '#d32f2f' }}>
            Algo deu errado!
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: '#666', marginBottom: 2 }}>
            Desculpe, ocorreu um erro inesperado. Por favor, tente novamente.
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Box
              sx={{
                backgroundColor: '#fff3e0',
                border: '1px solid #ffb74d',
                borderRadius: 1,
                padding: 2,
                marginBottom: 2,
                textAlign: 'left',
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#d32f2f' }}>
                {error.message}
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            onClick={() => reset()}
            sx={{
              backgroundColor: '#2563eb',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
            }}
          >
            Tentar Novamente
          </Button>
        </Box>
      </Container>
    </Box>
  );
}


