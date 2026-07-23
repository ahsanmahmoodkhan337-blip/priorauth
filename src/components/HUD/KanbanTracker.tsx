'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, GripVertical, DollarSign, Clock, AlertCircle,
  CheckCircle2, XCircle, Phone, FileText, ChevronRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PAStatus =
  | 'DRAFT'
  | 'NEEDS_CLINICALS'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'DENIED'
  | 'P2P_REQUIRED'
  | 'APPEAL_LEVEL_1';

interface PACard {
  id: string;
  patientInitials: string;
  cpt: string;
  payer: string;
  dollarValue: number;
  status: PAStatus;
  daysAgo: number;
}

interface Column {
  id: PAStatus;
  title: string;
  color: string;
  bgColor: string;
  cards: PACard[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<PAStatus, string> = {
  DRAFT: 'Draft',
  NEEDS_CLINICALS: 'Needs Clinicals',
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  DENIED: 'Denied',
  P2P_REQUIRED: 'P2P Required',
  APPEAL_LEVEL_1: 'Appeal L1',
};

const STATUS_COLORS: Record<PAStatus, { color: string; bg: string }> = {
  DRAFT: { color: '#69727D', bg: '#F7F8FA' },
  NEEDS_CLINICALS: { color: '#FF9100', bg: '#FFF3E0' },
  SUBMITTED: { color: '#1E5CD4', bg: '#E8F0FE' },
  IN_REVIEW: { color: '#FAD23B', bg: '#FFFDE7' },
  APPROVED: { color: '#00E676', bg: '#E8F5E9' },
  DENIED: { color: '#FF1744', bg: '#FFEBEE' },
  P2P_REQUIRED: { color: '#FF9100', bg: '#FFF3E0' },
  APPEAL_LEVEL_1: { color: '#0B1F3A', bg: '#ECEFF1' },
};

// ---------------------------------------------------------------------------
// Initial Data
// ---------------------------------------------------------------------------

const INITIAL_CARDS: PACard[] = [
  { id: 'PA-001', patientInitials: 'JD', cpt: '63030', payer: 'Aetna', dollarValue: 12500, status: 'DRAFT', daysAgo: 0 },
  { id: 'PA-002', patientInitials: 'MK', cpt: '27447', payer: 'UHC', dollarValue: 18700, status: 'NEEDS_CLINICALS', daysAgo: 2 },
  { id: 'PA-003', patientInitials: 'RL', cpt: '43239', payer: 'BCBS', dollarValue: 9500, status: 'SUBMITTED', daysAgo: 5 },
  { id: 'PA-004', patientInitials: 'SW', cpt: '22551', payer: 'Cigna', dollarValue: 22300, status: 'IN_REVIEW', daysAgo: 7 },
  { id: 'PA-005', patientInitials: 'AB', cpt: '92928', payer: 'Humana', dollarValue: 8400, status: 'APPROVED', daysAgo: 12 },
  { id: 'PA-006', patientInitials: 'TP', cpt: '33405', payer: 'Aetna', dollarValue: 31000, status: 'DENIED', daysAgo: 9 },
  { id: 'PA-007', patientInitials: 'CG', cpt: '27130', payer: 'UHC', dollarValue: 15600, status: 'P2P_REQUIRED', daysAgo: 4 },
  { id: 'PA-008', patientInitials: 'BH', cpt: '47562', payer: 'BCBS', dollarValue: 11200, status: 'APPEAL_LEVEL_1', daysAgo: 6 },
];

const COLUMN_IDS: PAStatus[] = [
  'DRAFT', 'NEEDS_CLINICALS', 'SUBMITTED', 'IN_REVIEW',
  'APPROVED', 'DENIED', 'P2P_REQUIRED', 'APPEAL_LEVEL_1',
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KanbanTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KanbanTracker({ isOpen, onClose }: KanbanTrackerProps) {
  const [cards, setCards] = useState<PACard[]>(INITIAL_CARDS);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const getColumnCards = (status: PAStatus): PACard[] =>
    cards.filter((c) => c.status === status);

  const getStatusBadge = (status: PAStatus) => {
    const sc = STATUS_COLORS[status];
    return (
      <span
        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1"
        style={{ backgroundColor: sc.bg, color: sc.color }}
      >
        {status === 'APPROVED' && <CheckCircle2 size={8} />}
        {status === 'DENIED' && <XCircle size={8} />}
        {status === 'P2P_REQUIRED' && <Phone size={8} />}
        {STATUS_LABELS[status]}
      </span>
    );
  };

  const handleDragStart = (cardId: string) => {
    setDraggedCard(cardId);
  };

  const handleDrop = (targetStatus: PAStatus) => {
    if (!draggedCard) return;
    setCards((prev) =>
      prev.map((c) => (c.id === draggedCard ? { ...c, status: targetStatus, daysAgo: 0 } : c))
    );
    setDraggedCard(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddCard = () => {
    const newId = `PA-${String(cards.length + 1).padStart(3, '0')}`;
    setCards((prev) => [
      ...prev,
      {
        id: newId,
        patientInitials: 'NEW',
        cpt: '00000',
        payer: 'Unknown',
        dollarValue: 0,
        status: 'DRAFT',
        daysAgo: 0,
      },
    ]);
    setShowAddForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#0B1F3A]/5 to-[#1E5CD4]/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0B1F3A]/10">
              <span className="text-xl">📋</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0D0F67]">Master PA Kanban Tracker</h2>
              <p className="text-xs text-[#69727D]">
                {cards.length} active PAs · ${cards.reduce((s, c) => s + c.dollarValue, 0).toLocaleString()} total revenue
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddCard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                         bg-[#1E5CD4] text-white text-xs font-semibold
                         hover:brightness-110 transition-all duration-200 shadow-sm"
            >
              <Plus size={12} />
              Add New PA Case
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
              <X size={18} className="text-[#69727D]" />
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-3 min-w-[1400px]">
            {COLUMN_IDS.map((status) => {
              const columnCards = getColumnCards(status);
              const sc = STATUS_COLORS[status];

              return (
                <div
                  key={status}
                  className="flex-shrink-0 w-[180px]"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(status)}
                >
                  {/* Column Header */}
                  <div
                    className="rounded-t-lg px-3 py-2.5 flex items-center justify-between"
                    style={{ backgroundColor: sc.bg, borderBottom: `2px solid ${sc.color}` }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: sc.color }}>
                      {STATUS_LABELS[status]}
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: 'white', color: sc.color }}
                    >
                      {columnCards.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div
                    className="rounded-b-lg bg-[#F7F8FA] p-2 min-h-[300px] space-y-2"
                    style={{ borderLeft: `1px solid ${sc.bg}`, borderRight: `1px solid ${sc.bg}`, borderBottom: `1px solid ${sc.bg}` }}
                  >
                    {columnCards.map((card) => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={() => handleDragStart(card.id)}
                        className="bg-white rounded-lg border border-[#E5E7EB] p-2.5 cursor-grab active:cursor-grabbing
                                   hover:shadow-md hover:border-[#1E5CD4]/40 transition-all duration-150"
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <GripVertical size={10} className="text-[#69727D]/40" />
                            <span className="text-[11px] font-bold text-[#0D0F67]">
                              {card.patientInitials}
                            </span>
                          </div>
                          {getStatusBadge(card.status)}
                        </div>

                        {/* Card Details */}
                        <div className="space-y-1 text-[9px]">
                          <div className="flex items-center justify-between text-[#69727D]">
                            <span>CPT {card.cpt}</span>
                            <span className="flex items-center gap-0.5">
                              <Clock size={8} />
                              {card.daysAgo}d
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#69727D]">{card.payer}</span>
                            <span className="font-bold text-[#0D0F67]">
                              ${card.dollarValue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {columnCards.length === 0 && (
                      <div className="flex items-center justify-center h-20 text-[9px] text-[#69727D]/40">
                        Drop cards here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="px-6 py-3 border-t border-[#E5E7EB] bg-[#F7F8FA] grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-[10px] text-[#69727D]">Total PAs</p>
            <p className="text-sm font-bold text-[#0D0F67]">{cards.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#69727D]">Revenue at Risk</p>
            <p className="text-sm font-bold text-[#FAD23B]">
              ${cards.filter(c => !['APPROVED'].includes(c.status)).reduce((s, c) => s + c.dollarValue, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#69727D]">Approval Rate</p>
            <p className="text-sm font-bold text-[#00E676]">
              {Math.round((cards.filter(c => c.status === 'APPROVED').length / cards.length) * 100)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#69727D]">Needs Attention</p>
            <p className="text-sm font-bold text-[#FF9100]">
              {cards.filter(c => ['NEEDS_CLINICALS', 'P2P_REQUIRED', 'APPEAL_LEVEL_1'].includes(c.status)).length}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
