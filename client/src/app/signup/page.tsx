import React from "react";
import SignupPageClient from "./SignupPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Sign Up",
  description: "Create an account on CollabSphere and join your team workspace.",
};

export default function SignupPage() {
  return <SignupPageClient />;
}
