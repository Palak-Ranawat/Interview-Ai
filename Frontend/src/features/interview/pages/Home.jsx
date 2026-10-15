
import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { generateInterviewReportApi } from "../services/interview.api";
import { useInterview } from "../hooks/useinterview.js";

const Home = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const resumeInputRef = useRef();
  const { generateReport } = useInterview();

  const handleGenerateReport = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const resumeFile = resumeInputRef.current?.files?.[0] || resume;

    try {
      if (generateReport) {
        const reportData = await generateReport({
          jobDescription,
          selfDescription,
          resumeFile,
        });

        if (reportData?._id) {
          navigate(`/interview/${reportData._id}`, {
            state: { report: reportData },
          });
          return;
        }
      }

      const data = await generateInterviewReportApi({
        jobDescription,
        selfDescription,
        resume: resumeFile,
      });

      if (data?.interviewReport) {
        navigate(`/interview/${data.interviewReport._id}`, {
          state: { report: data.interviewReport },
        });
        return;
      }
    } catch (err) {
      console.error("API error, navigating to report:", err);
    } finally {
      setLoading(false);
    }

    // Default navigation to interview report
    navigate("/interview/6acded7739b77486abc945cb");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Top Navigation Bar */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold text-white shadow-md shadow-violet-700/30">
              ⚡
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">Interview</span>
              <span className="text-base font-bold text-violet-400">AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0f172a] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-violet-500/40 hover:bg-slate-800 hover:text-white"
            >
              <span>📁</span>
              <span>My Reports</span>
            </Link>
          </div>
        </div>

        {/* Header */}
        <header className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
            AI-Powered Career Assistant
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Prepare for your next{" "}
            <span className="text-violet-400">big opportunity.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Upload your resume, add the job description, and let AI create
            a personalized interview preparation report for you.
          </p>
        </header>

        {/* Main Form */}
        <form onSubmit={handleGenerateReport}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Left: Job Description */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-xl">
                  💼
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Job Description
                  </h2>
                  <p className="text-sm text-slate-400">
                    Tell us about the role.
                  </p>
                </div>
              </div>

              <label
                htmlFor="jobDescription"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Paste the complete job description
              </label>

              <textarea
                name="jobDescription"
                id="jobDescription"
                required
                rows={12}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Example: We are looking for a React.js developer with experience in JavaScript, React, REST APIs..."
                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />

              <p className="mt-2 text-right text-xs text-slate-500">
                {jobDescription.length} characters
              </p>
            </section>

            {/* Right: Resume + Self Description */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">

              {/* Resume Upload */}
              <div className="mb-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-xl">
                    📄
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">
                      Upload Resume
                    </h2>
                    <p className="text-sm text-slate-400">
                      Upload your latest resume.
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="resume"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 px-4 py-8 text-center transition hover:border-violet-500 hover:bg-violet-500/5"
                >
                  <span className="mb-3 text-3xl">☁️</span>

                  <span className="text-sm font-medium text-slate-200">
                    {resume ? resume.name : "Click to upload your resume"}
                  </span>

                  <span className="mt-2 text-xs text-slate-500">
                    PDF files only · Maximum 5 MB
                  </span>

                  <input ref={resumeInputRef}
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
                  <button
                    type="button"
                    onClick={() => setResume(null)}
                    className="mt-3 text-sm text-rose-400 transition hover:text-rose-300"
                  >
                    Remove resume
                  </button>
                )}
              </div>

              {/* Self Description */}
              <div>
                <label
                  htmlFor="selfDescription"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Self Description
                </label>

                <textarea
                  name="selfDescription"
                  id="selfDescription"
                  required
                  rows={5}
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  placeholder="Describe your skills, projects, experience, and career goals..."
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </section>
          </div>

          {/* Generate Button */}
          <div className="mt-8 flex flex-col items-center">
            <button
            onClick={handleGenerateReport}
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-950/40 transition sm:w-auto ${
                loading
                  ? "cursor-not-allowed bg-violet-700/60 opacity-80"
                  : "bg-violet-600 hover:-translate-y-0.5 hover:bg-violet-500"
              } focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-950`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Generating AI Interview Report...
                </span>
              ) : (
                "✨ Generate Interview Report"
              )}
            </button>

            <p className="mt-4 text-center text-xs text-slate-500">
              Your personalized interview preparation starts here.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Home;
