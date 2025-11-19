import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, useSearchParams } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, CircularProgress } from "@mui/material";
import { handleAuthCallback } from '../services/api';

// Lazy load components for better performance
const Hero = lazy(() => import("./Hero.jsx"));
const Login = lazy(() => import("./Signin.jsx"));
const Signup = lazy(() => import("./Signup.jsx"));
const Footer = lazy(() => import("./Footer.jsx"));
const PostPage = lazy(() => import("./Post/PostPage.jsx"));

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    }}
  >
    <CircularProgress
      size={60}
      thickness={4}
      sx={{
        color: "#10d1dfff",
        "& .MuiCircularProgress-circle": {
          strokeLinecap: "round",
        },
      }}
    />
  </Box>
);

const darkTheme = createTheme({
  palette: { mode: "dark" },
});

function CallbackHandler() {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    handleAuthCallback(searchParams);
  }, [searchParams]);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: "#10d1dfff",
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
          },
        }}
      />
    </Box>
  );
}

export default function App() {
  const location = useLocation();
  const hideFooterOn = ["/", "/login", "/signup", "/post", "/auth/callback"];
  const shouldHideFooter = hideFooterOn.includes(
    location.pathname.toLowerCase()
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="min-h-screen bg-primary-dark font-sans text-text-light">
        <Suspense fallback={<LoadingFallback />}>
          <main className="pt-0">
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/post" element={<PostPage />} />
              <Route path="/auth/callback" element={<CallbackHandler />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {!shouldHideFooter && <Footer />}
        </Suspense>
      </div>
    </ThemeProvider>
  );
}
