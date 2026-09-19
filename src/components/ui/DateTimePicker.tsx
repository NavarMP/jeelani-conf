"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  parseToIstParts,
  buildIstIsoString,
  to24Hour,
  to12Hour,
  addMinutesToIst,
  CONFERENCE_DATES,
  COMMON_TIME_PRESETS,
  IstDateTimeParts,
} from "@/lib/dateTimeUtils";

export interface DateTimePickerProps {
  value: string | null | undefined; // ISO string or timestamp
  onChange: (isoString: string) => void;
  label?: string;
  referenceStartTime?: string | null; // For End Time: enables duration presets (+30m, +1h, etc.)
  mode?: "datetime" | "date" | "time";
  align?: "left" | "right";
  clearable?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MINUTE_PRESETS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const DURATION_PRESETS = [
  { label: "+15m", mins: 15 },
  { label: "+30m", mins: 30 },
  { label: "+45m", mins: 45 },
  { label: "+1 hr", mins: 60 },
  { label: "+1.5 hr", mins: 90 },
  { label: "+2 hr", mins: 120 },
  { label: "+3 hr", mins: 180 },
];

export function DateTimePicker({
  value,
  onChange,
  label,
  referenceStartTime,
  mode = "datetime",
  align = "left",
  clearable = false,
  className = "",
  placeholder = "Select date & time",
  disabled = false,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const hasValue = Boolean(value && value.trim() !== "");

  // Active viewing tab in the popover
  const [activeTab, setActiveTab] = useState<"time" | "date">(
    mode === "date" ? "date" : "time"
  );

  // Parse current value in IST
  const istParts: IstDateTimeParts = parseToIstParts(value);

  // Local draft state while interacting with the picker
  const [currentYear, setCurrentYear] = useState(istParts.year);
  const [currentMonth, setCurrentMonth] = useState(istParts.month); // 1-12
  const [selectedDateStr, setSelectedDateStr] = useState(istParts.dateString); // YYYY-MM-DD
  const [selectedHour12, setSelectedHour12] = useState(istParts.hours12);
  const [selectedMinute, setSelectedMinute] = useState(istParts.minutes);
  const [selectedAmPm, setSelectedAmPm] = useState<"AM" | "PM">(istParts.ampm);

  // Sync state whenever prop `value` changes while closed
  useEffect(() => {
    if (!isOpen) {
      const parts = parseToIstParts(value);
      setCurrentYear(parts.year);
      setCurrentMonth(parts.month);
      setSelectedDateStr(parts.dateString);
      setSelectedHour12(parts.hours12);
      setSelectedMinute(parts.minutes);
      setSelectedAmPm(parts.ampm);
    }
  }, [value, isOpen]);

  // Format current draft for live preview in header
  const draftIso = buildIstIsoString(
    selectedDateStr,
    to24Hour(selectedHour12, selectedAmPm),
    selectedMinute
  );
  const draftParts = parseToIstParts(draftIso);

  // Commit current draft state to parent
  const commitChange = useCallback(() => {
    if (mode === "date") {
      onChange(selectedDateStr);
    } else {
      const h24 = to24Hour(selectedHour12, selectedAmPm);
      const newIso = buildIstIsoString(selectedDateStr, h24, selectedMinute);
      onChange(newIso);
    }
    setIsOpen(false);
  }, [mode, selectedDateStr, selectedHour12, selectedMinute, selectedAmPm, onChange]);

  // Click outside commits and closes
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        commitChange();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, commitChange]);

  // Escape key to close without saving further
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  // Quick date select
  const handleDateSelect = (newDateStr: string) => {
    setSelectedDateStr(newDateStr);
    const [y, m] = newDateStr.split("-").map(Number);
    setCurrentYear(y);
    setCurrentMonth(m);
    if (mode === "date") {
      onChange(newDateStr);
      setIsOpen(false);
    }
  };

  // Clear value handler
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  // Time component updates
  const handleHourSelect = (h: number) => {
    setSelectedHour12(h);
  };

  const handleMinuteSelect = (m: number) => {
    setSelectedMinute(m);
  };

