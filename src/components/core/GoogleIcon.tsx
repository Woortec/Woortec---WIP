import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

const GoogleIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M21.35 11.1H12v2.9h5.35c-.25 1.39-.97 2.57-2.05 3.38v2.77h3.32c1.95-1.8 3.08-4.45 3.08-7.56 0-.63-.07-1.24-.2-1.84z" fill="#4285F4" />
    <path d="M12 22c2.7 0 4.95-.9 6.6-2.43l-3.32-2.77c-.92.62-2.08.99-3.28.99-2.52 0-4.65-1.7-5.41-4.04H3.2v2.53C4.88 19.48 8.17 22 12 22z" fill="#34A853" />
    <path d="M6.59 13.75c-.21-.63-.33-1.3-.33-2s.12-1.37.33-2.01V7.21H3.2C2.44 8.84 2 10.66 2 12.75s.44 3.91 1.2 5.54l3.39-2.54z" fill="#FBBC05" />
    <path d="M12 4.75c1.4 0 2.65.48 3.64 1.41l2.7-2.7C16.95 1.99 14.7 1 12 1 8.17 1 4.88 3.52 3.2 7.21l3.39 2.54c.76-2.34 2.89-4.04 5.41-4.04z" fill="#EA4335" />
  </SvgIcon>
);

export default GoogleIcon;
