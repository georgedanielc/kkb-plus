// src/components/Footer.tsx
import { Box } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        textAlign: "center",
        color: "text.secondary",
        fontSize: "0.875rem", 
        py: 5,
        bgcolor: "background.paper", 
        boxShadow: "0 -2px 8px rgba(0,0,0,0.1)", 
      }}
    >
      Made with 💙 by <strong>George Cavas</strong>
    </Box>
  );
}
