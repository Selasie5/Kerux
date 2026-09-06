import type { Metadata } from "next";
import { LandingPage } from "@/app/_components/landing-page";

export const metadata: Metadata = {
  title: "Kērux — Financial control for autonomous agents",
  description:
    "Provision isolated agent accounts, enforce hard spending rules, and stop any agent instantly with Kērux.",
};

export default function Home() {
  return <LandingPage />;
}
