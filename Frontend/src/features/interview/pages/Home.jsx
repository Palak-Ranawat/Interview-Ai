import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { generateInterviewReportApi } from "../services/interview.api";
import { useInterview } from "../hooks/useinterview.js";
import { useAuth } from "../../auth/hooks/useAuth";
import { SiGooglegemini } from "react-icons/si";
import { LuBriefcaseBusiness } from "react-icons/lu";
import { FaFileUpload } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa";
import { RiSparklingFill } from "react-icons/ri";



const Home = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const resumeInputRef = useRef();
  const { generateReport } = useInterview();
  const { user, handleLogout } = useAuth();

  const PROGRESS_STEPS = [
    { label: "Analyzing profile and uploaded resume...", pct: 25 },
    { label: "Benchmarking skills against job requirements...", pct: 50 },
    { label: "Synthesizing technical drills and behavioral answers...", pct: 75 },
    { label: "Constructing personalized 7-day preparation roadmap...", pct: 92 },
  ];

  const handleGenerateReport = async (e) => {
    if (e) e.preventDefault();
    if (loading) return; // Prevent duplicate submissions
    setError(null);

    const resumeFile = resumeInputRef.current?.files?.[0] || resume;

    if (!jobDescription.trim()) {
      setError("Please provide a Job Description.");
      return;
    }

    if (!selfDescription.trim()) {
      setError("Please provide your Self-Description and background highlights.");
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    try {
      let reportData = null;

      if (generateReport) {
        reportData = await generateReport({
          jobDescription,
          selfDescription,
          resumeFile,
        });
      } else {
        const data = await generateInterviewReportApi({
          jobDescription,
          selfDescription,
          resume: resumeFile,
        });
        reportData = data?.interviewReport;
      }

      const reportId = reportData?._id;
      if (reportId) {
        navigate(`/interview/${reportId}`, {
          state: { report: reportData },
        });
        return;
      }

      throw new Error("Unable to retrieve report ID from the generated analysis.");
    } catch (err) {
      console.error("API error during report generation:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate interview report. Please check your inputs and try again.";
      setError(errorMessage);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0B0D]/75 backdrop-blur-[1px] px-4 py-6 text-[#F8FAFC] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Top Navigation Bar */}
        <nav className="mb-8 flex items-center justify-between rounded-2xl border border-[#303641] bg-[#171A21] px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A30] to-[#F06423] text-xl font-bold text-white shadow-md shadow-[#FF7A30]/20">
              <SiGooglegemini />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-base font-bold tracking-tight text-[#F8FAFC]">Skill</span>
                <span className="text-base font-bold text-[#FF7A30]">Sync</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-xl border border-[#303641] bg-[#141820] px-4 py-2 text-xs font-semibold text-[#F8FAFC] transition duration-200 hover:border-[#FF7A30]/50 hover:bg-[#1D222B] hover:text-[#FF7A30]"
            >
              <svg className="h-4 w-4 text-[#FF7A30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>My Reports</span>
            </Link>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#303641] bg-[#141820] px-3.5 py-2 text-xs font-medium text-[#A1A8B5] transition hover:border-[#F87171]/40 hover:bg-[#F87171]/10 hover:text-[#F87171]"
                title="Sign out"
              >
                <span>Logout</span>


              </button>
            )}
          </div>
        </nav>

        {/* Header Hero */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A30]/30 bg-[#FF7A30]/10 px-3.5 py-1 text-xs font-semibold text-[#FF7A30]">
            <span><RiSparklingFill /></span>
            <span>AI-Powered Career Intelligence</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-4xl lg:text-5xl">
            Prepare for your next <span className="text-[#FF7A30]">big opportunity.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#A1A8B5] sm:text-base">
            Upload your resume, paste the target job description, and let SkillSync synthesize a comprehensive interview readiness package.
          </p>
        </header>

        {/* Main Form */}
        <form onSubmit={handleGenerateReport}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Left Column: Job Description */}
            <section className="flex flex-col justify-between rounded-2xl border border-[#303641] bg-[#1D222B] p-6 shadow-xl transition hover:border-[#303641]/90 sm:p-7">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF7A30]/15 text-xl text-[#FF7A30]">
                    <LuBriefcaseBusiness />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#F8FAFC]">
                      Job Description
                    </h2>
                    <p className="text-xs text-[#A1A8B5]">
                      Paste the role expectations, requirements, and responsibilities.
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="jobDescription"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#A1A8B5]"
                >
                  Job Requirements
                </label>

                <textarea
                  name="jobDescription"
                  id="jobDescription"
                  required
                  rows={13}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Example: We are seeking a React.js engineer with 2+ years experience building responsive web apps, REST APIs, Tailwind CSS, and state management..."
                  className="w-full resize-y rounded-xl border border-[#303641] bg-[#141820] p-4 text-sm leading-relaxed text-[#F8FAFC] outline-none transition placeholder:text-[#A1A8B5]/40 focus:border-[#FF7A30] focus:ring-2 focus:ring-[#FF7A30]/20"
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#A1A8B5]">
                <span className="flex items-center gap-1.5 text-[11px] text-[#FFC857]">
                  <span><FaLightbulb /></span> More detail produces deeper questions
                </span>
                <span>{jobDescription.length} characters</span>
              </div>
            </section>

            {/* Right Column: Resume Upload + Self Description */}
            <section className="flex flex-col justify-between rounded-2xl border border-[#303641] bg-[#1D222B] p-6 shadow-xl sm:p-7">
              <div>
                {/* Resume Upload Section */}
                <div className="mb-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF7A30]/15 text-xl text-[#FF7A30]">
                      <FaFileUpload />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#F8FAFC]">
                        Upload Resume
                      </h2>
                      <p className="text-xs text-[#A1A8B5]">
                        Upload your latest PDF resume for automated parsing.
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor="resume"
                    className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#303641] bg-[#141820] px-4 py-8 text-center transition duration-200 hover:border-[#FF7A30] hover:bg-[#FF7A30]/5"
                  >
                    {/* Orange upload icon */}
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF7A30]/10 text-2xl text-[#FF7A30] transition group-hover:scale-110 group-hover:bg-[#FF7A30]/20">
                      <svg className="h-6 w-6 text-[#FF7A30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>

                    <span className="text-sm font-semibold text-[#F8FAFC] group-hover:text-[#FF7A30]">
                      {resume ? resume.name : "Click to select or drag and drop your resume"}
                    </span>

                    <span className="mt-1.5 text-xs text-[#A1A8B5]">
                      PDF files only · Maximum 5 MB
                    </span>

                    <input
                      ref={resumeInputRef}
                      type="file"
                      name="resume"
                      id="resume"
                      accept=".pdf,application/pdf"
                      required
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) {
                          setResume(null);
                          return;
                        }

                        if (file.type !== "application/pdf") {
                          alert("Please upload a PDF file.");
                          e.target.value = "";
                          setResume(null);
                          return;
                        }

                        if (file.size > 5 * 1024 * 1024) {
                          alert("Resume must be smaller than 5 MB.");
                          e.target.value = "";
                          setResume(null);
                          return;
                        }

                        setResume(file);
                      }}
                    />
                  </label>

                  {resume && (
                    <div className="mt-2.5 flex items-center justify-between rounded-lg border border-[#303641] bg-[#141820] px-3 py-1.5 text-xs">
                      <span className="text-[#22C55E]">✓ {resume.name} attached</span>
                      <button
                        type="button"
                        onClick={() => {
                          setResume(null);
                          if (resumeInputRef.current) resumeInputRef.current.value = "";
                        }}
                        className="text-[#F87171] transition hover:text-[#F87171]/80 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Self Description */}
                <div>
                  <label
                    htmlFor="selfDescription"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#A1A8B5]"
                  >
                    Candidate Self-Description & Highlights
                  </label>

                  <textarea
                    name="selfDescription"
                    id="selfDescription"
                    required
                    rows={5}
                    value={selfDescription}
                    onChange={(e) => setSelfDescription(e.target.value)}
                    placeholder="Describe your core strengths, notable projects, technical stack, and specific career goals for this position..."
                    className="w-full resize-y rounded-xl border border-[#303641] bg-[#141820] p-4 text-sm leading-relaxed text-[#F8FAFC] outline-none transition placeholder:text-[#A1A8B5]/40 focus:border-[#FF7A30] focus:ring-2 focus:ring-[#FF7A30]/20"
                  />
                </div>
              </div>

              <p className="mt-3 text-right text-xs text-[#A1A8B5]">
                {selfDescription.length} characters
              </p>
            </section>
          </div>

          {/* Error Feedback Message */}
          {error && (
            <div className="mt-8 flex w-full max-w-2xl items-center gap-3 rounded-xl border border-[#F87171]/40 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
              <span className="text-base font-bold">⚠️</span>
              <span className="flex-1 font-medium">{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-xs text-[#F87171] hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Primary Orange CTA Button & Dynamic Progress */}
          <div className="mt-10 flex flex-col items-center w-full max-w-xl mx-auto">
            <button
              type="submit"
              disabled={loading}
              className={`group relative flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FF7A30] px-9 py-4 text-base font-bold text-white shadow-lg shadow-[#FF7A30]/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F06423] hover:shadow-[#FF7A30]/40 active:scale-[0.99] sm:w-auto ${
                loading ? "cursor-not-allowed opacity-80" : ""
              }`}
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Synthesizing Preparation Report...</span>
                </>
              ) : (
                <>
                  <span className="text-lg"><SiGooglegemini /></span>
                  <span>Generate Interview Report</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </>
              )}
            </button>

            {/* Dynamic Status Indicator during Generation */}
            {loading && (
              <div className="mt-5 w-full rounded-2xl border border-[#FF7A30]/30 bg-[#171A21] p-4 shadow-lg">
                <div className="flex items-center justify-between text-xs font-semibold text-[#FF7A30] mb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7A30] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7A30]"></span>
                    </span>
                    <span>{PROGRESS_STEPS[loadingStep]?.label}</span>
                  </div>
                  <span>{PROGRESS_STEPS[loadingStep]?.pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#141820]">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF7A30] to-[#FFC857] transition-all duration-700 ease-out"
                    style={{ width: `${PROGRESS_STEPS[loadingStep]?.pct}%` }}
                  />
                </div>
              </div>
            )}

            <p className="mt-3.5 text-center text-xs text-[#A1A8B5]">
              AI evaluation includes match scoring, technical drills, behavioral answers, and day-by-day roadmap.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Home;
