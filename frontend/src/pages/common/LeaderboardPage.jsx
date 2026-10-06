import React, { useState, useEffect } from 'react';
import { leaderboardApi } from '../../api/leaderboardApi';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Award,
  Filter,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  Code,
  TrendingUp,
  Search,
  Building,
  Sparkles,
  Layers
} from 'lucide-react';

export const LeaderboardPage = () => {
  const { user, isStudent } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });

  // Filters
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');

  // Student privacy state
  const [isPublic, setIsPublic] = useState(true);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);

  useEffect(() => {
    loadLeaderboard();
    if (isStudent) {
      loadPrivacy();
    }
  }, [selectedSkill, selectedUniversity]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await leaderboardApi.getLeaderboard({
        skill: selectedSkill || undefined,
        university: selectedUniversity || undefined
      });
      setEntries(data || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setAlert({ type: 'error', message: 'Could not load capability leaderboard.' });
    } finally {
      setLoading(false);
    }
  };

  const loadPrivacy = async () => {
    try {
      const res = await leaderboardApi.getPrivacy();
      setIsPublic(res.isPublic !== false);
    } catch (e) {}
  };

  const handleTogglePrivacy = async () => {
    try {
      setUpdatingPrivacy(true);
      const newStatus = !isPublic;
      await leaderboardApi.updatePrivacy(newStatus);
      setIsPublic(newStatus);
      setAlert({
        type: 'success',
        message: newStatus
          ? 'Your anonymized alias is now visible on the capability leaderboard.'
          : 'Your profile has been hidden from the public leaderboard.'
      });
      loadLeaderboard();
    } catch (err) {
      console.error('Failed to update privacy:', err);
      setAlert({ type: 'error', message: 'Failed to update leaderboard privacy.' });
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  const commonSkills = ['Java', 'Python', 'Spring Boot', 'SQL', 'React', 'REST API Design'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>Capability Benchmarking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Demonstrated Capability Leaderboard
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Transparent rankings based entirely on verified code execution correctness, assessment completion, and demonstrated engineering difficulty.
          </p>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Filter and Privacy Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedSkill('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              !selectedSkill
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Disciplines
          </button>
          {commonSkills.map((sk) => (
            <button
              key={sk}
              onClick={() => setSelectedSkill(sk)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedSkill === sk
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sk}
            </button>
          ))}
        </div>

        {/* Student Privacy Toggle */}
        {isStudent && (
          <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              onClick={handleTogglePrivacy}
              disabled={updatingPrivacy}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                isPublic
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isPublic ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Visible on Leaderboard</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hidden from Leaderboard</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="py-12 text-center">
          <LoadingSpinner size="lg" text="Benchmarking verified scores..." />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No verified candidates found for selected criteria"
          description="Complete a Round-1 Technical Screening to establish your placement on the capability leaderboard."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Institution</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-center">Accuracy</th>
                  <th className="px-6 py-4 text-center">Difficulty</th>
                  <th className="px-6 py-4">Verified Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {entries.map((entry) => {
                  const isTop3 = entry.rank <= 3;
                  return (
                    <tr
                      key={entry.studentId}
                      className="hover:bg-slate-50/60 transition duration-150"
                    >
                      {/* Rank badge */}
                      <td className="px-6 py-4 font-mono font-bold">
                        <span
                          className={`w-7 h-7 rounded-xl inline-flex items-center justify-center text-xs ${
                            entry.rank === 1
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs font-extrabold'
                              : entry.rank === 2
                              ? 'bg-slate-200 text-slate-800 border border-slate-300 font-bold'
                              : entry.rank === 3
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          #{entry.rank}
                        </span>
                      </td>

                      {/* Candidate Alias */}
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <span>{entry.candidateAlias}</span>
                      </td>

                      {/* University */}
                      <td className="px-6 py-4 text-slate-600">
                        <span>{entry.university}</span>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-4 text-center font-mono font-bold text-slate-900 text-sm">
                        {entry.totalScore}
                      </td>

                      {/* Accuracy */}
                      <td className="px-6 py-4 text-center font-mono font-semibold text-indigo-600">
                        {entry.overallAccuracy}%
                      </td>

                      {/* Difficulty tier */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            entry.highestDifficultyHandled === 'HARD'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : entry.highestDifficultyHandled === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {entry.highestDifficultyHandled}
                        </span>
                      </td>

                      {/* Verified Badges */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {entry.verifiedSkillBadges?.map((b, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
