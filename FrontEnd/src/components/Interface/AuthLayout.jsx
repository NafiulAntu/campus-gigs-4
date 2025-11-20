import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import {
  motion,
  animate,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import GlobalStyles from "@mui/material/GlobalStyles";

// Aurora-like gradient + star field background to match AuroraHero
const COLORS = ["#ef4444", "#0ea5e9", "#14b8a6", "#3b82f6"]; // red, sky, teal, blue

export default function AuthLayout({ children }) {
  const color = useMotionValue(COLORS[0]);

  useEffect(() => {
    const controls = animate(color, COLORS, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
    return () => controls.stop();
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;

  return (
    <motion.section
      style={{ backgroundImage }}
      className="auth-layout relative w-full min-h-[100svh] overflow-hidden bg-gray-950 text-gray-200"
    >
      <GlobalStyles
        styles={{
          ".auth-layout .MuiOutlinedInput-root": {
            backgroundColor: "transparent !important",
          },
          ".auth-layout .MuiInputBase-root, .auth-layout .MuiFormControl-root":
            {
              backgroundColor: "transparent !important",
            },
          ".auth-layout .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.3)",
          },
          ".auth-layout .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#ffffff",
            },
          ".auth-layout .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#90caf9",
            },
          ".auth-layout .MuiInputBase-input": {
            color: "#fff",
            caretColor: "#fff",
          },
          ".auth-layout label.MuiFormLabel-root": {
            color: "#3b82f6", // blue labels
          },
          ".auth-layout label.MuiFormLabel-root.Mui-focused": {
            color: "#60a5fa", // lighter blue when focused
          },
          ".auth-layout input:-webkit-autofill, .auth-layout input:-webkit-autofill:hover, .auth-layout input:-webkit-autofill:focus, .auth-layout textarea:-webkit-autofill":
            {
              WebkitBoxShadow: "0 0 0px 1000px transparent inset !important",
              WebkitTextFillColor: "#fff",
              transition:
                "background-color 5000s ease-in-out 0s, color 5000s ease-in-out 0s",
            },
          ".auth-layout input:focus, .auth-layout textarea:focus": {
            boxShadow: "none !important",
            outline: "none !important",
          },
          ".auth-layout .MuiOutlinedInput-root.Mui-focused": {
            boxShadow: "none !important",
          },
        }}
      />
      {/* Star field */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={50} count={2200} factor={4} fade speed={2} />
        </Canvas>
      </div>

      {/* Centered content */}
      <div className="relative z-10 min-h-[100svh] flex items-center justify-center px-4 py-10">
        {children}
      </div>
    </motion.section>
  );
}
