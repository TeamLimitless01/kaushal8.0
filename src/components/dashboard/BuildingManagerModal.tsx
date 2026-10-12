'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Building,
} from 'lucide-react';

export interface ManagedBuilding {
  id: string;
  name: string;
  campusId?: string;
  roomCount?: number;
  usageCount?: number;
}

interface BuildingManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildingsUpdated?: (buildings: ManagedBuilding[]) => void;
}

export default function BuildingManagerModal({
  isOpen,
  onClose,
  onBuildingsUpdated,
}: BuildingManagerModalProps) {
  const [buildings, setBuildings] = useState<ManagedBuilding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBuildingName, setNewBuildingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Deletion confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch buildings on open
  useEffect(() => {
    if (isOpen) {
      loadBuildings();
    }
  }, [isOpen]);

  const loadBuildings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/buildings');
      const data = await res.json();
      if (data.success && Array.isArray(data.buildings)) {
        setBuildings(data.buildings);
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: 'Failed to load buildings list.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newBuildingName.trim();
    if (!name) return;

    setIsAdding(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/buildings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create building');
      }

      setNewBuildingName('');
      setFeedback({ type: 'success', message: `Building "${name}" added successfully!` });
      
      const updatedList = [...buildings, { id: data.building.id, name: data.building.name, roomCount: 0, usageCount: 0 }].sort((a, b) => a.name.localeCompare(b.name));
      setBuildings(updatedList);
      onBuildingsUpdated?.(updatedList);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error creating building' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (b: ManagedBuilding) => {
    setEditingId(b.id);
    setEditingName(b.name);
    setDeletingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed || trimmed.length < 2) return;

    setIsSavingEdit(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/buildings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update building');
      }

      const updatedList = buildings.map((b) => (b.id === id ? { ...b, name: trimmed } : b)).sort((a, b) => a.name.localeCompare(b.name));
      setBuildings(updatedList);
      setEditingId(null);
      setFeedback({ type: 'success', message: `Renamed to "${trimmed}" successfully!` });
      onBuildingsUpdated?.(updatedList);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating building' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteBuilding = async (id: string) => {
    setIsDeleting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/buildings?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete building');
      }

      const updatedList = buildings.filter((b) => b.id !== id);
      setBuildings(updatedList);
      setDeletingId(null);
      setFeedback({ type: 'success', message: data.message || 'Building deleted successfully.' });
      onBuildingsUpdated?.(updatedList);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error deleting building' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Manage Campus Buildings
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, rename, or delete institutional facilities rendered across filters & IoT telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3 rounded-2xl text-xs font-medium flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-[10px] font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Add New Building Form */}
        <div className="p-6 border-b border-slate-100">
          <form onSubmit={handleAddBuilding} className="flex gap-2.5">
            <input
              type="text"
              placeholder="e.g. Block D (Innovation & AI Complex)"
              value={newBuildingName}
              onChange={(e) => setNewBuildingName(e.target.value)}
              className="flex-1 text-xs bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={isAdding || !newBuildingName.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer shrink-0"
            >
              {isAdding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Add Building</span>
            </button>
          </form>
        </div>

        {/* Buildings List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 scrollbar-thin">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Existing Buildings ({buildings.length})
            </span>
            <span className="text-[10px] text-slate-400">
              Live synchronized across database
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Fetching campus buildings...</span>
            </div>
          ) : buildings.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No buildings registered yet. Add one above!
            </div>
          ) : (
            buildings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 group"
              >
                {editingId === b.id ? (
                  // Inline Edit View
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 text-xs bg-white border border-emerald-500 rounded-lg px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(b.id)}
                      disabled={isSavingEdit || !editingName.trim()}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                      title="Save"
                    >
                      {isSavingEdit ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : deletingId === b.id ? (
                  // Deletion Confirm View
                  <div className="flex-1 flex items-center justify-between bg-red-50/80 p-2 rounded-xl border border-red-200 text-xs text-red-800">
                    <span className="font-semibold">Confirm delete "{b.name}"?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDeleteBuilding(b.id)}
                        disabled={isDeleting}
                        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Normal View
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Building className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {b.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          {typeof b.roomCount === 'number' && (
                            <span>{b.roomCount} Rooms</span>
                          )}
                          {typeof b.usageCount === 'number' && (
                            <>
                              <span>•</span>
                              <span>{b.usageCount} Usage Records</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(b)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
                        title="Rename Building"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(b.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Delete Building"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Changes take effect immediately across all dashboard filters & IoT telemetry.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
