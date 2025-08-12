import { Container, CssBaseline } from "@mui/material";
import Header from "./components/header";
import Hero from "./components/hero";
import HowItWorks from "./components/howitworks";
import BillSplitter from "./components/billsplitter";
import Footer from "./components/Footer";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";

export default function App() {
//const primaryColor = "#233d4d";
//const secondaryColor = "#fd7f2d";

  //const neutralBgColor = "#fafafa"; 
  
  return (
    <>
	 <ThemeProvider theme={theme}>
	<Header />
      <CssBaseline />
              <Hero />
			  <HowItWorks />
      <Container
  maxWidth="md"      // medium breakpoint (≈900px max width)
  sx={{
    py: { xs: 4, sm: 6 },  // vertical padding responsive: 16px on xs, 24px on sm+
    px: { xs: 2, sm: 4 },  // horizontal padding responsive
    minHeight: "100vh",
    borderRadius: 3
  }}
>

        
        <BillSplitter />
      </Container>
	  </ThemeProvider>
 <Footer />
    </>
  );
}
