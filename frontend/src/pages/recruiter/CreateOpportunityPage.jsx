

import React, { useState, useEffect, useRef } from 'react';
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
  Save,
  Search,
  Sparkles
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

  // Typed skill input state
  const [typedSkillName, setTypedSkillName] = useState('');
  const [selectedSkillType, setSelectedSkillType] = useState('REQUIRED');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoadingSkills(true);
        const data = await skillApi.getAllSkills();
        setSkillsTaxonomy(data || []);
      } catch (err) {
        console.error('Failed to load skills taxonomy:', err);
        setAlert({ type: 'error', message: 'Could not load skills taxonomy.' });
      } finally {
        setLoadingSkills(false);
      }
    };
    loadSkills();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = typedSkillName.trim()
    ? skillsTaxonomy.filter((s) =>
      s.name.toLowerCase().includes(typedSkillName.trim().toLowerCase())
    ).slice(0, 6)
    : [];

  const handleAddSkill = (skillToUse = null) => {
    const nameToAdd = (skillToUse ? skillToUse.name : typedSkillName).trim();
    if (!nameToAdd) return;

    // Check duplicate by name (case-insensitive)
    if (formData.skills.some((s) => s.skillName.toLowerCase() === nameToAdd.toLowerCase())) {
      setAlert({ type: 'info', message: `"${nameToAdd}" is already added.` });
      setTypedSkillName('');
      setShowSuggestions(false);
      return;
    }

    const matchedTaxonomy = skillToUse || skillsTaxonomy.find(
      (s) => s.name.toLowerCase() === nameToAdd.toLowerCase()
    );

    setFormData({
      ...formData,
      skills: [
        ...formData.skills,
        {
          skillId: matchedTaxonomy ? matchedTaxonomy.id : null,
          skillName: matchedTaxonomy ? matchedTaxonomy.name : nameToAdd,
          skillCategory: matchedTaxonomy ? matchedTaxonomy.category : 'Custom Skill',
          skillType: selectedSkillType,
        },
      ],
    });

    setTypedSkillName('');
    setShowSuggestions(false);
  };

  const handleRemoveSkill = (skillName) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s.skillName !== skillName),
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
          skillId: s.skillId || null,
          skillName: s.skillName,
          skillCategory: s.skillCategory,
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
          message: 'Access Denied: Creating and publishing opportunities requires a RECRUITER account.',
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </Link>
      </div>

      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Create Role Opportunity
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Type or search any skill in the world to define exact required and preferred role capabilities.
        </p>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      <form className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Opportunity Details</span>
          </h2>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Title <span className="text-indigo-600">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={255}
              placeholder="e.g. Full-Stack Java & React Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Type & Work Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Opportunity Type <span className="text-indigo-600">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="JOB">Full-Time Job</option>
                <option value="PROJECT">Contract / Project</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Type <span className="text-indigo-600">*</span>
              </label>
              <select
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                maxLength={255}
                placeholder="e.g. San Francisco / Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Role Description & Mission <span className="text-indigo-600">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Outline the responsibilities, tech stack, and practical deliverables for this role..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Typed Skill Requirements Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Skill Requirements</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Type any skill (e.g. React, Kotlin, Rust, Docker, PyTorch, GraphQL) or choose from taxonomy suggestions.
            </p>
          </div>

          {/* Typed Skill Input Container */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex-1 relative" ref={dropdownRef}>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Type Skill Name
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Java, Solidity, FastApi, Rust..."
                  value={typedSkillName}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setTypedSkillName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {suggestions.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="w-full text-left px-3.5 py-2 hover:bg-indigo-50/50 flex items-center justify-between text-xs transition"
                    >
                      <span className="font-semibold text-slate-900">{skill.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({skill.category})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full sm:w-48">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Requirement Tier
              </label>
              <select
                value={selectedSkillType}
                onChange={(e) => setSelectedSkillType(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="REQUIRED">Required (Core)</option>
                <option value="PREFERRED">Preferred (Bonus)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleAddSkill()}
              disabled={!typedSkillName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Selected Skills Lists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Required Skills */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Required Skills ({requiredSkills.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Mandatory for matching</span>
              </div>

              {requiredSkills.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No required skills added yet. Type a skill above to add.
                </p>
              ) : (
                <div className="space-y-2">
                  {requiredSkills.map((s) => (
                    <div
                      key={s.skillName}
                      className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs shadow-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{s.skillName}</span>
                        <span className="text-[10px] text-slate-500 ml-2">({s.skillCategory})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.skillName)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Skills */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Preferred Skills ({preferredSkills.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Optional bonus</span>
              </div>

              {preferredSkills.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No preferred skills added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {preferredSkills.map((s) => (
                    <div
                      key={s.skillName}
                      className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs shadow-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{s.skillName}</span>
                        <span className="text-[10px] text-slate-500 ml-2">({s.skillCategory})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.skillName)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
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
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, false)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Publish & Match</span>
          </button>
        </div>
      </form>
    </div>
  );
};
