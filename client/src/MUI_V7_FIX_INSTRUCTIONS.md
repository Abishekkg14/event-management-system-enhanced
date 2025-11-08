// MUI v7 Grid Fix Instructions

This file contains instructions for fixing the MUI v7 Grid component issues.

## Recommended Approach

1. Add the `MUIGridFix.jsx` component to your project (already added at `src/components/MUIGridFix.jsx`).

2. Import these components at the top of each file where you use Grid:
```jsx
import { MUIGridContainer, MUIGridItem } from '../components/MUIGridFix';
```

3. Replace all Grid instances:
   - Replace `<Grid container spacing={2}>` with `<MUIGridContainer spacing={2}>`
   - Replace `<Grid item xs={12}>` with `<MUIGridItem xs={12}>`
   - Replace `<Grid item xs={12} sm={6}>` with `<MUIGridItem xs={12} sm={6}>`

## Example:

Before:
```jsx
<Grid container spacing={2}>
  <Grid item xs={12}>
    <TextField />
  </Grid>
  <Grid item xs={12} sm={6}>
    <FormControl />
  </Grid>
</Grid>
```

After:
```jsx
<MUIGridContainer spacing={2}>
  <MUIGridItem xs={12}>
    <TextField />
  </MUIGridItem>
  <MUIGridItem xs={12} sm={6}>
    <FormControl />
  </MUIGridItem>
</MUIGridContainer>
```

## Tooltip Fix for Dashboard.tsx

In Dashboard.tsx, you need to fix the Tooltip naming conflict:

1. Import the Tooltip components with aliases:
```jsx
import { Tooltip as MuiTooltip } from '@mui/material';
import { Tooltip as RechartsTooltip } from 'recharts';
```

2. Use the appropriate component in each case:
- Use `<MuiTooltip>` for Material UI tooltips
- Use `<RechartsTooltip>` for chart tooltips

## Already Fixed Files:
- EventDetails.tsx (using Box approach)
- Clients.tsx (partially fixed)
- Dashboard.tsx (partially fixed)

## Remaining Files to Fix:
- Complete Dashboard.tsx
- Events.tsx
- Login.tsx
- Payments.tsx
- Staff.tsx
- Vendors.tsx
