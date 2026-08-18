import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { evidenceApi } from '../api/evidenceApi';
import { skillApi } from '../api/skillApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { TemplatePickerModal } from '../components/evidence/TemplatePickerModal';
import { EvidenceFormModal } from '../components/evidence/EvidenceFormModal';
import { ShieldCheck, Plus, FileCode2, Filter } from 'lucide-react';

export const EvidencePage = () => {
  const { user, isStudent, loading: authLoading } = useAuth();
  const [evidenceList, setEvidenceList] = useState([]);
  const [skills, setSkills] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });

  // Modals
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [evData, skillData, tplData, verifData] = await Promise.all([
        evidenceApi.getMyEvidence().catch(() => []),
        skillApi.getAllSkills().catch(() => []),
        evidenceApi.getTemplates().catch(() => []),
        evidenceApi.getStudentVerificationStatus().catch(() => []),
      ]);

      const verifMap = new Map();
      if (Array.isArray(verifData)) {
        verifData.forEach((item) => {
          verifMap.set(item.evidenceId, item.verifications || []);
        });
      }

      const mergedEv = (evData || []).map((ev) => ({
        ...ev,
        opportunityVerifications: verifMap.get(ev.id) || [],
      }));

      setEvidenceList(mergedEv);
      setSkills(skillData || []);
      setTemplates(tplData || []);
    } catch (err) {
      console.error('Failed to load evidence:', err);
      const errMsg = err.response?.data?.message || 'Could not load your evidence records.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isStudent) {
      loadData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id, user?.role, isStudent]);

  const handleOpenTemplatePicker = () => {
    setEditingEvidence(null);
    setTemplateModalOpen(true);
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateModalOpen(false);
    setFormModalOpen(true);
  };

  const handleOpenDirectAdd = () => {
    setEditingEvidence(null);
    setSelectedTemplate(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (ev) => {
    setEditingEvidence(ev);
    setSelectedTemplate(null);
    setFormModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this evidence record?')) return;
    try {
      await evidenceApi.deleteEvidence(id);
      await loadData();
      setAlert({ type: 'success', message: 'Evidence record removed.' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete evidence.' });
    }
  };

  const handleFormSubmit = async (payload) => {
    if (editingEvidence) {
      await evidenceApi.updateEvidence(editingEvidence.id, payload);
      setAlert({ type: 'success', message: 'Evidence record updated.' });
    } else {
      await evidenceApi.createEvidence(payload);
      setAlert({ type: 'success', message: 'New evidence successfully submitted.' });
    }
    await loadData();
  };

  const filteredEvidence = selectedSkillFilter === 'ALL'
    ? evidenceList
    : evidenceList.filter((e) => String(e.skillId) === String(selectedSkillFilter));

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSpinner size="lg" text="Loading your evidence records..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Evidence Footprint</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Demonstrable, traceable proof of practical competency across standardized taxonomy skills.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenTemplatePicker}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <FileCode2 className="w-4 h-4 text-teal-400" />
            <span>Use Template</span>
          </button>

          <button
            onClick={handleOpenDirectAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Evidence</span>
          </button>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Filter by skill */}
      {evidenceList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 flex items-center gap-1 shrink-0 font-medium mr-1">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            Filter Skill:
          </span>
          <button
            onClick={() => setSelectedSkillFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition shrink-0 ${
              selectedSkillFilter === 'ALL'
                ? 'bg-teal-600 border-teal-500 text-white shadow-sm'
                : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white'
            }`}
          >
            All Skills ({evidenceList.length})
          </button>
          {skills.map((skill) => {
            const count = evidenceList.filter((e) => e.skillId === skill.id).length;
            if (count === 0) return null;
            return (
              <button
                key={skill.id}
                onClick={() => setSelectedSkillFilter(String(skill.id))}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition shrink-0 ${
                  selectedSkillFilter === String(skill.id)
                    ? 'bg-teal-600 border-teal-500 text-white shadow-sm'
                    : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white'
                }`}
              >
                {skill.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Evidence Grid or Empty State */}
      {filteredEvidence.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No evidence submitted yet"
          description="Build trust through transparent work. Use a standardized template to submit your first code repository, deployed application, or certification."
          actionText="Select a Template"
          onAction={handleOpenTemplatePicker}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvidence.map((ev) => (
            <EvidenceCard
              key={ev.id}
              evidence={ev}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <TemplatePickerModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
      />

      <EvidenceFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingEvidence(null);
          setSelectedTemplate(null);
        }}
        onSubmit={handleFormSubmit}
        skills={skills}
        initialData={editingEvidence}
        templateData={selectedTemplate}
      />
    </div>
  );
};