  const handleAmPmToggle = (newAmPm: "AM" | "PM") => {
    setSelectedAmPm(newAmPm);
  };

  // Preset time select
  const handleTimePreset = (h24: number, min: number) => {
    const { hour12, ampm } = to12Hour(h24);
    setSelectedHour12(hour12);
    setSelectedMinute(min);
    setSelectedAmPm(ampm);
  };

  // Duration offset select (relative to referenceStartTime)
  const handleDurationSelect = (minutesToAdd: number) => {
    const baseIso = referenceStartTime || value;
    const newIso = addMinutesToIst(baseIso, minutesToAdd);
    const parts = parseToIstParts(newIso);
    setSelectedDateStr(parts.dateString);
    setSelectedHour12(parts.hours12);
    setSelectedMinute(parts.minutes);
    setSelectedAmPm(parts.ampm);
    setCurrentYear(parts.year);
    setCurrentMonth(parts.month);
  };

  // Calendar navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate calendar days for currentMonth / currentYear
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sunday

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div className="relative flex items-center">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-left text-xs sm:text-sm font-medium transition-all ${
            isOpen
              ? "border-[var(--color-turquoise)] ring-2 ring-[var(--color-turquoise)]/20 bg-white"
              : "border-gray-300 hover:border-[var(--color-turquoise)]/80 bg-white hover:bg-[var(--color-ivory)]/40"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            {!hasValue ? (
              <div className="flex items-center gap-1.5 text-gray-400">
                <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{placeholder}</span>
              </div>
            ) : (
              <>
                {mode !== "time" && (
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-turquoise)] shrink-0" />
                    <span className="truncate font-semibold text-gray-800">
                      {istParts.displayDate}
                    </span>
                  </div>
                )}

                {mode === "datetime" && <span className="text-gray-300">•</span>}

                {mode !== "date" && (
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Clock className="w-3.5 h-3.5 text-[#E6B400] shrink-0" />
                    <span className="font-bold text-[var(--color-navy)]">
                      {istParts.time12String}
                    </span>
                  </div>
                )}

                {mode !== "date" && (
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[var(--color-turquoise)] border border-blue-200/60">
                    IST
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {clearable && hasValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 transition-colors"
                title="Clear"
              >
                <span className="text-xs font-bold px-1">×</span>
              </button>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[var(--color-turquoise)]" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute z-50 mt-1.5 ${
            align === "right" ? "right-0" : "left-0"
          } w-[310px] sm:w-[340px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
          style={{ maxWidth: "calc(100vw - 24px)" }}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[var(--color-navy)] to-[#18538c] px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brass)]">
                  {label || "Schedule Time"}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 font-mono text-blue-100">
                  Asia/Kolkata
                </span>
              </div>
              <button
                type="button"
                onClick={commitChange}
                className="text-xs text-white/90 hover:text-white px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors font-semibold flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3 h-3 text-[var(--color-brass)]" />
                Done
              </button>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                {selectedHour12}:{pad(selectedMinute)} {selectedAmPm}
              </span>
              <span className="text-xs text-blue-200">
                • {draftParts.displayDayName},{" "}
                {draftParts.displayDate.split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs (for datetime mode) */}
          {mode === "datetime" && (
            <div className="flex border-b border-gray-100 bg-gray-50/70 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("time")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "time"
                    ? "bg-white text-[var(--color-navy)] shadow-sm border border-gray-200/80"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#E6B400]" />
                Time Selector
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("date")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "date"
                    ? "bg-white text-[var(--color-navy)] shadow-sm border border-gray-200/80"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-turquoise)]" />
                Date Calendar
              </button>
            </div>
          )}

          {/* TAB 1: TIME SELECTOR */}
          {(mode === "time" || (mode === "datetime" && activeTab === "time")) && (
            <div className="p-3.5 space-y-3.5">
              {/* Duration Presets (if referenceStartTime is available, e.g. for End Time) */}
              {referenceStartTime && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[var(--color-brass)]" />
                      Quick Duration from Start:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {DURATION_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleDurationSelect(p.mins)}
                        className="px-2 py-1 text-xs rounded-md font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Digital Dial / Controls */}
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                {/* AM / PM and Digits Display */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Select Hours & Mins
                  </span>
                  {/* AM / PM Toggle */}
                  <div className="flex bg-gray-200 p-0.5 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => handleAmPmToggle("AM")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        selectedAmPm === "AM"
                          ? "bg-[var(--color-navy)] text-white shadow"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAmPmToggle("PM")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        selectedAmPm === "PM"
                          ? "bg-[var(--color-navy)] text-white shadow"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* Hours Grid (1 to 12) */}
                <div className="mb-2.5">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Hour</div>
                  <div className="grid grid-cols-6 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                      const isSelected = selectedHour12 === h;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => handleHourSelect(h)}
                          className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                            isSelected
                              ? "bg-[var(--color-turquoise)] text-white shadow-sm"
                              : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Minutes Grid (5m increments) */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Minute</div>
                  <div className="grid grid-cols-6 gap-1">
                    {MINUTE_PRESETS.map((m) => {
                      const isSelected = selectedMinute === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleMinuteSelect(m)}
                          className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                            isSelected
                              ? "bg-[var(--color-navy)] text-white shadow-sm"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          :{pad(m)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Conference Program Presets */}
              <div>
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Conference Schedule Presets
                </div>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto pr-1">
                  {COMMON_TIME_PRESETS.map((preset) => {
                    const isSelected =
                      to24Hour(selectedHour12, selectedAmPm) === preset.h &&
                      selectedMinute === preset.m;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleTimePreset(preset.h, preset.m)}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? "bg-blue-50 border-[var(--color-turquoise)] text-[var(--color-navy)] font-bold"
                            : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        <span>{preset.label}</span>
                        <span className="text-[10px] text-gray-400 truncate max-w-[65px]">
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATE CALENDAR */}
          {(mode === "date" || (mode === "datetime" && activeTab === "date")) && (
            <div className="p-3.5 space-y-3">
              {/* Conference Quick Date Shortcuts */}
              <div>
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Grand Conference Dates
                </div>
                <div className="space-y-1">
                  {CONFERENCE_DATES.map((cd) => {
                    const isSelected = selectedDateStr === cd.date;
                    return (
                      <button
                        key={cd.date}
                        type="button"
                        onClick={() => handleDateSelect(cd.date)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition-all ${
                          isSelected
                            ? "bg-blue-50 border-[var(--color-turquoise)] text-[var(--color-navy)] font-bold shadow-xs"
                            : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {cd.isMain && (
                            <span className="text-[var(--color-brass)] text-sm">★</span>
                          )}
                          <span>{cd.label}</span>
                          <span className="text-gray-400 text-[10px]">({cd.sub})</span>
                        </div>
                        <span className="font-mono text-[11px] text-gray-500 font-semibold">
                          {cd.date}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs font-bold text-gray-800">
                  {MONTH_NAMES[currentMonth - 1]} {currentYear}
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div>
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 mb-1">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Empty leading days */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-7" />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateKey = `${currentYear}-${pad(currentMonth)}-${pad(dayNum)}`;
                    const isSelected = selectedDateStr === dateKey;
                    const isConferenceDay = dateKey === "2026-09-27";

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => handleDateSelect(dateKey)}
                        className={`h-7 text-xs font-medium rounded-md flex items-center justify-center relative transition-all ${
                          isSelected
                            ? "bg-[var(--color-navy)] text-white font-bold shadow-sm"
                            : isConferenceDay
                            ? "bg-amber-100/70 text-amber-950 font-bold border border-amber-300 hover:bg-amber-200"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {dayNum}
                        {isConferenceDay && !isSelected && (
                          <span className="absolute -top-0.5 right-0.5 w-1.5 h-1.5 bg-[var(--color-brass)] rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="bg-gray-50 px-3.5 py-2.5 border-t border-gray-200 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => handleDateSelect("2026-09-27")}
              className="text-gray-500 hover:text-[var(--color-navy)] font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-gray-400" />
              Reset Event Day
            </button>

            <button
              type="button"
              onClick={commitChange}
              className="px-3.5 py-1.5 bg-[var(--color-navy)] hover:bg-[var(--color-turquoise)] text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
