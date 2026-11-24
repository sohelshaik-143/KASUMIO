import React from 'react';
import { HeroWelcomeBanner } from './HeroWelcomeBanner';
import { SkillConfidenceCard } from './SkillConfidenceCard';
import { SkillDnaRadarCard } from './SkillDnaRadarCard';
import { EvidenceTimelineCard } from './EvidenceTimelineCard';
import { RecommendedOpportunitiesCard } from './RecommendedOpportunitiesCard';
import { MyProgressCard } from './MyProgressCard';
import { QuickActionsCard } from './QuickActionsCard';
import { RecruiterInsightsCard } from './RecruiterInsightsCard';

export const StudentDashboardView = ({
  user,
  metrics,
  recentEvidence = [],
  skills = [],
  connections = [],
  recommendations = [],
  greeting = 'Good Morning',
  onOpenDirectForm,
}) => {
  const totalEv = metrics?.totalEvidenceCount ?? recentEvidence.length;
  const verifiedEv = metrics?.verifiedEvidenceCount ?? recentEvidence.filter((e) => e.verified).length;
  const activeConnectionsCount = connections.filter((c) => c.status === 'ACCEPTED').length;

  // Real, evidence-backed confidence score: 0% if no evidence uploaded
  const computedConfidence = totalEv === 0
    ? 0
    : Math.min(100, Math.round(verifiedEv * 30 + totalEv * 15 + 20));

  // Real progress counts
  const projectsCount = recentEvidence.filter((e) => e.evidenceType === 'PROJECT').length;
  const certificatesCount = recentEvidence.filter((e) => e.evidenceType === 'CERTIFICATE').length;
  const progressPercent = totalEv === 0 ? 0 : Math.min(100, Math.round((totalEv / 5) * 100));

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* ROW 1: Hero Welcome Banner (8 cols) + Skill Confidence Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <HeroWelcomeBanner user={user} greeting={greeting} />
        </div>
        <div className="lg:col-span-4">
          <SkillConfidenceCard confidenceScore={computedConfidence} />
        </div>
      </div>

      {/* ROW 2: Your Skill DNA (4 cols) + Evidence Timeline (4 cols) + Recommended Opportunities (4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4">
          <SkillDnaRadarCard evidence={recentEvidence} skills={skills} />
        </div>
        <div className="lg:col-span-4">
          <EvidenceTimelineCard evidence={recentEvidence} onAddEvidence={onOpenDirectForm} />
        </div>
        <div className="lg:col-span-4 md:col-span-2">
          <RecommendedOpportunitiesCard opportunities={recommendations} />
        </div>
      </div>

      {/* ROW 3: My Progress (4 cols) + Quick Actions (4 cols) + Your Recruiter Insights (4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4">
          <MyProgressCard
            projectsCount={projectsCount}
            assessmentsCount={metrics?.assessmentsCount || 0}
            connectionsCount={activeConnectionsCount}
            certificatesCount={certificatesCount}
            learningGoalProgress={progressPercent}
          />
        </div>
        <div className="lg:col-span-4">
          <QuickActionsCard onAddProject={onOpenDirectForm} />
        </div>
        <div className="lg:col-span-4 md:col-span-2">
          <RecruiterInsightsCard />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardView;
