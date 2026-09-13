"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const RULES = [
  "Participation is open to teams that accept the ideological principles and teachings of Samastha.",
  "The competition will be conducted in two rounds.",
  "Seven teams selected from the first round, which will be conducted online, will compete in the Grand Finale (September 27).",
  "The registration fee is ₹300. After making the payment via Google Pay to 7034585359, participants must send the payment screenshot and a presentation video of at least 6 minutes to the same Telegram (http://t.me/adsadars) before 11:00 PM on Monday, 21/09/25.",
  "Each team must consist of exactly 6 members, including the leader. The number of members cannot be increased or decreased.",
  "The competition duration will be 12 minutes.",
  "The verses of Qasīdat al-Burdah must be presented in a melody that is not indecent/improper.",
  "The presentation must include some of the opening verses of the Burdah, as well as the concluding verses containing du‘ā and ṣalāh.",
  "An introduction of no more than one minute is permitted. The language of the introduction is not restricted.",
  "The response (jawāb) must be only “Mawlaya.”",
  "For the vocal background, a daf or arbana without jingles (cilanka) may be used.",
  "The teams securing the first, second, and third positions will receive cash prizes of ₹15,001, ₹10,001, and ₹7,001, respectively, along with mementos.",
  "Special mementos will be awarded to the Best Singer and Best Rhythmist.",
  "The decision of the jury and the committee shall be final."
];

