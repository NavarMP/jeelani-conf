"use client";

import { redirect } from "next/navigation";

// Grand Assembly registration now lives on the external portal
export default function GrandAssemblyRedirect() {
  redirect("https://grand-jeelani-conference-2026.web.app/");
}
