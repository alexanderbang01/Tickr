"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#13151f",
            color: "#eef0f6",
            border: "1px solid #2d3148",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          },
          success: {
            iconTheme: { primary: "#10d48e", secondary: "#13151f" },
          },
          error: {
            iconTheme: { primary: "#f04f5e", secondary: "#13151f" },
          },
        }}
      />
    </SessionProvider>
    </ThemeProvider>
  );
}
