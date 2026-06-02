import React from "react";
import Providers from "@/components/Providers";
import "@/app/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Smart Project & Task Collaboration",
  description: "Empower your team with real-time project management, workload balance charts, task automation, and interactive analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
