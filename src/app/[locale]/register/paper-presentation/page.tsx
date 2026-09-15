"use client";

import { redirect } from "next/navigation";

// Paper Presentation has been cancelled
export default function PaperPresentationRedirect() {
  redirect("/#register");
}
