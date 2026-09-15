"use client";

import { redirect } from "next/navigation";

// Backward compatibility: redirect old Musthafa Darimi URL to the new Academic Sessions form
export default function MustafaDarimiRedirect() {
  redirect("/register/astro-ai-fiqh");
}
