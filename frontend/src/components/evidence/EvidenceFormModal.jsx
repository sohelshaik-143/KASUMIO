import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Field } from '../common/Field';
import { Alert } from '../common/Alert';
import { EvidencePhotoUploader } from './EvidencePhotoUploader';

/**
 * EvidenceFormModal - Create or Update Evidence with Mandatory Screenshot Proof
 */
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
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [photoFileName, setPhotoFileName] = useState('');
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
      // Retrieve stored photo if available
      const savedPhoto = localStorage.getItem(`evidence_photo_${initialData.id}`) || initialData.photoUrl || '';
      setPhotoDataUrl(savedPhoto);
      setPhotoFileName(savedPhoto ? 'Existing Evidence Photo' : '');
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
      setPhotoDataUrl('');
      setPhotoFileName('');
    } else {
      const defaultSkillId = preselectedSkillId || (skills.length > 0 ? skills[0].id : '');
      setFormData({
        skillId: defaultSkillId,
        title: targetSkillName ? `${targetSkillName} Project Evidence` : '',
        description: '',
        evidenceUrl: '',
        evidenceType: 'PROJECT',
      });
      setPhotoDataUrl('');
      setPhotoFileName('');
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
    // Mandatory photo upload requirement
    if (!photoDataUrl) {
      setError('A photo or screenshot of the evidence is mandatory. Please upload an image.');
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
      const res = await onSubmit({
        ...formData,
        evidenceUrl: formattedUrl,
        skillId: Number(formData.skillId),
        photoUrl: photoDataUrl,
      });

      // Persist photo in local client storage associated with the created/updated evidence ID
      const targetId = res?.id || initialData?.id;
      if (targetId && photoDataUrl) {
        localStorage.setItem(`evidence_photo_${targetId}`, photoDataUrl);
      }
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
      description="Submit verifiable proof backed by screenshot artifacts to prove your capability."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
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
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
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
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
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
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            />
          )}
        </Field>

        {/* Evidence URL */}
        <Field label="Evidence Link / Proof URL" required hint="Valid link to repository, live deployment, or credential verification">
          {({ id, describedBy, isInvalid }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={isInvalid}
              type="text"
              required
              placeholder="https://github.com/..."
              value={formData.evidenceUrl}
              onChange={(e) => setFormData({ ...formData, evidenceUrl: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition font-mono text-xs"
            />
          )}
        </Field>

        {/* Mandatory Photo / Screenshot Upload */}
        <EvidencePhotoUploader
          photoDataUrl={photoDataUrl}
          photoFileName={photoFileName}
          onPhotoSelected={(dataUrl, name) => {
            setPhotoDataUrl(dataUrl);
            setPhotoFileName(name);
            setError(null);
          }}
          onPhotoRemoved={() => {
            setPhotoDataUrl('');
            setPhotoFileName('');
          }}
          onError={(err) => setError(err)}
        />

        {/* Description */}
        <Field label="Technical Context / Description" hint="Explain the architecture, design choices, or problem solved">
          {({ id, describedBy, isInvalid }) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              aria-invalid={isInvalid}
              rows={3}
              maxLength={2000}
              placeholder="Summary of tech stack, architectural design, and quantifiable achievements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition resize-none"
            />
          )}
        </Field>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {submitting ? 'Submitting Proof...' : initialData ? 'Save Changes' : 'Submit Evidence'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EvidenceFormModal;
