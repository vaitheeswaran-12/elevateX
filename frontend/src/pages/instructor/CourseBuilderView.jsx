import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ArrowLeft,
  Plus,
  Trash,
  Play,
  FileText,
  Clock,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

export default function CourseBuilderView() {
  const { token } = useAuth();
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Creation forms
  const [moduleTitle, setModuleTitle] = useState('');
  const [activeModuleForLesson, setActiveModuleForLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState('10:00');
  const [isPreview, setIsPreview] = useState(false);

  // Upload simulations
  const [uploading, setUploading] = useState(false);
  const [simulatedVideoUrl, setSimulatedVideoUrl] = useState('');
  const [simulatedPdfUrl, setSimulatedPdfUrl] = useState('');

  useEffect(() => {
    loadCourseDetails();
  }, [courseId, token]);

  const loadCourseDetails = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Simulate course detail fetch & modules load
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch('/api/instructor/courses', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/student/courses', { headers: { 'Authorization': `Bearer ${token}` } }) // backup fallback
      ]);

      let selectedCourse = null;
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        selectedCourse = data.courses.find(c => c.id === courseId);
      }

      setCourse(selectedCourse || { id: courseId, title: 'Generative AI & LLM Architecture' });

      // Load mock course builder structures
      setModules([
        {
          id: 'm_1',
          title: 'Introduction to Transformer Architecture',
          sort_order: 1,
          lessons: [
            { id: 'l_1', title: 'The Self-Attention Mechanism Exploded', duration: '15:30', sort_order: 1, is_preview: 1 },
            { id: 'l_2', title: 'Positional Encodings & Tokens', duration: '12:15', sort_order: 2, is_preview: 0 }
          ]
        },
        {
          id: 'm_2',
          title: 'Fine-Tuning Techniques & LoRA',
          sort_order: 2,
          lessons: [
            { id: 'l_3', title: 'LoRA Parameter Optimization', duration: '22:45', sort_order: 1, is_preview: 0 }
          ]
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    // Create module REST API call
    try {
      const res = await fetch('/api/instructor/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId, title: moduleTitle, sort_order: modules.length + 1 })
      });
      if (res.ok) {
        const data = await res.json();
        const newMod = {
          id: data.moduleId,
          title: moduleTitle,
          sort_order: modules.length + 1,
          lessons: []
        };
        setModules([...modules, newMod]);
        setModuleTitle('');
        setSuccess('Module created successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    try {
      const res = await fetch('/api/instructor/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          module_id: activeModuleForLesson.id,
          title: lessonTitle,
          video_url: simulatedVideoUrl,
          pdf_url: simulatedPdfUrl,
          duration: lessonDuration,
          is_preview: isPreview,
          sort_order: (activeModuleForLesson.lessons?.length || 0) + 1
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newLes = {
          id: data.lessonId,
          title: lessonTitle,
          duration: lessonDuration,
          is_preview: isPreview ? 1 : 0,
          video_url: simulatedVideoUrl,
          pdf_url: simulatedPdfUrl,
          sort_order: (activeModuleForLesson.lessons?.length || 0) + 1
        };

        setModules(modules.map(m => {
          if (m.id === activeModuleForLesson.id) {
            return { ...m, lessons: [...(m.lessons || []), newLes] };
          }
          return m;
        }));

        setLessonTitle('');
        setLessonDuration('10:00');
        setIsPreview(false);
        setSimulatedVideoUrl('');
        setSimulatedPdfUrl('');
        setActiveModuleForLesson(null);
        setSuccess('Lesson added successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reorder sorting lists via drag-and-drop order update buttons
  const handleShiftLesson = (moduleId, lessonIdx, direction) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;

    const lessons = [...mod.lessons];
    const targetIdx = direction === 'up' ? lessonIdx - 1 : lessonIdx + 1;

    if (targetIdx < 0 || targetIdx >= lessons.length) return;

    // Swap sort orders
    const temp = lessons[lessonIdx];
    lessons[lessonIdx] = lessons[targetIdx];
    lessons[targetIdx] = temp;

    // Update state
    setModules(modules.map(m => m.id === moduleId ? { ...m, lessons } : m));
    setSuccess('Lesson sorted! Save to synchronize catalogue.');
  };

  const handleSimulateUpload = (type) => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      if (type === 'video') {
        setSimulatedVideoUrl('https://ascendiq.storage/videos/lesson_clip.mp4');
      } else {
        setSimulatedPdfUrl('https://ascendiq.storage/pdfs/syllabus_notes.pdf');
      }
      setSuccess(`${type === 'video' ? 'Video' : 'PDF Study Guide'} simulated upload complete!`);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Header back navigator */}
      <div className="flex items-center space-x-3">
        <Link to="/instructor-dashboard/courses" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Syllabus Curriculum</span>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">{course?.title}</h1>
        </div>
      </div>

      {/* Success alert toasts */}
      {success && (
        <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 text-xs font-bold">
          <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Modules listing details */}
      <div className="space-y-6">
        {modules.map((mod) => (
          <div key={mod.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{mod.title}</h3>
              <button
                onClick={() => setActiveModuleForLesson(mod)}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lesson</span>
              </button>
            </div>

            {/* Lessons List under module */}
            <div className="space-y-2.5">
              {mod.lessons && mod.lessons.map((les, idx) => (
                <div key={les.id} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs font-medium">
                  <div className="flex items-center space-x-3">
                    <Play className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{les.title}</p>
                      <p className="text-[10px] text-gray-400 flex items-center mt-0.5">
                        <Clock className="w-3.5 h-3.5 mr-1" /> {les.duration}
                        {les.is_preview === 1 && (
                          <span className="ml-2.5 bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-[8px]">Preview</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Ordering Controls */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleShiftLesson(mod.id, idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleShiftLesson(mod.id, idx, 'down')}
                      disabled={idx === mod.lessons.length - 1}
                      className="p-1 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Adding New Module Form */}
        <form onSubmit={handleAddModule} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft flex gap-3">
          <input
            type="text"
            required
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="Type a new syllabus module title..."
            className="flex-grow px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </form>
      </div>

      {/* ADD LESSON MODAL */}
      {activeModuleForLesson && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddLesson} className="bg-white dark:bg-gray-900 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white">Add Lesson to {activeModuleForLesson.title}</h3>
              <button type="button" onClick={() => setActiveModuleForLesson(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-400 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g., Understanding positional self-attention matrices"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-400 mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    required
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="e.g., 12:45"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-5">
                  <input
                    type="checkbox"
                    id="preview"
                    checked={isPreview}
                    onChange={(e) => setIsPreview(e.target.checked)}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <label htmlFor="preview" className="font-bold text-gray-600 dark:text-gray-300">Allow Lesson Preview</label>
                </div>
              </div>

              {/* Upload simulation anchors */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSimulateUpload('video')}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center font-bold"
                >
                  <UploadCloud className="w-5 h-5 text-primary mb-1" />
                  <span>Upload Video</span>
                  {simulatedVideoUrl && <span className="text-[8px] text-green-500 font-semibold mt-1">Ready</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateUpload('pdf')}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center font-bold"
                >
                  <FileText className="w-5 h-5 text-accent mb-1" />
                  <span>Upload PDF Study</span>
                  {simulatedPdfUrl && <span className="text-[8px] text-green-500 font-semibold mt-1">Ready</span>}
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setActiveModuleForLesson(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-premium"
              >
                Add Lesson
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
