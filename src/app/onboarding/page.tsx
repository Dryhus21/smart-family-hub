import { redirect } from "next/navigation";

export default function OnboardingPage() {
  // Onboarding lives inline on the dashboard now.
  redirect("/dashboard");
}
