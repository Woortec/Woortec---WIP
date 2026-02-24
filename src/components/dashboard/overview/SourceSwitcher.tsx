'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FacebookLogo as FacebookIcon } from '@phosphor-icons/react';
import GoogleIcon from '@/components/core/GoogleIcon';

interface SourceSwitcherProps {
    source: 'facebook' | 'google';
    onSourceChange: (source: 'facebook' | 'google') => void;
}

export default function SourceSwitcher({ source, onSourceChange }: SourceSwitcherProps) {
    const options: { key: 'facebook' | 'google'; label: string; color: string; activeColor: string; shadow: string }[] = [
        {
            key: 'facebook',
            label: 'Facebook Ads',
            color: '#1877F2',
            activeColor: 'linear-gradient(135deg, #1877F2 0%, #0a5cc7 100%)',
            shadow: '0 6px 20px rgba(24, 119, 242, 0.38)',
        },
        {
            key: 'google',
            label: 'Google Ads',
            color: '#02B194',
            activeColor: 'linear-gradient(135deg, #00C9A7 0%, #02B194 100%)',
            shadow: '0 6px 20px rgba(2, 177, 148, 0.38)',
        },
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
            }}
        >
            {options.map((opt) => {
                const isActive = source === opt.key;
                return (
                    <Box
                        key={opt.key}
                        onClick={() => onSourceChange(opt.key)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2.2,
                            py: 1.1,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                            background: isActive ? opt.activeColor : 'rgba(255,255,255,0.7)',
                            boxShadow: isActive ? opt.shadow : '0 2px 8px rgba(0,0,0,0.06)',
                            border: isActive ? 'none' : '1.5px solid rgba(0,0,0,0.07)',
                            transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
                            backdropFilter: 'blur(6px)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: isActive ? opt.shadow : '0 4px 16px rgba(0,0,0,0.10)',
                                background: isActive ? opt.activeColor : 'rgba(255,255,255,0.95)',
                            },
                        }}
                    >
                        {opt.key === 'facebook' ? (
                            <FacebookIcon
                                size={18}
                                style={{ color: isActive ? '#fff' : opt.color, flexShrink: 0 }}
                                weight={isActive ? 'fill' : 'regular'}
                            />
                        ) : (
                            <GoogleIcon
                                sx={{
                                    fontSize: 18,
                                    filter: isActive ? 'brightness(0) invert(1)' : 'none',
                                    flexShrink: 0,
                                }}
                            />
                        )}
                        <Typography
                            sx={{
                                fontSize: '0.82rem',
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? '#fff' : 'rgba(0,0,0,0.6)',
                                letterSpacing: isActive ? '0.01em' : '0em',
                                lineHeight: 1,
                                whiteSpace: 'nowrap',
                                transition: 'all 0.22s ease',
                            }}
                        >
                            {opt.label}
                        </Typography>

                        {isActive && (
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.7)',
                                    ml: 0.4,
                                    flexShrink: 0,
                                    animation: 'pulse 1.8s ease-in-out infinite',
                                    '@keyframes pulse': {
                                        '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                                        '50%': { opacity: 0.5, transform: 'scale(0.7)' },
                                    },
                                }}
                            />
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}
