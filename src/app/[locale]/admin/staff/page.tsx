"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAllStaff,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  toggleStaffActive,
} from "@/app/[locale]/admin/event-day-actions";
import {
  Users,
  Plus,
  Trash2,
  Shield,
  X,
  UserCheck,
  UserX,
  Copy,
  CheckCircle,
  Edit2,
} from "lucide-react";

const roleConfig: Record<string, { label: string; color: string }> = {
  volunteer: { label: "Volunteer", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
  gate_manager: { label: "Gate Manager", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  judge: { label: "Judge", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" },
  coordinator: { label: "Coordinator", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  admin: { label: "Admin", color: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" },
};

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "volunteer",
    assigned_gate: "main",
    pin_code: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStaff = useCallback(async () => {
    try {
      const data = await fetchAllStaff();
      setStaff(data);
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const generatePin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setForm((f) => ({ ...f, pin_code: pin }));
  };

  const handleCreateOrUpdate = async () => {
    if (!form.name.trim() || !form.pin_code) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateStaffMember(editingId, form);
      } else {
        await createStaffMember(form);
      }
      setForm({ name: "", phone: "", role: "volunteer", assigned_gate: "main", pin_code: "" });
      setShowCreate(false);
      setEditingId(null);
      loadStaff();
    } catch {
      alert("Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (s: any) => {
    setForm({
      name: s.name,
      phone: s.phone || "",
      role: s.role,
      assigned_gate: s.assigned_gate || "main",
      pin_code: s.pin_code,
    });
    setEditingId(s.id);
    setShowCreate(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    try {
      await deleteStaffMember(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleStaffActive(id, !isActive);
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: !isActive } : s))
      );
    } catch {
      alert("Failed to update.");
    }
  };

  const copyPin = async (pin: string) => {
    await navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[var(--admin-text-secondary)]">
        Loading staff...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">👥 Event Staff</h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
            Manage volunteers, gate managers, and judges — each gets a PIN for the scanner
          </p>
        </div>
        <button
          onClick={() => {
            if (showCreate) {
              setShowCreate(false);
              setEditingId(null);
              setForm({ name: "", phone: "", role: "volunteer", assigned_gate: "main", pin_code: "" });
            } else {
              setShowCreate(true);
            }
          }}
          className="px-4 py-2 bg-[var(--color-turquoise)] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 shadow-sm"
        >
          {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showCreate ? "Cancel" : "Add Staff"}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="px-4 py-2.5 border border-[var(--admin-input-border)] rounded-xl text-sm bg-[var(--admin-input-bg)] text-[var(--admin-text)] outline-none focus:border-[var(--color-turquoise)] placeholder:text-[var(--admin-text-muted)]"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="px-4 py-2.5 border border-[var(--admin-input-border)] rounded-xl text-sm bg-[var(--admin-input-bg)] text-[var(--admin-text)] outline-none focus:border-[var(--color-turquoise)] placeholder:text-[var(--admin-text-muted)]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="px-3 py-2.5 border border-[var(--admin-input-border)] rounded-xl text-sm bg-[var(--admin-input-bg)] text-[var(--admin-text)] outline-none"
            >
              <option value="volunteer">Volunteer</option>
              <option value="gate_manager">Gate Manager</option>
              <option value="judge">Judge</option>
              <option value="coordinator">Coordinator</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={form.assigned_gate}
              onChange={(e) => setForm((f) => ({ ...f, assigned_gate: e.target.value }))}
              className="px-3 py-2.5 border border-[var(--admin-input-border)] rounded-xl text-sm bg-[var(--admin-input-bg)] text-[var(--admin-text)] outline-none"
            >
              <option value="main">Main Gate</option>
              <option value="vip">VIP Gate</option>
              <option value="stage2">Stage 2 Gate</option>
              <option value="dining">Dining Pavilion</option>
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="6-digit PIN"
                value={form.pin_code}
                onChange={(e) => setForm((f) => ({ ...f, pin_code: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                className="flex-1 px-4 py-2.5 border border-[var(--admin-input-border)] rounded-xl text-sm font-mono bg-[var(--admin-input-bg)] text-[var(--admin-text)] outline-none focus:border-[var(--color-turquoise)] placeholder:text-[var(--admin-text-muted)]"
                maxLength={6}
              />
              <button
                onClick={generatePin}
                type="button"
                className="px-3 py-2 border border-[var(--admin-border)] rounded-xl text-xs font-medium bg-[var(--admin-surface-alt)] hover:bg-[var(--admin-hover)] text-[var(--admin-text-secondary)]"
              >
                Auto
              </button>
            </div>
          </div>
          <button
            onClick={handleCreateOrUpdate}
            disabled={isSubmitting || !form.name.trim() || form.pin_code.length !== 6}
            className="px-5 py-2.5 bg-[var(--color-navy)] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            {isSubmitting ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Staff Member" : "Add Staff Member")}
          </button>
        </div>
      )}

      {/* Staff List */}
      <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--admin-text-secondary)] uppercase bg-[var(--admin-surface-alt)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Name</th>
                <th className="px-4 py-3.5 font-semibold">Role</th>
                <th className="px-4 py-3.5 font-semibold">Gate</th>
                <th className="px-4 py-3.5 font-semibold">PIN</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border-subtle)]">
              {staff.map((s) => {
                const cfg = roleConfig[s.role] || roleConfig.volunteer;
                return (
                  <tr key={s.id} className={`hover:bg-[var(--admin-hover)] transition-colors ${!s.is_active ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[var(--admin-text)]">{s.name}</div>
                      {s.phone && (
                        <div className="text-[10px] font-mono text-[var(--admin-text-muted)]">{s.phone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)] uppercase">
                      {s.assigned_gate || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyPin(s.pin_code)}
                        className="flex items-center gap-1.5 text-xs font-mono text-[var(--admin-text)] hover:text-[var(--color-turquoise)] transition-colors"
                      >
                        {s.pin_code}
                        {copiedPin === s.pin_code ? (
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-[var(--admin-text-muted)]" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(s.id, s.is_active)}
                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                          s.is_active
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10"
                            : "text-[var(--admin-text-muted)] bg-[var(--admin-surface-alt)]"
                        }`}
                      >
                        {s.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {s.is_active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => startEdit(s)}
                          className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--color-turquoise)] hover:bg-[var(--color-turquoise)]/10 transition-colors"
                          title="Edit Staff"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete Staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {staff.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--admin-text-muted)]">
                    No staff members yet. Add volunteers and gate managers for event day.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
