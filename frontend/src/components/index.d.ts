// https://mui.com/material-ui/migration/troubleshooting/#javascript
declare module '@mui/private-theming' {
  import type { Theme } from '@mui/material/styles';

  interface DefaultTheme extends Theme {}
}
