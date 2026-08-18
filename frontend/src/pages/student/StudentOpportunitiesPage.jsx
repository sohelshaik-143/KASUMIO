import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { opportunityApi } from '../../api/opportunityApi';
import { skillApi } from '../../api/skillApi';
import { evidenceApi } from '../../api/evidenceApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { EvidenceFormModal } from '../../components/evidence/EvidenceFormModal';
import { 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  MinusCircle, 
  MapPin, 
  Building, 
  Heart, 
  Sparkles, 
  Plus, 
  Layers 
} from 'lucide-react';

export const StudentOpportunitiesPage = () => {
  const { user, isStudent, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });

  // Modal to add missing evidence
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [preselectedSkill, setPreselectedSkill] = useState(null);

  const fetchOpportunities = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [oppsData, skillsData] = await Promise.all([
        opportunityApi.getStudentOpportunities().catch(() => []),
        skillApi.getAllSkills().catch(() => []),
      ]);
      setOpportunities(oppsData || []);
      setSkills(skillsData || []);
    } catch (err) {
      console.error('Failed to load relevant opportunities:', err);
      const errMsg = err.response?.data?.message || 'Could not retrieve relevant opportunities.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isStudent) {
      fetchOpportunities();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id, user?.role, isStudent]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner size="lg" text="Analyzing opportunities matching your verified evidence..." />
      </div>
    );
  }

  const handleExpressInterest = async (oppId) => {
    try {
      await opportunityApi.expressInterest(oppId);
      setOpportunities(
        opportunities.map((opp) =>
          opp.id === oppId
            ? { ...opp, hasExpressedInterest: true, interestStatus: 'INTERESTED' }
            : opp
        )
      );
      setAlert({ type: 'success', message: 'Interest expressed! Recruiter can view your anonymous proof footprint.' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to express interest.';
      setAlert({ type: 'error', message: errMsg });
    }
  };

  const handleWithdrawInterest = async (oppId) => {
    try {
      await opportunityApi.withdrawInterest(oppId);
      setOpportunities(
        opportunities.map((opp) =>
          opp.id === oppId
            ? { ...opp, hasExpressedInterest: false, interestStatus: 'WITHDRAWN' }
            : opp
        )
      );
      setAlert({ type: 'info', message: 'Interest withdrawn.' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to withdraw interest.';
      setAlert({ type: 'error', message: errMsg });
    }
  };

  const handleOpenAddEvidenceForSkill = (skillId) => {
    const skillObj = skills.find((s) => s.id === skillId);
    setPreselectedSkill(skillObj ? { skillId: skillObj.id } : null);
    setEvidenceModalOpen(true);
  };

  const handleCreateEvidenceSubmit = async (payload) => {
    await evidenceApi.createEvidence(payload);
    setAlert({ type: 'success', message: 'Evidence added! Refreshing opportunity relevance...' });
    await fetchOpportunities();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner size="lg" text="Matching opportunities with your demonstrable evidence..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Evidence-Matched Opportunities
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Roles and projects where your submitted proof demonstrates required competencies.
        </p>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {opportunities.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No relevant opportunities found yet"
          description="Opportunity matching requires actual demonstrable evidence. Add code repositories, deployed projects, or certifications to your evidence portfolio."
          actionText="Add Evidence to Portfolio"
          onAction={() => navigate('/evidence')}
        />
      ) : (
        <div className="space-y-5">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 transition"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-800 text-teal-300 border border-slate-700/80">
                      <Building className="w-3.5 h-3.5" />
                      {opp.organizationName}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-850 text-slate-300 border border-slate-700 uppercase">
                      {opp.type} • {opp.workType}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {opp.title}
                  </h2>

                  {opp.location && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{opp.location}</span>
                    </p>
                  )}
                </div>

                {/* Interest Action Button */}
                <div className="shrink-0">
                  {opp.hasExpressedInterest ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-800/80">
                        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                        <span>Interest Expressed</span>
                      </span>
                      <button
                        onClick={() => handleWithdrawInterest(opp.id)}
                        className="text-xs text-slate-400 hover:text-rose-400 underline underline-offset-2 transition"
                      >
                        Withdraw
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleExpressInterest(opp.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-98"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>Express Interest</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-850/50 p-4 rounded-xl border border-slate-800/80">
                {opp.description}
              </p>

              {/* Truthful Why Relevant Box */}
              <div className="bg-teal-950/30 border border-teal-800/40 rounded-xl p-3.5 sm:p-4">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mb-1">
                  Why This Opportunity Is Relevant to You
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {opp.whyRelevant}
                </p>
              </div>

              {/* Skill Capability Checklist */}
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                  Capability Proof Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {opp.skillsChecklist.map((skill) => (
                    <div
                      key={skill.skillId}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-850/80 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {skill.demonstrated ? (
                          skill.status === 'STRONG_EVIDENCE' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          )
                        ) : (
                          <MinusCircle className="w-4 h-4 text-slate-500 shrink-0" />
                        )}

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white">{skill.skillName}</span>
                            <span className="text-[10px] text-slate-500">
                              ({skill.skillType.toLowerCase()})
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {skill.demonstrated
                              ? `${skill.evidenceCount} evidence record${skill.evidenceCount > 1 ? 's' : ''} ${skill.verified ? '• Verified' : ''}`
                              : 'No evidence present'}
                          </span>
                        </div>
                      </div>

                      {/* Add missing evidence trigger */}
                      {!skill.demonstrated && (
                        <button
                          onClick={() => handleOpenAddEvidenceForSkill(skill.skillId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-teal-300 text-[11px] font-medium rounded-lg border border-slate-700/80 transition"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Proof</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Evidence Form Modal Reused */}
      <EvidenceFormModal
        isOpen={evidenceModalOpen}
        onClose={() => {
          setEvidenceModalOpen(false);
          setPreselectedSkill(null);
        }}
        onSubmit={handleCreateEvidenceSubmit}
        skills={skills}
        initialData={preselectedSkill}
      />
    </div>
  );
};
