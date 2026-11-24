import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { goalApi } from '../api/goalApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Field } from '../components/common/Field';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Target, Plus, Trash2, Edit3, Briefcase } from 'lucide-react';

export const CareerGoalsPage = () => {
  const { user, isStudent, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    targetRole: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await goalApi.getMyGoals();
      setGoals(data || []);
    } catch (err) {
      console.error('Failed to load career goals:', err);
      const errMsg = err.response?.data?.message || 'Could not fetch your career goals.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isStudent) {
      fetchGoals();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id, user?.role, isStudent]);

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setFormData({ title: '', targetRole: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetRole: goal.targetRole,
      description: goal.description || '',
    });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return;
    try {
      setDeleting(true);
      await goalApi.deleteGoal(goalToDelete.id);
      setGoals(goals.filter((g) => g.id !== goalToDelete.id));
      setAlert({ type: 'success', message: 'Career goal removed.' });
      setGoalToDelete(null);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete career goal.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert({ type: null, message: null });

    try {
      if (editingGoal) {
        const updated = await goalApi.updateGoal(editingGoal.id, formData);
        setGoals(goals.map((g) => (g.id === editingGoal.id ? updated : g)));
        setAlert({ type: 'success', message: 'Career goal updated successfully.' });
      } else {
        const created = await goalApi.createGoal(formData);
        setGoals([...goals, created]);
        setAlert({ type: 'success', message: 'Career goal added.' });
      }
      setIsModalOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to save career goal.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSpinner size="lg" text="Loading your career goals..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <Target className="w-4 h-4" aria-hidden="true" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Career Goals</h1>
          </div>
          <p className="text-sm text-slate-600">
            Define your target professional roles to contextualize your skill evidence.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New Goal</span>
        </button>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No career goals defined"
          description="Setting a target role helps articulate your desired engineering direction."
          actionText="Add Target Role"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white border border-slate-200 hover:border-teal-300 rounded-xl p-5 transition flex flex-col justify-between shadow-xs space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                    <Briefcase className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
                    <span>{goal.targetRole}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(goal)}
                      aria-label={`Edit ${goal.title}`}
                      className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-md transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      <Edit3 className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoalToDelete(goal)}
                      aria-label={`Delete ${goal.title}`}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded-md transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <h2 className="text-base font-bold text-slate-900 tracking-tight">{goal.title}</h2>
                {goal.description && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{goal.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goal Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Career Goal' : 'New Career Goal'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Goal Title" required>
            {({ id, describedBy, isInvalid }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={isInvalid}
                type="text"
                required
                placeholder="e.g. Master Backend Systems & Distributed Databases"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
              />
            )}
          </Field>

          <Field label="Target Role" required>
            {({ id, describedBy, isInvalid }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={isInvalid}
                type="text"
                required
                placeholder="e.g. Senior Backend Engineer"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
              />
            )}
          </Field>

          <Field label="Description" hint="Briefly describe your objectives or focus areas">
            {({ id, describedBy, isInvalid }) => (
              <textarea
                id={id}
                aria-describedby={describedBy}
                aria-invalid={isInvalid}
                rows={3}
                placeholder="Briefly describe your objectives or focus areas..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 resize-none transition"
              />
            )}
          </Field>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 bg-white border border-slate-300 rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-xs transition disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              {submitting ? 'Saving...' : 'Save Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Accessible Confirm Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(goalToDelete)}
        onClose={() => setGoalToDelete(null)}
        title="Delete Career Goal"
        message={`Are you sure you want to delete "${goalToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Goal"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default CareerGoalsPage;
