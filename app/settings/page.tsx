'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/profile';
import { ShieldCheck, UserPlus, UserMinus, UserCheck, Loader2, Users } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal confirm states
  const [actionMember, setActionMember] = useState<Profile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'remove' | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchMembers = async () => {
    if (!profile?.pharmacy_id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('pharmacy_id', profile.pharmacy_id)
        .order('email', { ascending: true });

      if (error) throw error;
      setMembers((data || []) as any);
    } catch (e) {
      console.error('Error fetching pharmacy members:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.pharmacy_id && profile?.role === 'owner') {
      fetchMembers();
    }
  }, [profile]);

  if (profile?.role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
        <div className="p-3 bg-rose-50 text-rose-500 rounded-full mb-3">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <p className="text-slate-700 font-bold text-base">Access Denied</p>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Only the workspace administrator/owner can access the workspace settings and manage employees.
        </p>
      </div>
    );
  }

  const handleApprove = async (member: Profile) => {
    setSubmittingAction(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved', role: 'employee' })
        .eq('id', member.id);

      if (error) throw error;

      // Update state
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, status: 'approved', role: 'employee' } : m))
      );
    } catch (e) {
      console.error('Error approving user:', e);
      alert('Failed to approve member.');
    } finally {
      setSubmittingAction(false);
      setActionMember(null);
      setActionType(null);
    }
  };

  const handleRemoveOrReject = async (member: Profile) => {
    setSubmittingAction(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ pharmacy_id: null, role: 'employee', status: 'pending' })
        .eq('id', member.id);

      if (error) throw error;

      // Update state (remove from local list)
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch (e) {
      console.error('Error removing user:', e);
      alert('Failed to process request.');
    } finally {
      setSubmittingAction(false);
      setActionMember(null);
      setActionType(null);
    }
  };

  const activeEmployees = members.filter((m) => m.status === 'approved' && m.id !== user?.id);
  const pendingRequests = members.filter((m) => m.status === 'pending');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 tracking-tight">Pharmacy Workspace Settings</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Manage workspace members, approve join requests, and configure team access.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <span className="text-slate-400 text-sm">Loading member logs...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Pending Join Requests */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-slate-800 text-base">Pending Join Requests</h3>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-6 text-center text-xs sm:text-sm text-slate-400 font-medium">
                No pending join requests found.
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">{req.email}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Requested: {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActionMember(req);
                          setActionType('reject');
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setActionMember(req);
                          setActionType('approve');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm hover:shadow"
                      >
                        <UserCheck className="h-3 w-3" />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Active Staff members */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-500" />
              <h3 className="font-bold text-slate-800 text-base">Active Team Members</h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
              {/* Owner row (always first) */}
              <div className="flex items-center justify-between p-4 bg-slate-50/30">
                <div>
                  <span className="font-semibold text-slate-800 text-sm">
                    {profile?.email} (You)
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Workspace Creator</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Owner
                </span>
              </div>

              {/* Employee rows */}
              {activeEmployees.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-semibold italic">
                  No other employees linked to this pharmacy yet.
                </div>
              ) : (
                activeEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">{emp.email}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Role: Employee &bull; Joined:{' '}
                        {new Date(emp.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActionMember(emp);
                        setActionType('remove');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg transition-colors cursor-pointer"
                      title="Remove Staff Access"
                    >
                      <UserMinus className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      <ConfirmationModal
        isOpen={actionMember !== null}
        title={
          actionType === 'approve'
            ? 'Accept Join Request'
            : actionType === 'reject'
            ? 'Reject Join Request'
            : 'Remove Team Member'
        }
        message={
          actionMember
            ? actionType === 'approve'
              ? `Are you sure you want to approve ${actionMember.email} as an employee? They will gain access to write and return stock.`
              : actionType === 'reject'
              ? `Are you sure you want to reject the join request from ${actionMember.email}?`
              : `Are you sure you want to remove ${actionMember.email} from your pharmacy team? They will lose all access immediately.`
            : ''
        }
        confirmLabel={
          actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Remove'
        }
        variant={actionType === 'approve' ? 'info' : 'danger'}
        onConfirm={() => {
          if (actionMember) {
            if (actionType === 'approve') {
              handleApprove(actionMember);
            } else {
              handleRemoveOrReject(actionMember);
            }
          }
        }}
        onCancel={() => {
          setActionMember(null);
          setActionType(null);
        }}
      />
    </div>
  );
}
