import React from "react";
import QRScannerClient from "@/components/scanner/QRScannerClient";

export const metadata = {
  title: "Ticket Scanner — Grand Jeelani Conference",
  description: "Staff & Volunteer QR Ticket Scanner",
};

export default function StandaloneScannerPage() {
  return <QRScannerClient />;
}
