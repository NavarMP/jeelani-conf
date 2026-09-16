"use client";

import React, { useState, useTransition } from "react";
import { saveZone, deleteZone, assignSeat, autoAssignUnseated } from "@/app/[locale]/admin/actions";
import { X, Zap } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  capacity: number;
  color?: string;
  layout_data?: { rows: number; seatsPerRow: number };
  allocatedCount: number;
  percentage: number;
  attendees: any[];
}

interface Attendee {
  id: string;
  registration_id: string;
  name: string;
  phone: string;
  dars_name: string;
  place: string;
  zone?: string | null;
  row_num?: string | null;
  seat_num?: string | null;
  status: string;
}

interface Props {
  initialZones: Zone[];
  initialUnseated: Attendee[];
  initialAttendees: Attendee[];
}

export default function ZoneManager({ initialZones, initialUnseated, initialAttendees }: Props) {
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [unseated, setUnseated] = useState<Attendee[]>(initialUnseated);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(initialZones[0]?.id || "zone-a");
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneCapacity, setNewZoneCapacity] = useState(300);
  const [newZoneColor, setNewZoneColor] = useState("blue");

  // Seat interaction state
  const [selectedSeat, setSelectedSeat] = useState<{ row: number; seat: number; attendee?: Attendee } | null>(null);
  const [attendeeToAssign, setAttendeeToAssign] = useState<string>("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const rows = selectedZone?.layout_data?.rows || 10;
  const seatsPerRow = selectedZone?.layout_data?.seatsPerRow || 15;

  // Build seat occupancy map for currently selected zone
  const seatOccupancyMap = new Map<string, Attendee>();
  selectedZone?.attendees?.forEach((att) => {
    if (att.row_num && att.seat_num) {
      // Normalize 'R1', '1', 'S1', '1'
      const r = att.row_num.replace(/[^0-9]/g, "");
      const s = att.seat_num.replace(/[^0-9]/g, "");
      seatOccupancyMap.set(`${r}-${s}`, att);
    }
  });

  const handleAutoAssign = () => {
    startTransition(async () => {
      try {
        const res = await autoAssignUnseated(selectedZone?.id);
        showToast(`Successfully assigned seats to ${res.assignedCount} attendee(s)!`);
      } catch (err: any) {
        showToast(err.message || "Failed to auto-assign", "error");
      }
    });
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    const id = newZoneName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    startTransition(async () => {
      try {
        await saveZone({
          id,
          name: newZoneName.trim(),
          capacity: Number(newZoneCapacity),
          color: newZoneColor,
          layout_data: { rows: 10, seatsPerRow: Math.ceil(newZoneCapacity / 10) },
        });
        showToast(`Zone "${newZoneName}" created successfully!`);
        setIsAddZoneOpen(false);
        setNewZoneName("");
      } catch (err: any) {
        showToast(err.message || "Failed to create zone", "error");
      }
    });
  };

  const handleDeleteZone = (zoneId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? All assigned attendees will become unseated.`)) return;
    startTransition(async () => {
      try {
        await deleteZone(zoneId);
        showToast(`Zone "${name}" deleted.`);
        if (selectedZoneId === zoneId) {
          const remaining = zones.filter((z) => z.id !== zoneId);
          if (remaining.length > 0) setSelectedZoneId(remaining[0].id);
        }
      } catch (err: any) {
        showToast(err.message || "Failed to delete zone", "error");
      }
    });
  };

  const handleAssignSelectedSeat = () => {
    if (!selectedSeat || !attendeeToAssign) return;

    const rowStr = `R${selectedSeat.row}`;
    const seatStr = `S${selectedSeat.seat}`;

    startTransition(async () => {
      try {
        await assignSeat(attendeeToAssign, selectedZone.id, rowStr, seatStr);
        showToast(`Assigned ${rowStr}-${seatStr} successfully!`);
        setSelectedSeat(null);
        setAttendeeToAssign("");
      } catch (err: any) {
        showToast(err.message || "Failed to assign seat", "error");
      }
    });
  };

  const handleUnseat = (attendeeId: string) => {
    startTransition(async () => {
      try {
        await assignSeat(attendeeId, null, null, null);
        showToast("Attendee unseated successfully.");
        setSelectedSeat(null);
      } catch (err: any) {
        showToast(err.message || "Failed to unseat attendee", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm font-medium ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zones & Slots Manager</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage Grand Assembly venue layout, zone capacities, and attendee seat assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg text-gray-600 font-medium">
            Unseated: <span className="text-amber-600 font-bold">{unseated.length}</span> attendees
          </div>
          <button
            onClick={handleAutoAssign}
            disabled={isPending || unseated.length === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <Zap className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            )}
            Auto-Assign Unseated
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Zones List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[650px]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Assembly Zones</h3>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
              {zones.length} Zones
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {zones.map((zone) => {
              const isSelected = zone.id === selectedZoneId;
              const isFull = zone.percentage >= 100;
              return (
                <div
                  key={zone.id}
                  onClick={() => {
                    setSelectedZoneId(zone.id);
                    setSelectedSeat(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`font-bold text-sm ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                        {zone.name}
                      </span>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{zone.id}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isFull
                          ? "bg-red-100 text-red-700"
                          : zone.percentage > 75
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {zone.percentage}% Full
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFull ? "bg-red-500" : zone.percentage > 75 ? "bg-amber-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${Math.min(zone.percentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs mt-3">
                    <span className="text-gray-600 font-medium">
                      {zone.allocatedCount} / {zone.capacity} allocated
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteZone(zone.id, zone.name);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs transition-colors"
                      title="Delete Zone"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => setIsAddZoneOpen(true)}
              className="w-full py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <span>+</span> Add New Zone
            </button>
          </div>
        </div>

        {/* Right Column: Visual Seating Grid & Details */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span>{selectedZone?.name || "Zone"}</span>
                <span className="text-xs font-normal text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded">
                  Capacity: {selectedZone?.capacity}
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Click on any seat to view assigned attendee details or assign an unseated attendee
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                <span className="w-3 h-3 rounded bg-blue-600 block shadow-sm"></span> Assigned
              </span>
              <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                <span className="w-3 h-3 rounded border border-gray-300 bg-white block shadow-sm"></span> Available
              </span>
              <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                <span className="w-3 h-3 rounded ring-2 ring-amber-500 bg-blue-100 block"></span> Selected
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 bg-slate-50 flex flex-col items-center justify-start relative">
            {/* Stage indicator */}
            <div className="w-full max-w-xl h-10 bg-[var(--color-navy)] rounded-lg mb-8 flex items-center justify-center text-white/80 text-xs font-bold tracking-widest uppercase shadow-md shrink-0">
              ✦ Main Stage / Podium ✦
            </div>

            {/* Seating Grid */}
            <div className="space-y-2.5 pb-8 overflow-x-auto max-w-full">
              {Array.from({ length: rows }).map((_, rIdx) => {
                const rowNum = rIdx + 1;
                return (
                  <div key={rowNum} className="flex gap-2 items-center justify-center">
                    <div className="w-7 text-[11px] font-bold text-gray-400 text-right select-none">
                      R{rowNum}
                    </div>
                    <div className="flex gap-1.5">
                      {Array.from({ length: seatsPerRow }).map((_, sIdx) => {
                        const seatNum = sIdx + 1;
                        const attendee = seatOccupancyMap.get(`${rowNum}-${seatNum}`);
                        const isOccupied = !!attendee;
                        const isSelectedSeat =
                          selectedSeat?.row === rowNum && selectedSeat?.seat === seatNum;

                        return (
                          <button
                            key={`${rowNum}-${seatNum}`}
                            onClick={() => setSelectedSeat({ row: rowNum, seat: seatNum, attendee })}
                            title={
                              isOccupied
                                ? `Row ${rowNum}, Seat ${seatNum}: ${attendee.name} (${attendee.dars_name || attendee.place})`
                                : `Row ${rowNum}, Seat ${seatNum}: Available`
                            }
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded text-[10px] font-medium transition-all flex items-center justify-center shadow-xs ${
                              isSelectedSeat
                                ? "ring-2 ring-amber-500 scale-110 z-10 bg-amber-400 text-amber-950 font-bold"
                                : isOccupied
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-100 text-gray-400"
                            }`}
                          >
                            {seatNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seat Inspector / Assignment Bar */}
          <div className="p-4 bg-white border-t border-gray-200">
            {selectedSeat ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                    R{selectedSeat.row}S{selectedSeat.seat}
                  </div>
                  <div>
                    {selectedSeat.attendee ? (
                      <div>
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <span>{selectedSeat.attendee.name}</span>
                          <span className="text-xs font-mono text-gray-500">
                            ({selectedSeat.attendee.registration_id})
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedSeat.attendee.dars_name} • {selectedSeat.attendee.place} •{" "}
                          {selectedSeat.attendee.phone}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Available Seat</div>
                        <div className="text-xs text-gray-500">Assign an unseated attendee to this slot</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {selectedSeat.attendee ? (
                    <button
                      onClick={() => handleUnseat(selectedSeat.attendee!.id)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Unseat Attendee
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={attendeeToAssign}
                        onChange={(e) => setAttendeeToAssign(e.target.value)}
                        className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-[var(--color-turquoise)] max-w-xs"
                      >
                        <option value="">Select unseated attendee...</option>
                        {unseated.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.registration_id}) - {u.dars_name || u.place}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssignSelectedSeat}
                        disabled={isPending || !attendeeToAssign}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[var(--color-navy)] hover:bg-[var(--color-navy)]/90 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedSeat(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 text-center py-1">
                Select any seat above to view its occupant or assign an attendee.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Zone Modal */}
      {isAddZoneOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Add New Assembly Zone</h3>
              <button
                onClick={() => setIsAddZoneOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Zone E - Balcony North"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={newZoneCapacity}
                    onChange={(e) => setNewZoneCapacity(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Theme Color
                  </label>
                  <select
                    value={newZoneColor}
                    onChange={(e) => setNewZoneColor(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)]"
                  >
                    <option value="blue">Blue</option>
                    <option value="turquoise">Turquoise</option>
                    <option value="amber">Amber</option>
                    <option value="emerald">Emerald</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddZoneOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[var(--color-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-navy)]/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Creating..." : "Create Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
