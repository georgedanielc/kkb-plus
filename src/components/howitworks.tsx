import { Box, Typography, Grid, Paper, Container } from "@mui/material";
import PaymentsIcon from "@mui/icons-material/Payments";
import GroupIcon from "@mui/icons-material/Group";
import ShareIcon from "@mui/icons-material/Share";

const steps = [
  {
    title: "1. Enter Total",
    desc: "Input the total bill amount including optional service charge & VAT.",
    icon: <PaymentsIcon fontSize="large" color="primary" />,
  },
  {
    title: "2. Add People (Optional)",
    desc: "Add names if you want to assign orders, but it’s optional. Payment links are coming soon!",
    icon: <GroupIcon fontSize="large" color="primary" />,
  },
  {
    title: "3. Split & Share",
    desc: "See exact amounts owed. Share results by downloading or screenshotting the bill.",
    icon: <ShareIcon fontSize="large" color="primary" />,
  },
];

export default function HowItWorks() {
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        backgroundColor: "#f9fafb",
        overflowX: { xs: "auto", md: "visible" }, // allow horizontal scroll on small screens
      }}
    >
      <Typography variant="h4" textAlign="center" gutterBottom fontWeight="bold">
        How It Works
      </Typography>
      <Container maxWidth="md">
        <Grid
          container
          spacing={4}
          justifyContent="center"
          direction={{ xs: "column", md: "row" }}
          alignItems="stretch"
		   wrap="nowrap"
		    sx={{ overflowX: { xs: "auto", md: "visible" } }}
        >
         {steps.map(({ title, desc, icon }, idx) => (
           <Box
  key={idx}
  sx={{
    flex: {
      xs: "0 0 90%",
      sm: "0 0 45%", 
      md: "0 0 300px",
    },
    display: "flex",
  }}
>
              <Paper
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  bgcolor: "white",
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  height: "100%", // stretch to container height
                }}
              >
                <Box color="primary.main">{icon}</Box>
                <Typography variant="h6" fontWeight="600">
                  {title}
                </Typography>
                <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
                  {desc}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}