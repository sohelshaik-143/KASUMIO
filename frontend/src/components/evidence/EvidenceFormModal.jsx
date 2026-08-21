import React, { useState, useEffect } from 'react';
import { X, ExternalLink, AlertCircle, ShieldCheck } from 'lucide-react';
import { Alert } from '../common/Alert';

export const EvidenceFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  skills = [],
  initialData = null,
  templateData = null,
  preselectedSkillId = null,
  targetSkillName = null,
}) => {
  const [formData, setFormData] = useState({
    skillId: '',
    title: '',
    description: '',
    evidenceUrl: '',
    evidenceType: 'PROJECT',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        skillId: initialData.skillId || '',
        title: initialData.title || '',
        description: initialData.description || '',
        evidenceUrl: initialData.evidenceUrl || '',
        evidenceType: initialData.evidenceType || 'PROJECT',
      });
    } else if (templateData) {
      let fields = {};
      try {
        fields = typeof templateData.suggestedFields === 'string'
          ? JSON.parse(templateData.suggestedFields)
          : templateData.suggestedFields || {};
      } catch (e) {
        fields = {};
      }

      setFormData({
        skillId: preselectedSkillId || (skills.length > 0 ? skills[0].id : ''),
        title: fields.suggested_title || templateData.title || '',
        description: templateData.description || '',
        evidenceUrl: '',
        evidenceType: templateData.evidenceType || 'PROJECT',
      });
    } else {
      const defaultSkillId = preselectedSkillId || (skills.length > 0 ? skills[0].id : '');
      setFormData({
        skillId: defaultSkillId,
        title: targetSkillName ? `${targetSkillName} Project Evidence` : '',
        description: '',
        evidenceUrl: '',
        evidenceType: 'PROJECT',
      });
    }
    setError(null);
  }, [initialData, templateData, skills, preselectedSkillId, targetSkillName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.skillId) {
      setError('Please select an associated skill from the taxonomy dropdown.');
      return;
    }
    if (!formData.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!formData.evidenceUrl.trim()) {
      setError('Evidence URL is required.');
      return;
    }

    let formattedUrl = formData.evidenceUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch (_) {
      setError('Please enter a valid URL (e.g. https://github.com/username/project).');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        evidenceUrl: formattedUrl,
        skillId: Number(formData.skillId),
      });
      onClose();
    } catch (err) {
      let errMsg = 'Failed to save evidence. Please verify your inputs.';
      if (err.response?.data?.validationErrors) {
        errMsg = Object.values(err.response.data.validationErrors).join(', ');
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {initialData ? 'Edit Evidence Record' : templateData ? `Add Evidence (${templateData.title})` : 'Add Demonstrable Evidence'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Submit verifiable proof to back your capability profile.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <Alert type="error" message={error} onClose={() => setError(null)} />

          {/* Skill Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Associated Skill <span className="text-teal-400">*</span>
            </label>
            <select
              value={formData.skillId}
              onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
              required
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
            >
              <option value="" disabled>Select a skill from taxonomy</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} ({skill.category})
                </option>
              ))}
            </select>
          </div>

          {/* Evidence Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Evidence Type <span className="text-teal-400">*</span>
            </label>
            <select
              value={formData.evidenceType}
              onChange={(e) => setFormData({ ...formData, evidenceType: e.target.value })}
              required
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
            >
              <option value="PROJECT">Project / Repository</option>
              <option value="CERTIFICATE">Official Certificate</option>
              <option value="PUBLICATION">Publication / Research</option>
              <option value="OTHER">Competition / Other Proof</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title <span className="text-teal-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={255}
              placeholder="e.g. Distributed Order Microservice in Spring Boot"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
            />
          </div>

          {/* Evidence URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Evidence Link / Proof URL <span className="text-teal-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={1024}
              placeholder="github.com/username/project or https://domain.com/cert"
              value={formData.evidenceUrl}
              onChange={(e) => setFormData({ ...formData, evidenceUrl: e.target.value })}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 font-mono text-xs transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description & Context
            </label>
            <textarea
              rows={3}
              placeholder="Explain how this evidence demonstrates your skill mastery, architecture choices, or outcome..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 resize-none transition"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition shadow-sm disabled:opacity-50 active:scale-98"
            >
              {submitting ? 'Saving...' : initialData ? 'Update Evidence' : 'Submit Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvidenceFormModal;
