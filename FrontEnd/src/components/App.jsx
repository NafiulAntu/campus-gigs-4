import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, useSearchParams } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, CircularProgress } from "@mui/material";
import { handleAuthCallback } from '../services/api.js';
import '../config/firestoreInit.js'; // Initialize Firestore connection check
import { requestNotificationPermission } from '../utils/notifications';

// Lazy load components for better performance
const Hero = lazy(() => import("./Interface/Hero.jsx"));
const Login = lazy(() => import("./log/sign/Signin.jsx"));
const Signup = lazy(() => import("./log/sign/Signup.jsx"));
const Footer = lazy(() => import("./Interface/Footer.jsx"));
const PostPage = lazy(() => import("./Post/pages/PostPage.jsx"));
const ForgotPassword = lazy(() => import("./log/sign/ForgotPassword.jsx"));
const OTPVerification = lazy(() => import("./log/sign/OTPVerification.jsx"));
const ResetPassword = lazy(() => import("./log/sign/ResetPassword.jsx"));
const AuthLayout = lazy(() => import("./Interface/AuthLayout.jsx"));
const Terms = lazy(() => import("./log/sign/Terms.jsx"));
const Privacy = lazy(() => import("./log/sign/Privacy.jsx"));
const Premium = lazy(() => import("./Post/components/Premium.jsx"));
const PaymentVerify = lazy(() => import("./Post/components/PaymentVerify.jsx"));
const PaymentSuccess = lazy(() => import("./Post/components/PaymentResult.jsx").then(m => ({ default: m.PaymentSuccess })));
const PaymentFailed = lazy(() => import("./Post/components/PaymentResult.jsx").then(m => ({ default: m.PaymentFailed })));
const PaymentCancelled = lazy(() => import("./Post/components/PaymentResult.jsx").then(m => ({ default: m.PaymentCancelled })));
const SendMoneyPage = lazy(() => import("./Post/pages/SendMoneyPage.jsx"));
const DummyPaymentPage = lazy(() => import("./Post/pages/DummyPaymentPage.jsx"));
const PaymentCallbackPage = lazy(() => import("./Post/pages/PaymentCallbackPage.jsx"));

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
  
  // Request notification permission on app load
  useEffect(() => {
    requestNotificationPermission().then(granted => {
      if (granted) {
        console.log('✅ Notification permission granted');
      }
    });
  }, []);
  const hideFooterOn = ["/", "/login", "/signup", "/post", "/auth/callback", "/forgot-password", "/verify-otp", "/reset-password", "/terms", "/privacy", "/premium", "/payment/verify", "/payment/success", "/payment/failed", "/payment/cancelled", "/send-money", "/dummy-payment", "/payment-callback"];
  const shouldHideFooter = hideFooterOn.includes(
    location.pathname.toLowerCase()
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="min-h-screen font-sans" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
        <Suspense fallback={<LoadingFallback />}>
          <main className="pt-0">
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
              <Route path="/verify-otp" element={<AuthLayout><OTPVerification /></AuthLayout>} />
              <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/post" element={<PostPage />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/payment/verify" element={<PaymentVerify />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />
              <Route path="/payment/cancelled" element={<PaymentCancelled />} />
              <Route path="/send-money" element={<SendMoneyPage />} />
              <Route path="/dummy-payment" element={<DummyPaymentPage />} />
              <Route path="/payment-callback" element={<PaymentCallbackPage />} />
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
