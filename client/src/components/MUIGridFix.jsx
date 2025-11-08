import React from 'react';
import { Box } from '@mui/material';

/**
 * MUIGridContainer - Replacement for Grid container component in MUI v7
 */
export const MUIGridContainer = ({ children, spacing = 2, sx = {}, ...props }) => (
  <Box 
    sx={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(12, 1fr)', 
      gap: spacing, 
      ...sx 
    }}
    {...props}
  >
    {children}
  </Box>
);

/**
 * MUIGridItem - Replacement for Grid item component in MUI v7
 */
export const MUIGridItem = ({ children, xs = 12, sm, md, lg, xl, sx = {}, ...props }) => {
  // Set defaults for all props to prevent TypeScript errors
  sm = sm || undefined;
  md = md || undefined;
  lg = lg || undefined;
  xl = xl || undefined;

  const gridColumnValue = {
    ...(xs && { xs: `span ${xs}` }),
    ...(sm && { sm: `span ${sm}` }),
    ...(md && { md: `span ${md}` }),
    ...(lg && { lg: `span ${lg}` }),
    ...(xl && { xl: `span ${xl}` })
  };

  return (
    <Box 
      sx={{ 
        gridColumn: gridColumnValue,
        ...sx 
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
