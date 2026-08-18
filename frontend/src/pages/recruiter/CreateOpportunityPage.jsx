import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { opportunityApi } from '../../api/opportunityApi';
import { skillApi } from '../../api/skillApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { 
  Briefcase, 
  Layers, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  Save 
} from 'lucide-react';

export const CreateOpportunityPage = () => {
  const navigate = useNavigate();
  const [skillsTaxonomy, setSkillsTaxonomy] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: null });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'INTERNSHIP',
    location: '',
    workType: 'REMOTE',
    skills: [],
  });

  // Selector state
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedSkillType, setSelectedSkillType] = useState('REQUIRED');

  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoadingSkills(true);
        const data = await skillApi.getAllSkills();
        setSkillsTaxonomy(data);
      } catch (err) {
        console.error('Failed to load skills taxonomy:', err);
        setAlert({ type: 'error', message: 'Could not load skills taxonomy.' });
      } finally {
        setLoadingSkills(false);
      }
    };
    loadSkills();
  }, []);

  const handleAddSkill = () => {
    if (!selectedSkillId) return;

    const skillId = Number(selectedSkillId);
    if (formData.skills.some((s) => s.skillId === skillId)) {
      setAlert({ type: 'info', message: 'This skill has already been added to requirements.' });
      return;
    }

    const skillObj = skillsTaxonomy.find((s) => s.id === skillId);
    if (!skillObj) return;

    setFormData({
      ...formData,
      skills: [
        ...formData.skills,
        {
          skillId: skillObj.id,
          skillName: skillObj.name,
          skillCategory: skillObj.category,
          skillType: selectedSkillType,
        },
      ],
    });
    setSelectedSkillId('');
  };

  const handleRemoveSkill = (skillId) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s.skillId !== skillId),
    });
  };

  const handleSubmit = async (e, publishAfterCreate = false) => {
    e.preventDefault();
    setAlert({ type: null, message: null });

    if (!formData.title.trim()) {
      setAlert({ type: 'error', message: 'Opportunity title is required.' });
      return;
    }
    if (!formData.description.trim()) {
      setAlert({ type: 'error', message: 'Opportunity description is required.' });
      return;
    }

    if (publishAfterCreate) {
      const hasRequired = formData.skills.some((s) => s.skillType === 'REQUIRED');
      if (!hasRequired) {
        setAlert({ type: 'error', message: 'A published opportunity requires at least one REQUIRED skill.' });
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location: formData.location || null,
        workType: formData.workType,
        skills: formData.skills.map((s) => ({
          skillId: s.skillId,
          skillType: s.skillType,
        })),
      };

      const created = await opportunityApi.createOpportunity(payload);

      if (publishAfterCreate) {
        await opportunityApi.publishOpportunity(created.id);
      }

      navigate(`/recruiter/opportunities/${created.id}`);
    } catch (err) {
      if (err.response?.status === 403) {
        setAlert({
          type: 'error',
          message: 'Access Denied: Creating and publishing opportunities requires a RECRUITER account. Please switch or register an account as a Recruiter.',
        });
      } else {
        const errMsg = err.response?.data?.message || 'Failed to create opportunity. Please check your inputs.';
        setAlert({ type: 'error', message: errMsg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSkills) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSpinner size="lg" text="Loading skills taxonomy..." />
      </div>
    );
  }

  const requiredSkills = formData.skills.filter((s) => s.skillType === 'REQUIRED');
  const preferredSkills = formData.skills.filter((s) => s.skillType === 'PREFERRED');

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Top navigation */}
      <div className="flex items-center gap-2">
        <Link
          to="/recruiter/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </Link>
      </div>

      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Create Role Opportunity
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Specify exact required and preferred capabilities to match against real evidence.
        </p>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      <form className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 tracking-tight">
            <Briefcase className="w-4 h-4 text-teal-400" />
            <span>Opportunity Details</span>
          </h2>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Title <span className="text-teal-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={255}
              placeholder="e.g. Java & Distributed Systems Backend Intern"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          {/* Type & Work Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Opportunity Type <span className="text-teal-400">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition"
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="JOB">Full-Time Job</option>
                <option value="PROJECT">Contract / Project</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Type <span className="text-teal-400">*</span>
              </label>
              <select
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                maxLength={255}
                placeholder="e.g. Bangalore / Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Role Description & Mission <span className="text-teal-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Outline the responsibilities, tech stack, and practical deliverables for this role..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
            />
          </div>
        </div>

        {/* Skill Requirements Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Skill Capability Requirements</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select standardized taxonomy skills. Required skills mandate verifiable proof (minimum 50% required threshold for match qualification).
            </p>
          </div>

          {/* Add Skill Row */}
          <div className="flex flex-col sm:flex-row items-end gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Taxonomy Skill
              </label>
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              >
                <option value="">Select a skill from taxonomy</option>
                {skillsTaxonomy.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name} ({skill.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-48">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Requirement Tier
              </label>
              <select
                value={selectedSkillType}
                onChange={(e) => setSelectedSkillType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              >
                <option value="REQUIRED">Required (Core)</option>
                <option value="PREFERRED">Preferred (Bonus)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddSkill}
              className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition shrink-0 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Selected Skills Lists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Required Skills */}
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-850/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  Required Skills ({requiredSkills.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Mandatory for matching</span>
              </div>

              {requiredSkills.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No required skills added. At least 1 required skill is needed to publish.
                </p>
              ) : (
                <div className="space-y-2">
                  {requiredSkills.map((s) => (
                    <div
                      key={s.skillId}
                      className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-lg border border-slate-700/60 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{s.skillName}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({s.skillCategory})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.skillId)}
                        className="text-slate-400 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Skills */}
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-850/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Preferred Skills ({preferredSkills.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Optional bonus</span>
              </div>

              {preferredSkills.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No preferred skills added.
                </p>
              ) : (
                <div className="space-y-2">
                  {preferredSkills.map((s) => (
                    <div
                      key={s.skillId}
                      className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-lg border border-slate-700/60 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{s.skillName}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({s.skillCategory})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.skillId)}
                        className="text-slate-400 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Link
            to="/recruiter/opportunities"
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, false)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Publish & Match</span>
          </button>
        </div>
      </form>
    </div>
  );
};
