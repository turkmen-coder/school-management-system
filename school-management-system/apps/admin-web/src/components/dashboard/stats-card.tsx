'use client';

import { Card, CardContent, Box, Typography, alpha } from '@mui/material';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  format?: 'number' | 'currency' | 'percentage';
  icon: ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
}

export function StatsCard({
  title,
  value,
  format = 'number',
  icon,
  color,
  trend
}: StatsCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return `₺${val.toLocaleString('tr-TR')}`;
      case 'percentage':
        return `%${val}`;
      default:
        return val.toLocaleString('tr-TR');
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.isPositive ? '↗️' : '↘️';
  };

  return (
    <Card
      sx={{
        height: '100%',
        background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)}, ${alpha(theme.palette[color].main, 0.05)})`,
        border: (theme) => `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: (theme) => theme.palette[color].main,
              color: 'white',
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Box>

        <Typography
          variant="h4"
          component="div"
          fontWeight="bold"
          color="text.primary"
          sx={{ mb: 1 }}
        >
          {formatValue(value)}
        </Typography>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: trend.isPositive ? 'success.main' : 'error.main',
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {getTrendIcon()}
              {Math.abs(trend.value)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {trend.period}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}