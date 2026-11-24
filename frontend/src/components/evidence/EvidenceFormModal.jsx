import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Field } from '../common/Field';
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Evidence Record' : templateData ? `Add Evidence (${templateData.title})` : 'Add Demonstrable Evidence'}
      description="Submit verifiable proof to back your capability profile."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
        <Alert type="error" message={error} onClose={() => setError(null)} />

        {/* Skill Selector */}
        <Field label="Associated Skill" required>
          {({ id, describedBy, isInvalid }) => (
            <select
              id={id}
              aria-describedby={describedBy}
              aria-invalid={isInvalid}
              value={formData.skillId}
              onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
            >
              <option value="" disabled>Select a skill from taxonomy</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} ({skill.category})
                </option>
              ))}
            </select>
          )}
        </Field>

        {/* Evidence Type */}
        <Field label="Evidence Type" required>
          {({ id, describedBy, isInvalid }) => (
            <select
              id={id}
              aria-describedby={describedBy}
              aria-invalid={isInvalid}
              value={formData.evidenceType}
              onChange={(e) => setFormData({ ...formData, evidenceType: e.target.value })}
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
            >
              <option value="PROJECT">Project / Repository</option>
              <option value="CERTIFICATE">Official Certificate</option>
              <option value="PUBLICATION">Publication / Research</option>
              <option value="OTHER">Competition / Other Proof</option>
            </select>
          )}
        </Field>

        {/* Title */}
        <Field label="Title" required>
          {({ id, describedBy, isInvalid }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={isInvalid}
              type="text"
              required
              maxLength={255}
              placeholder="e.g. Distributed Order Microservice in Spring Boot"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
            />
          )}
        </Field>

        {/* Evidence URL */}
        <Field label="Evidence Link / Proof URL" required hint="Must be a valid URL starting with http:// or https://">
          {({ id, describedBy, isInvalid }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={isInvalid}
              type="text"
              required
              maxLength={1024}
              placeholder="github.com/username/project or https://domain.com/cert"
              value={formData.evidenceUrl}
              onChange={(e) => setFormData({ ...formData, evidenceUrl: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
            />
          )}
        </Field>

        {/* Description */}
        <Field label="Description & Context" hint="Explain how this evidence demonstrates your skill mastery, architecture choices, or outcome">
          {({ id, describedBy, isInvalid }) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              aria-invalid={isInvalid}
              rows={3}
              placeholder="Explain how this evidence demonstrates your skill mastery, architecture choices, or outcome..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 resize-none transition"
            />
          )}
        </Field>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 bg-white border border-slate-300 rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition shadow-xs disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            {submitting ? 'Saving...' : initialData ? 'Update Evidence' : 'Submit Evidence'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EvidenceFormModal;
