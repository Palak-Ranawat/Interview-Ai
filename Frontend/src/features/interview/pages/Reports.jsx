import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import useInterview from "../hooks/useinterview";

/**
 * Google Gemini Sparkle Star Icon
 */
const GeminiIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
      fill="url(#gemini_sparkle_grad_rep)"
    />
    <defs>
      <linearGradient
        id="gemini_sparkle_grad_rep"
        x1="2"
        y1="2"
        x2="22"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * My Reports Dashboard Component
 *
 * Displays all generated interview reports for the authenticated user,
 * calculated summary statistics, and options to view or delete reports.
 */
const Reports = () => {
  const navigate = useNavigate();
  const { reports, getReports, deleteReport, getResumePdf } = useInterview();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [downloadingResumeId, setDownloadingResumeId] = useState(null);

  const handleDownloadResume = async (reportId) => {
    try {
      setDownloadingResumeId(reportId);
      await getResumePdf(reportId);
    } catch (err) {
      console.error("Resume download failed:", err);
      alert("Failed to download resume PDF. Please try again.");
    } finally {
      setDownloadingResumeId(null);
    }
  };

  // Fetch reports on component mount
  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await getReports();
    } catch (err) {
      if (err?.response?.status === 401) {
        setError("Your session has expired. Please log in again to view your reports.");
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to retrieve your interview reports. Please verify your connection."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Secure Delete Handler
  const handleDelete = async (interviewId) => {
    setDeletingId(interviewId);
    try {
      await deleteReport(interviewId);
      setDeleteConfirmId(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete report. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to extract a readable job title from title field or jobDescription markdown
  const extractTitle = (report) => {
    if (report?.title && report.title.trim()) {
      return report.title.trim();
    }

    if (report?.jobDescription) {
      // Check for markdown patterns like "**Job Title:** Role"
      const match = report.jobDescription.match(/\*\*Job Title:\*\*\s*([^\r\n]+)/i);
      if (match && match[1]) {
        return match[1].replace(/[#*_]/g, "").trim();
      }
      // Check for "Job Title: Role"
      const matchPlain = report.jobDescription.match(/Job Title:\s*([^\r\n]+)/i);
      if (matchPlain && matchPlain[1]) {
        return matchPlain[1].replace(/[#*_]/g, "").trim();
      }
      // Fallback: take first non-empty line up to 50 chars
      const firstLine = report.jobDescription
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.length > 0);
      if (firstLine && firstLine.length < 60) {
        return firstLine.replace(/[#*_]/g, "").trim();
      }
    }

    return "Interview Preparation Report";
  };

  // Safe list of reports
  const reportList = Array.isArray(reports) ? reports : [];

  // ==========================================
  // CALCULATED REAL STATISTICS
  // ==========================================
  const stats = useMemo(() => {
    const totalReports = reportList.length;

    // 1. Average Match Score (calculated from actual numeric matchScores)
    const validScores = reportList
      .map((r) => Number(r.matchScore))
      .filter((s) => !isNaN(s) && s > 0);
    const avgScore =
      validScores.length > 0
        ? Math.round(validScores.reduce((acc, score) => acc + score, 0) / validScores.length)
        : null;

    // 2. Latest Report Date (from actual report creation timestamps)
    let latestFormatted = "N/A";
    if (reportList.length > 0) {
      // Find report with newest createdAt
      const sortedByDate = [...reportList].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      if (sortedByDate[0]?.createdAt) {
        latestFormatted = new Date(sortedByDate[0].createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }

    // 3. Reports Generated This Month (using actual current month and year)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthCount = reportList.filter((r) => {
      if (!r.createdAt) return false;
      const d = new Date(r.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return {
      totalReports,
      avgScore,
      latestFormatted,
      thisMonthCount,
    };
  }, [reportList]);

  // Color helper for match score badge
  const getScoreBadge = (score) => {
    if (typeof score !== "number" || isNaN(score)) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-400">
          N/A
        </span>
      );
    }

    if (score >= 80) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {score}% Match
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-300">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          {score}% Match
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        {score}% Match
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 antialiased">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-800/80 bg-[#0f172a]/70 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-lg font-bold text-white shadow-lg shadow-violet-900/40">
              ⚡
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">Interview</span>
              <span className="text-lg font-bold text-violet-400">AI</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <span>✨</span>
              <span>New Analysis</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* ========================================================= */}
        {/* A. DASHBOARD HEADER                                       */}
        {/* ========================================================= */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                📁 Dashboard
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              My Interview Reports
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Track your interview preparation progress and review historical analyses.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:-translate-y-0.5 hover:bg-violet-500"
          >
            <span>✨</span>
            <span>Generate New Report</span>
          </Link>
        </header>

        {/* ========================================================= */}
        {/* B. STATISTICS CARDS                                       */}
        {/* ========================================================= */}
        <section aria-label="Report Statistics" className="mb-10">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Card 1: Total Reports */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5 shadow-sm transition hover:border-violet-500/30">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Total Reports</span>
                <span className="text-lg text-violet-400">📊</span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">
                {isLoading ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-800" />
                ) : (
                  stats.totalReports
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">All-time generated</p>
            </div>

            {/* Card 2: Average Match Score */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5 shadow-sm transition hover:border-violet-500/30">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Avg Match Score</span>
                <span className="text-lg text-emerald-400">🎯</span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">
                {isLoading ? (
                  <span className="inline-block h-8 w-14 animate-pulse rounded bg-slate-800" />
                ) : stats.avgScore !== null ? (
                  `${stats.avgScore}%`
                ) : (
                  "—"
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {stats.avgScore !== null ? "Across scored profiles" : "No score data yet"}
              </p>
            </div>

            {/* Card 3: Latest Report Date */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5 shadow-sm transition hover:border-violet-500/30">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Latest Report</span>
                <span className="text-lg text-violet-400">🕒</span>
              </div>
              <p className="mt-3 text-lg font-bold text-white sm:text-xl truncate">
                {isLoading ? (
                  <span className="inline-block h-8 w-24 animate-pulse rounded bg-slate-800" />
                ) : (
                  stats.latestFormatted
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">Most recent session</p>
            </div>

            {/* Card 4: Reports Generated This Month */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5 shadow-sm transition hover:border-violet-500/30">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">This Month</span>
                <span className="text-lg text-indigo-400">📅</span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">
                {isLoading ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-800" />
                ) : (
                  stats.thisMonthCount
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">In current calendar month</p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* E. LOADING AND ERROR STATES                               */}
        {/* ========================================================= */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
              <span>Fetching reports...</span>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="animate-pulse rounded-2xl border border-slate-800 bg-[#0f172a] p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 rounded bg-slate-800" />
                    <div className="h-5 w-16 rounded-full bg-slate-800" />
                  </div>
                  <div className="h-6 w-3/4 rounded bg-slate-800" />
                  <div className="h-4 w-1/2 rounded bg-slate-800" />
                  <div className="pt-4 border-t border-slate-800 flex justify-between">
                    <div className="h-8 w-24 rounded-lg bg-slate-800" />
                    <div className="h-8 w-8 rounded-lg bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center sm:p-8">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20 text-2xl text-rose-400">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-white">Failed to Load Reports</h2>
            <p className="mt-2 text-sm text-rose-300 max-w-md mx-auto">{error}</p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={fetchReports}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-rose-500"
              >
                Retry Request
              </button>
              {error.includes("session") && (
                <Link
                  to="/login"
                  className="rounded-xl border border-rose-500/40 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
                >
                  Go to Login
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* D. EMPTY STATE                                            */}
        {/* ========================================================= */}
        {!isLoading && !error && reportList.length === 0 && (
          <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-10 text-center shadow-xl sm:p-14">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl text-violet-400">
              📋
            </div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              No interview reports yet.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
              Generate your first personalized interview report to get started. Upload your resume and
              job requirements to receive targeted technical and behavioral questions.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500"
              >
                <span>✨</span>
                <span>Generate Your First Report</span>
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* C. REPORTS HISTORY GRID                                   */}
        {/* ========================================================= */}
        {!isLoading && !error && reportList.length > 0 && (
          <section aria-label="Reports History">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                All Reports ({reportList.length})
              </h2>
              <button
                type="button"
                onClick={fetchReports}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-400 transition"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reportList.map((rep) => {
                const title = extractTitle(rep);
                const score = typeof rep.matchScore === "number" ? rep.matchScore : null;

                const formattedDate = rep.createdAt
                  ? new Date(rep.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently";

                const techCount = Array.isArray(rep.technicalQuestions)
                  ? rep.technicalQuestions.length
                  : 0;

                const behavCount = Array.isArray(rep.behavioralQuestions)
                  ? rep.behavioralQuestions.length
                  : Array.isArray(rep.behaviorQuestions)
                  ? rep.behaviorQuestions.length
                  : 0;

                const isDeleting = deletingId === rep._id;
                const isConfirming = deleteConfirmId === rep._id;

                return (
                  <article
                    key={rep._id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5 shadow-sm transition hover:border-slate-700 hover:shadow-md hover:shadow-violet-950/20"
                  >
                    <div>
                      {/* Top Meta: Score & Date */}
                      <div className="flex items-center justify-between gap-2">
                        {getScoreBadge(score)}
                        <span className="text-xs text-slate-500">{formattedDate}</span>
                      </div>

                      {/* Title */}
                      <h3 className="mt-3.5 text-base font-bold leading-snug text-white line-clamp-2">
                        {title}
                      </h3>

                      {/* Question Counts Metadata */}
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0a0e1a]/60 px-2.5 py-1">
                          <span>💻</span>
                          <span>{techCount} Technical Qs</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0a0e1a]/60 px-2.5 py-1">
                          <span>👥</span>
                          <span>{behavCount} Behavioral Qs</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions: View, Download Resume & Delete */}
                    <div className="mt-6 border-t border-slate-800/80 pt-4 flex items-center justify-between gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/interview/${rep._id}`, {
                            state: { report: rep },
                          })
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600/15 border border-violet-500/30 px-3.5 py-2.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-600 hover:text-white"
                      >
                        <span>View</span>
                        <span>→</span>
                      </button>

                      {/* Download Resume with Gemini Icon */}
                      <button
                        type="button"
                        onClick={() => handleDownloadResume(rep._id)}
                        disabled={downloadingResumeId === rep._id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-violet-500/30 bg-[#0a0e1a] px-3 py-2.5 text-xs font-medium text-violet-300 transition hover:border-violet-400 hover:bg-violet-600/20 hover:text-white disabled:opacity-50"
                        title="Download Tailored Resume (Gemini PDF)"
                      >
                        {downloadingResumeId === rep._id ? (
                          <svg className="h-4 w-4 animate-spin text-violet-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <>
                            <GeminiIcon className="h-3.5 w-3.5" />
                            <span>Resume</span>
                          </>
                        )}
                      </button>

                      {/* Secure Delete with inline confirmation */}
                      {isConfirming ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(rep._id)}
                            className="rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                            title="Confirm delete"
                          >
                            {isDeleting ? "..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs text-slate-300 hover:text-white"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(rep._id)}
                          aria-label={`Delete report for ${title}`}
                          className="rounded-xl border border-slate-800 bg-[#0a0e1a] p-2.5 text-xs text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                          title="Delete report"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.75}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Reports;

