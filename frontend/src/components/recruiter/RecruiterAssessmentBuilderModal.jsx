import React, { useState, useEffect } from 'react';
import {
  X, Plus, CheckCircle, AlertCircle, Edit, Trash2,
  Copy, Send, Clock, Award, Shield, FileText, Image
} from 'lucide-react';
import { assessmentApi } from '../../api/assessmentApi';
import { AssessmentQuestionEditorModal } from './AssessmentQuestionEditorModal';

export const RecruiterAssessmentBuilderModal = ({
  isOpen,
  onClose,
  opportunityId,
  initialAssessmentId = null,
  onAssessmentUpdated
}) => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validationResult, setValidationResult] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadAssessment();
    }
  }, [isOpen, opportunityId, initialAssessmentId]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      setActionError(null);
      let data;
      if (initialAssessmentId) {
        data = await assessmentApi.getAssessmentBuilder(initialAssessmentId);
      } else if (opportunityId) {
        data = await assessmentApi.getOrCreateBuilder(opportunityId);
      }
      setAssessment(data);
      setValidationResult(null);
    } catch (err) {
      setActionError('Failed to load assessment builder.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    try {
      setActionError(null);
      const res = await assessmentApi.validateAssessment(assessment.id);
      setValidationResult(res);
      if (res.isValid) {
        setActionSuccess(`Assessment validated successfully! Total marks: ${res.totalMarks}`);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Validation request failed.');
    }
  };

  const handlePublish = async () => {
    try {
      setActionError(null);
      const updated = await assessmentApi.publishAssessment(assessment.id);
      setAssessment(updated);
      setActionSuccess(`Assessment Version ${updated.versionNumber} has been published successfully!`);
      if (onAssessmentUpdated) onAssessmentUpdated();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Publish failed. Check validation errors.');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await assessmentApi.deleteQuestion(assessment.id, qId);
      loadAssessment();
    } catch (err) {
      setActionError('Failed to delete question.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {assessment?.title || 'Technical Assessment Builder'}
            </h2>
            {assessment && (
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                assessment.status === 'PUBLISHED'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                Version {assessment.versionNumber} • {assessment.status}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {actionError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}
          {actionSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Assessment Summary Metrics */}
          {assessment && (
            <div className="grid grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Questions</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                  {assessment.questions?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Marks</span>
                <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  {assessment.totalMarks || 0} pts
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Time Limit</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                  {assessment.timeLimitMinutes} mins
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Passing Threshold</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {assessment.passingScore}%
                </span>
              </div>
            </div>
          )}

          {/* Validation Feedback Banner */}
          {validationResult && (
            <div className={`p-4 rounded-xl border ${validationResult.isValid ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {validationResult.isValid ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={validationResult.isValid ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}>
                  {validationResult.isValid ? 'Assessment is valid and ready to publish' : 'Assessment has validation issues'}
                </span>
              </div>
              {validationResult.errors?.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-red-700 dark:text-red-400 mt-2">
                  {validationResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
            </div>
          )}

          {/* Question List Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Assessment Questions</h3>
              <button
                type="button"
                onClick={() => { setEditingQuestion(null); setIsEditorOpen(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {(!assessment?.questions || assessment.questions.length === 0) ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-600 dark:text-slate-400">No custom questions added yet</p>
                <p className="text-slate-400">Add DSA coding, MCQ, SQL, or system design questions to build this assessment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assessment.questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500">#{idx + 1}</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs">{q.title}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-semibold">
                          {q.questionType}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded font-bold font-mono">
                          {q.points} pts
                        </span>
                        {q.imageUrl && (
                          <span className="text-[10px] px-2 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 rounded font-semibold flex items-center gap-1">
                            <Image className="w-3 h-3" /> Diagram Attached
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 line-clamp-2 text-[11px] font-mono">{q.prompt}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditingQuestion(q); setIsEditorOpen(true); }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Edit question"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-b-2xl">
          <button
            type="button"
            onClick={handleValidate}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 rounded-xl"
          >
            Validate Assessment Rules
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 rounded-xl"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Question Editor Modal */}
      {isEditorOpen && assessment && (
        <AssessmentQuestionEditorModal
          isOpen={isEditorOpen}
          onClose={() => { setIsEditorOpen(false); setEditingQuestion(null); }}
          assessmentId={assessment.id}
          initialQuestion={editingQuestion}
          onSaved={loadAssessment}
        />
      )}
    </div>
  );
};
