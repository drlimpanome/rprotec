'use client';

import * as React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import Button, { ButtonProps } from '@mui/material/Button';
import Card, { CardProps } from '@mui/material/Card';
import { styled } from '@mui/material/styles';

/* Styled Card com Glassmorphism */
export const StyledCard = styled(Card)<CardProps>(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 183, 197, 0.2)',
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(0, 225, 194, 0.4)',
    boxShadow: '0 8px 24px rgba(0, 225, 194, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

/* Styled Button com Gradiente Corporativo */
export const StyledButton = styled(Button)<ButtonProps>(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a0b44 0%, #003677 100%)',
  color: '#ffffff',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: '10px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #003677 0%, #0060a0 100%)',
    boxShadow: '0 8px 20px rgba(26, 11, 68, 0.3)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

/* Styled Button com Acento */
export const StyledButtonAccent = styled(Button)<ButtonProps>(({ theme }) => ({
  background: 'linear-gradient(135deg, #008bbb 0%, #00b7c5 50%, #00e1c2 100%)',
  color: '#ffffff',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: '10px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #00b7c5 0%, #00e1c2 100%)',
    boxShadow: '0 8px 20px rgba(0, 183, 197, 0.4)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

/* Styled Box para Containers */
export const StyledContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(0, 183, 197, 0.15)',
  borderRadius: '12px',
  padding: '24px',
  transition: 'all 0.3s ease',
}));

/* Header Corporativo */
export const StyledSectionHeader = styled(Box)(({ theme }) => ({
  borderBottom: '2px solid',
  borderImage: 'linear-gradient(90deg, #1a0b44 0%, #003677 50%, #0060a0 100%) 1',
  paddingBottom: '16px',
  marginBottom: '24px',
  
  '& h2, & h3': {
    background: 'linear-gradient(90deg, #1a0b44 0%, #003677 50%, #0060a0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },
}));

/* Badge com Cores Corporativas */
export const StyledBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 12px',
  borderRadius: '20px',
  background: 'linear-gradient(135deg, rgba(0, 183, 197, 0.2) 0%, rgba(0, 225, 194, 0.2) 100%)',
  border: '1px solid rgba(0, 225, 194, 0.4)',
  color: '#00e1c2',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.5px',
}));

/* Table Header com Gradiente */
export const StyledTableHead = styled('thead')(({ theme }) => ({
  '& th': {
    background: 'linear-gradient(90deg, rgba(26, 11, 68, 0.15) 0%, rgba(0, 54, 119, 0.15) 100%)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.875rem',
    letterSpacing: '0.5px',
    borderBottom: '2px solid rgba(0, 183, 197, 0.3)',
    padding: '16px',
    textTransform: 'uppercase',
  },
}));

/* Input com Border Corporativo */
export const StyledInput = styled('input')(({ theme }) => ({
  borderRadius: '10px',
  border: '1px solid rgba(0, 183, 197, 0.3)',
  padding: '12px 16px',
  fontSize: '0.875rem',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: 'inherit',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    borderColor: 'rgba(0, 183, 197, 0.5)',
  },
  
  '&:focus': {
    outline: 'none',
    borderColor: '#00e1c2',
    boxShadow: '0 0 12px rgba(0, 225, 194, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  
  '&::placeholder': {
    color: 'rgba(255, 255, 255, 0.4)',
  },
}));

/* Divider com Gradiente */
export const StyledDivider = styled(Box)(({ theme }) => ({
  height: '1px',
  background: 'linear-gradient(90deg, rgba(0, 183, 197, 0) 0%, rgba(0, 183, 197, 0.5) 50%, rgba(0, 183, 197, 0) 100%)',
  margin: '24px 0',
}));

/* Status Indicator */
export const StyledStatusIndicator = styled(Box)<{ status?: 'success' | 'warning' | 'error' | 'info' }>(({ status = 'info' }) => {
  const colors = {
    success: { bg: 'rgba(0, 225, 194, 0.2)', border: 'rgba(0, 225, 194, 0.5)', color: '#00e1c2' },
    warning: { bg: 'rgba(255, 193, 7, 0.2)', border: 'rgba(255, 193, 7, 0.5)', color: '#ffc107' },
    error: { bg: 'rgba(244, 67, 54, 0.2)', border: 'rgba(244, 67, 54, 0.5)', color: '#f44336' },
    info: { bg: 'rgba(0, 183, 197, 0.2)', border: 'rgba(0, 183, 197, 0.5)', color: '#00b7c5' },
  };

  const selected = colors[status];

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    background: selected.bg,
    border: `1px solid ${selected.border}`,
    color: selected.color,
    fontSize: '0.813rem',
    fontWeight: 600,
    
    '&::before': {
      content: '""',
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: selected.color,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
  };
});


