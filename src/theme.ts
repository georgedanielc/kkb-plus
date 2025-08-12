// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#233d4d", // dark blue
      contrastText: "#fff",
    },
    secondary: {
      main: "#fd7f2d", // orange
      contrastText: "#fff",
    },
  },
});

export default theme;
