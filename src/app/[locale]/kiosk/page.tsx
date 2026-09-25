"use client";

import React, { useState, useEffect, useRef } from "react";
import { searchAttendeesForCheckIn, checkInByRegistrationId, type AttendeeSearchResult } from "@/app/[locale]/admin/event-day-actions";
import { Search, MapPin, UserCheck, Loader2, XCircle, ChevronRight, User, CheckCircle } from "lucide-react";

export default function KioskPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<AttendeeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedAttendee, setSelectedAttendee] = useState<AttendeeSearchResult | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-reset timeout
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (checkInSuccess) {
      timeout = setTimeout(() => {
        resetKiosk();
      }, 10000); // Reset after 10 seconds of success screen
    }
    return () => clearTimeout(timeout);
  }, [checkInSuccess]);

  // Inactivity timeout
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      if (searchTerm || results.length > 0 || selectedAttendee) {
        timeout = setTimeout(() => {
          resetKiosk();
        }, 30000); // Reset after 30 seconds of inactivity
      }
    };

    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [searchTerm, results, selectedAttendee]);

  const resetKiosk = () => {
    setSearchTerm("");
    setResults([]);
    setHasSearched(false);
    setSelectedAttendee(null);
    setIsCheckingIn(false);
    setCheckInSuccess(false);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (!term.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);
      try {
        // Fetch only unchecked attendees for kiosk
        const data = await searchAttendeesForCheckIn(term, { onlyUnchecked: true });
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectAndCheckIn = async (attendee: AttendeeSearchResult) => {
    setSelectedAttendee(attendee);
    setIsCheckingIn(true);
    
    try {
      const res = await checkInByRegistrationId(attendee.id, "kiosk", "Self-Service Kiosk");
      if (res.success || res.status === "already_checked_in") {
        setCheckInSuccess(true);
      } else {
        // Failed checkin (e.g. pending status)
        alert(res.message);
        setSelectedAttendee(null);
      }
    } catch {
      alert("Network error. Please try again.");
      setSelectedAttendee(null);
    } finally {
      setIsCheckingIn(false);
    }
  };

  // SUCCESS SCREEN
  if (checkInSuccess && selectedAttendee) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center mb-8 animate-[bounce_1s_ease-in-out]">
          <UserCheck className="w-16 h-16 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome!</h1>
        <h2 className="text-3xl font-bold text-indigo-600 mb-6">{selectedAttendee.name}</h2>
        
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 w-full max-w-md shadow-sm mb-12">
          {selectedAttendee.place && (
            <p className="text-gray-600 font-medium text-lg flex items-center justify-center gap-2 mb-3">
              <MapPin className="w-5 h-5" /> {selectedAttendee.place}
            </p>
          )}
          <p className="text-gray-900 font-bold text-xl px-4 py-2 bg-indigo-50 rounded-xl inline-block border border-indigo-100">
            {selectedAttendee.typeName}
          </p>
        </div>

        <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
          <CheckCircle className="w-8 h-8" /> You are checked in!
        </p>

        <button 
          onClick={resetKiosk}
          className="mt-12 px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-xl active:scale-95"
        >
          Done — Next Person
        </button>
      </div>
    );
  }

  // SEARCH SCREEN
  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col select-none">
      {/* Header */}
      <div className="bg-indigo-900 text-white p-8 text-center shadow-md z-10 shrink-0">
        <h2 className="text-indigo-200 font-semibold tracking-widest uppercase text-sm mb-2">Grand Jeelani Conference</h2>
        <h1 className="text-4xl font-bold">Self-Service Check-In</h1>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-6 pt-12 overflow-hidden">
        
        <div className="text-center mb-8 shrink-0">
          <p className="text-xl text-gray-600 font-medium">Please enter your name to find your registration</p>
        </div>

        <div className="relative mb-8 shrink-0 shadow-xl rounded-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-400" />
          <input
            type="text"
            placeholder="Tap here to type your name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-20 pr-8 py-6 rounded-full border-2 border-transparent bg-white text-gray-900 text-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm"
            autoComplete="off"
            spellCheck="false"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-100 text-gray-500"
            >
              <XCircle className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto pb-6 relative">
          {isSearching ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <p className="text-center text-gray-500 font-medium mb-4">Select your name below:</p>
              {results.map((attendee) => (
                <button
                  key={attendee.id}
                  onClick={() => handleSelectAndCheckIn(attendee)}
                  disabled={isCheckingIn}
                  className="w-full text-left bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-6 group disabled:opacity-50"
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <User className="w-8 h-8 text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{attendee.name}</h3>
                    {attendee.place && (
                      <p className="text-gray-500 mt-1 flex items-center gap-1.5 text-lg">
                        <MapPin className="w-5 h-5" /> {attendee.place}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </button>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Name not found</h3>
              <p className="text-gray-500 text-lg max-w-md">Try searching by your phone number, or ask for help at the Help Desk.</p>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-6 text-center text-gray-400 font-medium shrink-0">
        Having trouble? Please proceed to the Help Desk.
      </div>
      
      {/* Processing Overlay */}
      {isCheckingIn && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
          <p className="text-2xl font-bold text-gray-900">Checking you in...</p>
        </div>
      )}
    </div>
  );
}
