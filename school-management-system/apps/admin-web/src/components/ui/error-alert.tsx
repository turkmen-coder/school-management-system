'use client';

import { Alert, AlertTitle, Button, Box, Typography } from '@mui/material';
import { RefreshRounded } from '@mui/icons-material';
import { ReactNode } from 'react';

interface ErrorAlertProps {
  error: Error | unknown;
  title?: string;
  onRetry?: () => void;
  retryText?: string;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function ErrorAlert({
  error,
  title = 'Bir hata oluştu',
  onRetry,
  retryText = 'Tekrar Dene',
  fullWidth = true,
  children
}: ErrorAlertProps) {
  const getErrorMessage = (err: Error | unknown): string => {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'string') {
      return err;
    }
    if (typeof err === 'object' && err !== null) {
      return JSON.stringify(err);
    }
    return 'Bilinmeyen hata';
  };

  return (
    <Box
      sx={{
        width: fullWidth ? '100%' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Alert
        severity="error"
        sx={{
          width: '100%',
          maxWidth: 600,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <AlertTitle>{title}</AlertTitle>
        
        <Typography variant="body2" sx={{ mb: children || onRetry ? 2 : 0 }}>
          {getErrorMessage(error)}
        </Typography>

        {children && (
          <Box sx={{ mb: onRetry ? 2 : 0 }}>
            {children}
          </Box>
        )}

        {onRetry && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshRounded />}
            onClick={onRetry}
            sx={{
              color: 'error.main',
              borderColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'white',
              },
            }}
          >
            {retryText}
          </Button>
        )}
      </Alert>
    </Box>
  );
}