export default function BurdaQawwaliRegistration() {
  const [formData, setFormData] = useState({ 
    teamName: "", 
    members: ["", "", "", "", "", ""], 
    phone: "", 
    telegramLink: "",
    screenshot: null as File | null
  });
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let receipt_url = "";
      
      // Upload screenshot if exists
      if (formData.screenshot) {
        const fileExt = formData.screenshot.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `burda/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, formData.screenshot);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);
          
        receipt_url = publicUrlData.publicUrl;
      }

      // Generate a unique registration ID
      const registration_id = `REG-BURDA-${Math.floor(1000 + Math.random() * 9000)}`;

      // Insert into dynamic_registrations
      const { error: insertError } = await supabase
        .from('dynamic_registrations')
        .insert({
          registration_id,
          session_slug: 'burda-qawwali',
          name: formData.teamName, // Store team name in main name field
          phone: formData.phone,
          status: 'pending',
          receipt_url,
          form_data: {
            members: formData.members,
            telegramLink: formData.telegramLink
          }
        });

      if (insertError) throw insertError;
      
      setSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Registration failed. Please try again or contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = value;
    setFormData({ ...formData, members: newMembers });
  };

  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center pt-20 pb-24 px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
        >
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            Registration Pending Verification
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
            Your registration request for the Burda & Qawwali Competition has been received. 
            Please ensure you have sent your 6-minute presentation video to the designated Telegram number.
          </p>
          <Link href="/" className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-xl text-sm font-semibold bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all shadow-md hover:shadow-lg">
            Return to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-24 pb-32 px-4 sm:px-6 relative overflow-hidden bg-gray-50/50">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--color-turquoise)]/10 to-transparent -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[var(--color-gold)]/10 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-start">
        {/* Left Column - Info & Rules */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ duration: 0.6 }}
          className="lg:col-span-3 space-y-8"
        >
          <div>
            <Link href="/#register" className="inline-flex items-center text-xs font-medium text-[var(--color-turquoise)] hover:text-[var(--color-navy)] transition-colors mb-6 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to registration
            </Link>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold bg-[var(--color-gold)]/20 text-[var(--color-gold-dark)] border border-[var(--color-gold)]/30">
                Competition Registration
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
              Burda & Qawwali <br />
              <span className="text-[var(--color-turquoise)]">Competition</span>
            </h1>
            
            <p className="text-gray-600 text-lg max-w-xl">
              Organized as part of the Rabi‘ Campaign “A Thousand and Five Hundred Years” (ആയിരത്തി അഞ്ഞൂറ് ആണ്ടുകൾ).
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -z-10" />
            
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Rules & Regulations
            </h3>
            
            <ul className="space-y-4">
              {RULES.map((rule, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-600">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 text-gray-400 text-xs font-bold mr-3 mt-0.5 border border-gray-100">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-turquoise)]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[var(--color-turquoise)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">Need help or have questions?</h4>
                <p className="text-xs text-gray-500">For further information, please contact the organizing committee at <span className="font-semibold text-gray-800">9074525205</span> or <span className="font-semibold text-gray-800">7034585359</span>.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Registration Form */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Team</h2>
              <p className="text-sm text-gray-500">Fill in the details below to submit your registration. Ensure you have made the ₹300 payment via GPay.</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Team Name */}
              <div>
                <label htmlFor="bq-team" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Team Name (Institution) *</label>
                <input id="bq-team" type="text" required value={formData.teamName} onChange={(e) => setFormData({ ...formData, teamName: e.target.value })} placeholder="Enter your Team/Institution name" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/30 focus:border-[var(--color-turquoise)] focus:bg-white transition-all placeholder:text-gray-400 font-medium" />
              </div>

              {/* Members */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Team Members (Exactly 6) *</label>
                <div className="space-y-3">
                  {formData.members.map((member, index) => (
                    <input 
                      key={index} 
                      type="text" 
                      required 
                      value={member} 
                      onChange={(e) => handleMemberChange(index, e.target.value)} 
                      placeholder={`Member ${index + 1} Name ${index === 0 ? '(Leader)' : ''}`} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/30 focus:border-[var(--color-turquoise)] focus:bg-white transition-all placeholder:text-gray-400 font-medium" 
                    />
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="bq-phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Team Phone Number *</label>
                <input id="bq-phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="WhatsApp number" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/30 focus:border-[var(--color-turquoise)] focus:bg-white transition-all placeholder:text-gray-400 font-medium" />
              </div>

              {/* Telegram Link Info */}
              <div className="p-4 bg-[var(--color-turquoise)]/5 rounded-xl border border-[var(--color-turquoise)]/20">
                <label htmlFor="bq-telegram" className="block text-xs font-bold text-[var(--color-navy)] uppercase tracking-wide mb-2">Telegram Username/Link *</label>
                <input id="bq-telegram" type="text" required value={formData.telegramLink} onChange={(e) => setFormData({ ...formData, telegramLink: e.target.value })} placeholder="e.g. @your_username or t.me/link" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/30 focus:border-[var(--color-turquoise)] transition-all placeholder:text-gray-400 font-medium mb-3" />
                <div className="text-xs text-[var(--color-navy)]/80 leading-tight">
                  <span className="font-bold">Important:</span> You must send a <span className="font-bold">6-minute demo Burda video</span> from this Telegram account to <strong className="font-bold text-[var(--color-navy)]">7034585359</strong> before the deadline.
                </div>
              </div>

              {/* Payment Details & Upload */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex flex-col items-center mb-5 pb-5 border-b border-gray-200">
                  <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center relative group">
                    <img src="/upi-qr.svg" alt="UPI QR Code" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <div className="mt-4 w-full max-w-xs space-y-2 text-center">
                    <div className="text-sm font-bold text-gray-900">Scan to Pay ₹300</div>
                    <div className="text-xs text-gray-700 font-medium bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => { navigator.clipboard.writeText('300'); alert('Amount copied!'); }}>
                      <span>Amount: <span className="font-bold text-[var(--color-navy)]">₹300</span></span>
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="text-xs text-gray-700 font-medium bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                      <span>Name: <span className="font-bold">Muhammed Sinan</span></span>
                    </div>
                    <div className="text-xs text-gray-700 font-medium bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => { navigator.clipboard.writeText('sinanvettam@okicici'); alert('UPI ID copied!'); }}>
                      <span>UPI ID: <span className="font-mono text-[var(--color-navy)]">sinanvettam@okicici</span></span>
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="text-xs text-gray-700 font-medium bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => { navigator.clipboard.writeText('7034585359'); alert('Phone number copied!'); }}>
                      <span>Phone: <span className="font-mono text-[var(--color-navy)]">7034585359</span></span>
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                </div>

                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Upload Payment Screenshot *</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-400">PNG, JPG or JPEG (Max 5MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/*" required onChange={(e) => setFormData({ ...formData, screenshot: e.target.files?.[0] || null })} />
                  </label>
                </div>
                {formData.screenshot && (
                  <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    File selected: {formData.screenshot.name}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" className="w-full py-4 rounded-xl text-sm font-bold tracking-wide uppercase bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all active:scale-[0.98] shadow-md hover:shadow-xl mt-6 flex items-center justify-center gap-2 group">
                Submit Registration
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
