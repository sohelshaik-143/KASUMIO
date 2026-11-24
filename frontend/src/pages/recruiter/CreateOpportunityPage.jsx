import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { opportunityApi } from '../../api/opportunityApi';
import { skillApi } from '../../api/skillApi';
import { assessmentApi } from '../../api/assessmentApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { RecruiterAgentConsole } from '../../components/recruiter/RecruiterAgentConsole';
import { ManualOpportunityForm } from '../../components/recruiter/ManualOpportunityForm';
import {
  Briefcase,
  Layers,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

/**
 * CreateOpportunityPage coordinates automated role parsing and manual builder modes.
 */
export const CreateOpportunityPage = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState('agent'); // 'agent' or 'manual'
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
    enableAssessment: true,
    assessmentTimeLimit: 1440,
    assessmentPassingScore: 70,
  });

  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoadingSkills(true);
        const data = await skillApi.getAllSkills();
        setSkillsTaxonomy(data || []);
      } catch (err) {
        setAlert({ type: 'error', message: 'Could not load skills taxonomy.' });
      } finally {
        setLoadingSkills(false);
      }
    };
    loadSkills();
  }, []);

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

      if (formData.enableAssessment) {
        try {
          const blueprint = await assessmentApi.generateBlueprint(created.id);
          if (formData.assessmentTimeLimit !== 60 || formData.assessmentPassingScore !== 70) {
            await assessmentApi.updateAssessment(blueprint.id, {
              timeLimitMinutes: formData.assessmentTimeLimit,
              passingScore: formData.assessmentPassingScore,
            });
          }
        } catch (assmErr) {
          // Handled gracefully if already created
        }
      }

      if (publishAfterCreate) {
        await opportunityApi.publishOpportunity(created.id);
      }

      navigate(`/recruiter/opportunities/${created.id}`);
    } catch (err) {
      const errMsg = err.response?.status === 403
        ? 'Access Denied: Creating and publishing opportunities requires a RECRUITER account.'
        : err.response?.data?.message || 'Failed to create opportunity. Please check your inputs.';
      setAlert({ type: 'error', message: errMsg });
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

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      <div className="flex items-center gap-2">
        <Link
          to="/recruiter/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </Link>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveMode('agent')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
            activeMode === 'agent'
              ? 'bg-white text-teal-800 shadow-xs border border-teal-100'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-teal-700" />
          <span>Automated Role Specification</span>
          <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 ml-1">
            Fast Track
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
            activeMode === 'manual'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-slate-500" />
          <span>Manual Role Builder</span>
        </button>
      </div>

      {activeMode === 'agent' ? (
        <RecruiterAgentConsole onSwitchToManual={() => setActiveMode('manual')} />
      ) : (
        <>
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
                Create Role Opportunity
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Define required capabilities and automated screening parameters for candidates.
            </p>
          </div>

          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: null, message: null })}
          />

          <ManualOpportunityForm
            formData={formData}
            setFormData={setFormData}
            skillsTaxonomy={skillsTaxonomy}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
};

export default CreateOpportunityPage;
