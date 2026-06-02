import React from "react";
import Providers from "@/components/Providers";
import "@/app/globals.css";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CollabSphere | Smart Project & Task Collaboration",
  description:
    "Empower your team with real-time project management, workload balance charts, task automation, and interactive analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning data-scroll-behavior='smooth'>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position='top-right'
            toastOptions={{
              className: "glass-panel",
              style: {
                background: "var(--glass-bg)",
                color: "hsl(var(--text-primary))",
                border: "1px solid var(--glass-border)",
                backdropFilter: "blur(16px)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
