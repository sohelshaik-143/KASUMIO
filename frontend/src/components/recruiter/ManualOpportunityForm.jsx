import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Search,
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Field } from '../common/Field';

/**
 * Manual opportunity creation form with skill selector and screening config.
 */
export const ManualOpportunityForm = ({
  formData,
  setFormData,
  skillsTaxonomy = [],
  submitting,
  onSubmit
}) => {
  const [typedSkillName, setTypedSkillName] = useState('');
  const [selectedSkillType, setSelectedSkillType] = useState('REQUIRED');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

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

    if (formData.skills.some((s) => s.skillName.toLowerCase() === nameToAdd.toLowerCase())) {
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

  const requiredSkills = formData.skills.filter((s) => s.skillType === 'REQUIRED');
  const preferredSkills = formData.skills.filter((s) => s.skillType === 'PREFERRED');

  return (
    <form className="space-y-6">
      {/* Basic Information Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
          <Briefcase className="w-4 h-4 text-teal-700" />
          <span>Opportunity Details</span>
        </h2>

        <Field id="opp-title" label="Title" required>
          <input
            id="opp-title"
            type="text"
            required
            maxLength={255}
            placeholder="e.g. Full-Stack Java & React Engineer"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition min-h-[44px]"
          />
        </Field>

        {/* Type & Work Type & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field id="opp-type" label="Opportunity Type" required>
            <select
              id="opp-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition min-h-[44px]"
            >
              <option value="INTERNSHIP">Internship</option>
              <option value="JOB">Full-Time Job</option>
              <option value="PROJECT">Contract / Project</option>
            </select>
          </Field>

          <Field id="opp-work-type" label="Work Type" required>
            <select
              id="opp-work-type"
              value={formData.workType}
              onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition min-h-[44px]"
            >
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-Site</option>
            </select>
          </Field>

          <Field id="opp-location" label="Location">
            <input
              id="opp-location"
              type="text"
              maxLength={255}
              placeholder="e.g. San Francisco / Remote"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition min-h-[44px]"
            />
          </Field>
        </div>

        {/* Description */}
        <Field id="opp-desc" label="Role Description & Deliverables" required>
          <textarea
            id="opp-desc"
            rows={4}
            required
            placeholder="Outline the responsibilities, tech stack, and practical deliverables for this role..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white resize-none"
          />
        </Field>
      </div>

      {/* Typed Skill Requirements Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-700" />
            <span>Skill Requirements</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Specify technical skills (e.g. React, Java, SQL, Docker) to evaluate candidate proof.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex-1 relative" ref={dropdownRef}>
            <label htmlFor="skill-search-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Type Skill Name
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input
                id="skill-search-input"
                type="text"
                placeholder="e.g. Java, React, SQL..."
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
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 transition min-h-[44px]"
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {suggestions.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50/50 flex items-center justify-between text-xs transition min-h-[40px]"
                  >
                    <span className="font-semibold text-slate-900">{skill.name}</span>
                    <span className="text-xs text-slate-500 font-mono">({skill.category})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full sm:w-48">
            <label htmlFor="skill-tier-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Requirement Tier
            </label>
            <select
              id="skill-tier-select"
              value={selectedSkillType}
              onChange={(e) => setSelectedSkillType(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 min-h-[44px]"
            >
              <option value="REQUIRED">Required (Core)</option>
              <option value="PREFERRED">Preferred (Bonus)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => handleAddSkill()}
            disabled={!typedSkillName.trim()}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition shrink-0 flex items-center justify-center gap-1.5 shadow-xs min-h-[44px]"
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
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                Required Skills ({requiredSkills.length})
              </span>
              <span className="text-xs text-slate-500 font-mono">Mandatory for matching</span>
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
                      <span className="text-xs text-slate-500 ml-2">({s.skillCategory})</span>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${s.skillName}`}
                      onClick={() => handleRemoveSkill(s.skillName)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
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
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Preferred Skills ({preferredSkills.length})
              </span>
              <span className="text-xs text-slate-500 font-mono">Optional bonus</span>
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
                      <span className="text-xs text-slate-500 ml-2">({s.skillCategory})</span>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${s.skillName}`}
                      onClick={() => handleRemoveSkill(s.skillName)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
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

      {/* Technical Screening Blueprint Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Technical Screening Blueprint
            </h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 min-h-[44px]">
            <input
              type="checkbox"
              checked={formData.enableAssessment}
              onChange={(e) => setFormData({ ...formData, enableAssessment: e.target.checked })}
              className="w-4 h-4 rounded text-teal-700 focus:ring-teal-600 border-slate-300"
            />
            <span>Generate Adaptive Screening</span>
          </label>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          When enabled, KASUMO constructs an automated multi-language technical screening blueprint tailored to your specified required capabilities.
        </p>

        {formData.enableAssessment && (
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100">
            <Field id="opp-time-limit" label="Time Limit (Minutes)" hint="Default: 45 minutes">
              <input
                id="opp-time-limit"
                type="number"
                min="15"
                max="180"
                value={formData.assessmentTimeLimit}
                onChange={(e) => setFormData({ ...formData, assessmentTimeLimit: parseInt(e.target.value) || 45 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition min-h-[44px]"
              />
            </Field>

            <Field id="opp-pass-score" label="Passing Threshold (%)" hint="Candidates meeting threshold receive verified demonstration credentials">
              <input
                id="opp-pass-score"
                type="number"
                min="30"
                max="100"
                value={formData.assessmentPassingScore}
                onChange={(e) => setFormData({ ...formData, assessmentPassingScore: parseInt(e.target.value) || 70 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition min-h-[44px]"
              />
            </Field>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-end gap-3">
        <Link
          to="/recruiter/opportunities"
          className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition min-h-[44px] flex items-center"
        >
          Cancel
        </Link>

        <button
          type="button"
          disabled={submitting}
          onClick={(e) => onSubmit(e, false)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition disabled:opacity-50 min-h-[44px]"
        >
          <Save className="w-4 h-4" />
          <span>Save as Draft</span>
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={(e) => onSubmit(e, true)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 min-h-[44px]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Publish & Match</span>
        </button>
      </div>
    </form>
  );
};
