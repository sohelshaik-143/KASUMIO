import React, { useState, useEffect } from 'react';
import { X, Upload, Image, Trash2, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { assessmentApi } from '../../api/assessmentApi';

const QUESTION_TYPES = [
  { value: 'DSA_CODING', label: 'DSA Coding' },
  { value: 'IMPLEMENTATION', label: 'Programming Implementation' },
  { value: 'MCQ', label: 'Multiple Choice' },
  { value: 'SHORT_ANSWER', label: 'Short Technical Answer' },
  { value: 'TECHNICAL_EXPLANATION', label: 'Technical Explanation' },
  { value: 'REAL_WORLD_SCENARIO', label: 'Real-World Scenario' },
  { value: 'SQL', label: 'SQL & Database Query' },
  { value: 'BACKEND_ENGINEERING', label: 'Backend Engineering' },
  { value: 'SYSTEM_DESIGN', label: 'System Design Architecture' }
];

export const AssessmentQuestionEditorModal = ({
  isOpen,
  onClose,
  assessmentId,
  initialQuestion = null,
  onSaved
}) => {
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    questionType: 'DSA_CODING',
    difficulty: 'MEDIUM',
    points: 10,
    skillName: '',
    timeLimitMinutes: '',
    rubricJson: '',
    expectedSkills: [],
    imageUrl: '',
    imageAltText: '',
    imageCaption: '',
    options: [
      { text: '', isCorrect: true, explanation: '' },
      { text: '', isCorrect: false, explanation: '' }
    ],
    codingProblem: {
      problemStatement: '',
      constraints: '',
      allowedLanguages: 'java,python,javascript,sql',
      testCases: [
        { inputData: '', expectedOutput: '', isHidden: false, explanation: '' }
      ]
    }
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialQuestion) {
      setFormData({
        title: initialQuestion.title || '',
        prompt: initialQuestion.prompt || '',
        questionType: initialQuestion.questionType || 'DSA_CODING',
        difficulty: initialQuestion.difficulty || 'MEDIUM',
        points: initialQuestion.points || 10,
        skillName: initialQuestion.skillName || '',
        timeLimitMinutes: initialQuestion.timeLimitMinutes || '',
        rubricJson: initialQuestion.rubricJson || '',
        expectedSkills: initialQuestion.expectedSkills || [],
        imageUrl: initialQuestion.imageUrl || '',
        imageAltText: initialQuestion.imageAltText || '',
        imageCaption: initialQuestion.imageCaption || '',
        options: initialQuestion.options?.length ? initialQuestion.options : [
          { text: '', isCorrect: true, explanation: '' },
          { text: '', isCorrect: false, explanation: '' }
        ],
        codingProblem: initialQuestion.codingProblem || {
          problemStatement: '',
          constraints: '',
          allowedLanguages: 'java,python,javascript,sql',
          testCases: [{ inputData: '', expectedOutput: '', isHidden: false, explanation: '' }]
        }
      });
      setImagePreview(initialQuestion.imageUrl || null);
    } else {
      resetForm();
    }
    setError(null);
    setImageFile(null);
  }, [initialQuestion, isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      prompt: '',
      questionType: 'DSA_CODING',
      difficulty: 'MEDIUM',
      points: 10,
      skillName: '',
      timeLimitMinutes: '',
      rubricJson: '',
      expectedSkills: [],
      imageUrl: '',
      imageAltText: '',
      imageCaption: '',
      options: [
        { text: '', isCorrect: true, explanation: '' },
        { text: '', isCorrect: false, explanation: '' }
      ],
      codingProblem: {
        problemStatement: '',
        constraints: '',
        allowedLanguages: 'java,python,javascript,sql',
        testCases: [{ inputData: '', expectedOutput: '', isHidden: false, explanation: '' }]
      }
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.svg') || file.type === 'image/svg+xml') {
      setError('SVG images are strictly prohibited for security reasons. Please select a PNG, JPEG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5 MB.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: '', imageAltText: '', imageCaption: '' }));
  };

  const isCodeType = ['DSA_CODING', 'IMPLEMENTATION', 'SQL', 'BACKEND_ENGINEERING'].includes(formData.questionType);
  const isMcq = formData.questionType === 'MCQ';

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Question title is required.');
      return;
    }
    if (!formData.prompt.trim()) {
      setError('Question prompt / instructions are required.');
      return;
    }
    if (imagePreview && !formData.imageAltText.trim()) {
      setError('Alt text is required for accessibility when an image is attached.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title.trim(),
        prompt: formData.prompt.trim(),
        questionType: formData.questionType,
        difficulty: formData.difficulty,
        points: parseInt(formData.points, 10) || 10,
        skillName: formData.skillName.trim() || null,
        timeLimitMinutes: formData.timeLimitMinutes ? parseInt(formData.timeLimitMinutes, 10) : null,
        rubricJson: formData.rubricJson.trim() || null,
        expectedSkills: formData.expectedSkills,
        imageAltText: formData.imageAltText.trim() || null,
        imageCaption: formData.imageCaption.trim() || null,
        options: isMcq ? formData.options : null,
        codingProblem: isCodeType ? formData.codingProblem : null
      };

      let savedQuestion;
      if (initialQuestion?.id) {
        savedQuestion = await assessmentApi.updateQuestion(assessmentId, initialQuestion.id, payload);
      } else {
        savedQuestion = await assessmentApi.addQuestion(assessmentId, payload);
      }

      // If a new local image was selected, upload it
      if (imageFile && savedQuestion?.id) {
        const imgData = new FormData();
        imgData.append('file', imageFile);
        imgData.append('altText', formData.imageAltText.trim());
        if (formData.imageCaption) imgData.append('caption', formData.imageCaption.trim());
        await assessmentApi.uploadQuestionImage(assessmentId, savedQuestion.id, imgData);
      } else if (!imagePreview && initialQuestion?.imageUrl) {
        await assessmentApi.deleteQuestionImage(assessmentId, initialQuestion.id);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question. Please check inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialQuestion ? 'Edit Assessment Question' : 'Create Custom Question'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure instructions, evaluation rubrics, and test cases</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Question Type</label>
              <select
                value={formData.questionType}
                onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Implement LRU Cache"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Marks (Points)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Prompt & Instructions</label>
            <textarea
              rows={4}
              placeholder="Describe the task, edge cases, expected performance, and input/output contracts..."
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
            />
          </div>

          {/* Image Upload Section (Task 4) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-blue-500" />
                <span>Question Diagram or Architecture Illustration (Optional)</span>
              </span>
              {imagePreview && (
                <button type="button" onClick={handleRemoveImage} className="text-red-500 hover:text-red-600 flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>

            {imagePreview ? (
              <div className="space-y-3">
                <img src={imagePreview} alt={formData.imageAltText || 'Question diagram preview'} className="max-h-48 rounded-lg border border-slate-200 dark:border-slate-700 mx-auto object-contain bg-white dark:bg-slate-900" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Alt Text (Required for accessibility)*</label>
                    <input
                      type="text"
                      placeholder="e.g. Entity Relationship Diagram for orders"
                      value={formData.imageAltText}
                      onChange={(e) => setFormData({ ...formData, imageAltText: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Caption (Optional)</label>
                    <input
                      type="text"
                      placeholder="Figure 1: Database schema"
                      value={formData.imageCaption}
                      onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 rounded-xl cursor-pointer transition">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Click to upload PNG, JPEG, or WebP</span>
                <span className="text-[10px] text-slate-400">Max size 5 MB. SVGs strictly rejected.</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* MCQ Options */}
          {isMcq && (
            <div className="space-y-3">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Multiple Choice Options</label>
              {formData.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="radio"
                    name="correct_option"
                    checked={opt.isCorrect}
                    onChange={() => {
                      const newOpts = formData.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                      setFormData({ ...formData, options: newOpts });
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={opt.text}
                    onChange={(e) => {
                      const newOpts = [...formData.options];
                      newOpts[idx].text = e.target.value;
                      setFormData({ ...formData, options: newOpts });
                    }}
                    className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, options: formData.options.filter((_, i) => i !== idx) })}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, options: [...formData.options, { text: '', isCorrect: false, explanation: '' }] })}
                className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            </div>
          )}

          {/* Code Test Cases */}
          {isCodeType && (
            <div className="space-y-3">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Test Cases (Public & Hidden)</label>
              {formData.codingProblem.testCases.map((tc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600 dark:text-slate-300">Test Case #{idx + 1}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tc.isHidden}
                        onChange={(e) => {
                          const newTcs = [...formData.codingProblem.testCases];
                          newTcs[idx].isHidden = e.target.checked;
                          setFormData({ ...formData, codingProblem: { ...formData.codingProblem, testCases: newTcs } });
                        }}
                        className="rounded"
                      />
                      <span className="text-[11px] text-slate-500">Hidden from student</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <input
                      type="text"
                      placeholder="Input (e.g. [1, 2, 3])"
                      value={tc.inputData}
                      onChange={(e) => {
                        const newTcs = [...formData.codingProblem.testCases];
                        newTcs[idx].inputData = e.target.value;
                        setFormData({ ...formData, codingProblem: { ...formData.codingProblem, testCases: newTcs } });
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="Expected Output (e.g. 6)"
                      value={tc.expectedOutput}
                      onChange={(e) => {
                        const newTcs = [...formData.codingProblem.testCases];
                        newTcs[idx].expectedOutput = e.target.value;
                        setFormData({ ...formData, codingProblem: { ...formData.codingProblem, testCases: newTcs } });
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px]"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newTcs = [...formData.codingProblem.testCases, { inputData: '', expectedOutput: '', isHidden: true, explanation: '' }];
                  setFormData({ ...formData, codingProblem: { ...formData.codingProblem, testCases: newTcs } });
                }}
                className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Test Case
              </button>
            </div>
          )}

          {/* Rubrics for technical written questions */}
          {!isCodeType && !isMcq && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Evaluation Rubrics & Partial Credit Guidelines</label>
              <textarea
                rows={3}
                placeholder="Define key concepts candidate must mention for full marks, partial credit rules, or architectural trade-offs..."
                value={formData.rubricJson}
                onChange={(e) => setFormData({ ...formData, rubricJson: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
              />
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
            >
              {saving ? 'Saving...' : initialQuestion ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
