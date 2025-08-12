import { Box, Typography, Button } from "@mui/material";

const primaryColor = "#233d4d";
const middleColor = "#486d85";  
const secondaryColor = "#fd7f2d";

export default function Hero() {
  return (
    <Box
      component="section"
      sx={{
        width: "100vw",        // full viewport width
        maxWidth: "100%",      // prevent overflow
        textAlign: "center",
        py: { xs: 6, sm: 10 },
        px: 2,
        background: `linear-gradient(135deg, ${primaryColor} 0%,${middleColor} 50%, ${secondaryColor} 100%)`,
        color: "white",
        userSelect: "none",
        boxSizing: "border-box", // ensure padding is inside width
        overflowX: "hidden",     // avoid horizontal scroll from any content
      }}
    >
      <Typography
        variant="h2"
        fontWeight="bold"
        gutterBottom
        sx={{
          textShadow: "2px 2px 6px rgba(0,0,0,0.5)",
          fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
          lineHeight: 1.1,
        }}
      >
        Split Bills Effortlessly
      </Typography>

      <Typography
        variant="h6"
        gutterBottom
        sx={{
          maxWidth: 480,
          mx: "auto",
          textShadow: "1px 1px 3px rgba(0,0,0,0.4)",
          color: "rgba(255, 255, 255, 0.85)",
        }}
      >
        KKB+ makes it easy to share expenses with friends.
      </Typography>

      <Button
  size="large"
  sx={{
    mt: 4,
    px: 5,
    fontWeight: 600,
    color: primaryColor,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.35)",
      boxShadow: "0 6px 40px rgba(0, 0, 0, 0.15)",
      transform: "translateY(-2px)",
    },
  }}
>
  Try It Now
</Button>


    </Box>
  );
}
