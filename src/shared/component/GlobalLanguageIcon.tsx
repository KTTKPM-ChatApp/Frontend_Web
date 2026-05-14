"use client";

import React from 'react';
import { styled } from '@mui/material/styles';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { useLanguageContext } from '@/src/common/context/LanguageContext';

const LanguageIconWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '50%',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});

interface GlobalLanguageIconProps {
  size?: number;
  color?: string;
}

const GlobalLanguageIcon: React.FC<GlobalLanguageIconProps> = ({ 
  size = 24, 
  color = '#666' 
}) => {
  const { toggleLanguage } = useLanguageContext();

  return (
    <LanguageIconWrapper onClick={toggleLanguage}>
      <LanguageOutlinedIcon 
        sx={{ 
          fontSize: size,
          color: color 
        }} 
      />
    </LanguageIconWrapper>
  );
};

export default GlobalLanguageIcon;
