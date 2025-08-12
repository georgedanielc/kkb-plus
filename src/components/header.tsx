import { AppBar, Toolbar, Typography, Box, Link } from "@mui/material";

const primaryColor = "#233d4d";
const textColor = "#1f2937";


export default function Header() {
  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "white",
        boxShadow: 1,
        width: "100vw",
        left: 0,
        right: 0,
      }}
    >
      <Toolbar
        sx={{
          maxWidth: "1200px",
          width: "100%",
          mx: "auto",
          py: { xs: 1.5, sm: 2 },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            flexGrow: 1,
            fontFamily: "'Pixelify', monospace",
            color: primaryColor,
            fontWeight: "700",
            userSelect: "none",
            fontSize: { xs: "1.2rem", sm: "1.875rem" },
          }}
        >
          KKB+
        </Typography>
 <Box sx={{ display: "flex", gap: 3 }}>
      <Link
        href="#home"
        underline="none"
        sx={{ color: textColor, fontWeight: 500, cursor: "pointer", fontSize: "0.875rem" }}
      >
        Home
      </Link>
      <Link
        href="#how-it-works"
        underline="none"
        sx={{ color: textColor, fontWeight: 500, cursor: "pointer", fontSize: "0.875rem" }}
      >
        How It Works
      </Link>
      <Link
        href="#about"
        underline="none"
        sx={{ color: textColor, fontWeight: 500, cursor: "pointer", fontSize: "0.875rem" }}
      >
        About
      </Link>
    </Box>
      </Toolbar>
    </AppBar>
  );
}