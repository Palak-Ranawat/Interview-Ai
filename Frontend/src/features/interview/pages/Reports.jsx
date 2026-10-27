import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import useInterview from "../hooks/useinterview";
import { SiGooglegemini } from "react-icons/si";
import { TbTargetArrow } from "react-icons/tb";
import { MdComputer } from "react-icons/md";
import { FaChartBar } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import { MdDashboard } from "react-icons/md";
import { IoPeople } from "react-icons/io5";
import { RiSparklingFill } from "react-icons/ri";
import { GoAlertFill } from "react-icons/go";



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
      fill="url(#gemini_sparkle_orange_rep)"
    />
    <defs>
      <linearGradient
        id="gemini_sparkle_orange_rep"
        x1="2"
        y1="2"
        x2="22"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFC857" />
        <stop offset="50%" stopColor="#FF7A30" />
        <stop offset="100%" stopColor="#F06423" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * My Reports Dashboard Component
 *
 * Displays all generated interview reports for the authenticated user,
 * calculated summary statistics, and options to view, download resume or delete reports.
 */
const Reports = () => {
  const navigate = useNavigate();
  const { reports, getReports, deleteReport, getResumePdf, getReportPdf } = useInterview();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [downloadingResumeId, setDownloadingResumeId] = useState(null);
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  const handleDownloadResume = async (reportId) => {
    try {
      setDownloadingResumeId(reportId);
      await getResumePdf(reportId);
    } catch (err) {
      console.error("Resume download failed:", err);
      alert(err.message || "Failed to download resume PDF. Please try again.");
    } finally {
      setDownloadingResumeId(null);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      setDownloadingReportId(reportId);
      await getReportPdf(reportId);
    } catch (err) {
      console.error("Report download failed:", err);
      alert(err.message || "Failed to download report PDF. Please try again.");
    } finally {
      setDownloadingReportId(null);
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
      const match = report.jobDescription.match(/\*\*Job Title:\*\*\s*([^\r\n]+)/i);
      if (match && match[1]) {
        return match[1].replace(/[#*_]/g, "").trim();
      }
      const matchPlain = report.jobDescription.match(/Job Title:\s*([^\r\n]+)/i);
      if (matchPlain && matchPlain[1]) {
        return matchPlain[1].replace(/[#*_]/g, "").trim();
      }
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

  // ==========================================
  // CALCULATED REAL STATISTICS
  // ==========================================
  const reportList = Array.isArray(reports) ? reports : [];

  const stats = useMemo(() => {
    const list = Array.isArray(reports) ? reports : [];
    const totalReports = list.length;

    // 1. Average Match Score (calculated from actual numeric matchScores)
    const validScores = list
      .map((r) => Number(r.matchScore))
      .filter((s) => !isNaN(s) && s > 0);
    const avgScore =
      validScores.length > 0
        ? Math.round(validScores.reduce((acc, score) => acc + score, 0) / validScores.length)
        : null;

    // 2. Latest Report Date (from actual report creation timestamps)
    let latestFormatted = "N/A";
    if (list.length > 0) {
      const sortedByDate = [...list].sort((a, b) => {
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

    const thisMonthCount = list.filter((r) => {
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
  }, [reports]);

  // Color helper for match score badge
  const getScoreBadge = (score) => {
    if (typeof score !== "number" || isNaN(score)) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#303641] bg-[#141820] px-2.5 py-1 text-xs font-semibold text-[#A1A8B5]">
          N/A
        </span>
      );
    }

    if (score >= 80) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-2.5 py-1 text-xs font-semibold text-[#22C55E]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          {score}% Match
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF7A30]/30 bg-[#FF7A30]/10 px-2.5 py-1 text-xs font-semibold text-[#FF7A30]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A30]" />
          {score}% Match
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFC857]/30 bg-[#FFC857]/10 px-2.5 py-1 text-xs font-semibold text-[#FFC857]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FFC857]" />
        {score}% Match
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D]/75 backdrop-blur-[1px] text-[#F8FAFC] antialiased">
      {/* Top Navigation Bar */}
      <nav className="border-b border-[#303641] bg-[#171A21] px-4 py-4 backdrop-blur-md sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A30] to-[#F06423] text-lg font-bold text-white shadow-md shadow-[#FF7A30]/20">
              <SiGooglegemini />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#F8FAFC]">Interview</span>
              <span className="text-lg font-bold text-[#FF7A30]">AI</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#303641] bg-[#141820] px-3.5 py-2 text-xs font-medium text-[#F8FAFC] transition hover:border-[#FF7A30]/50 hover:bg-[#1D222B] hover:text-[#FF7A30]"
            >
              <span><RiSparklingFill /></span>
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF7A30]/30 bg-[#FF7A30]/10 px-3 py-1 text-xs font-semibold text-[#FF7A30]">
                <MdDashboard /> Dashboard
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-3xl lg:text-4xl">
              My Interview Reports
            </h1>
            <p className="mt-1 text-sm text-[#A1A8B5]">
              Track your interview preparation progress and review historical analyses.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF7A30] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF7A30]/25 transition duration-200 hover:-translate-y-0.5 hover:bg-[#F06423] hover:shadow-[#FF7A30]/40"
          >
            <span><RiSparklingFill /></span>
            <span>Generate New Report</span>
          </Link>
        </header>

        {/* ========================================================= */}
        {/* B. STATISTICS CARDS                                       */}
        {/* ========================================================= */}
        <section aria-label="Report Statistics" className="mb-10">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Card 1: Total Reports */}
            <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm transition hover:border-[#FF7A30]/40">
              <div className="flex items-center justify-between text-[#A1A8B5]">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Reports</span>
                <span className="text-lg text-[#FF7A30]"><FaChartBar /></span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-[#F8FAFC]">
                {isLoading ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded bg-[#141820]" />
                ) : (
                  stats.totalReports
                )}
              </p>
              <p className="mt-1 text-xs text-[#A1A8B5]">Lifetime reports generated</p>
            </div>

            {/* Card 2: Average Match Score */}
            <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm transition hover:border-[#FF7A30]/40">
              <div className="flex items-center justify-between text-[#A1A8B5]">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Match Score</span>
                <span className="text-lg text-[#FF7A30]"><TbTargetArrow /></span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-[#F8FAFC]">
                {isLoading ? (
                  <span className="inline-block h-8 w-16 animate-pulse rounded bg-[#141820]" />
                ) : stats.avgScore !== null ? (
                  `${stats.avgScore}%`
                ) : (
                  "—"
                )}
              </p>
              <p className="mt-1 text-xs text-[#A1A8B5]">Across all generated profiles</p>
            </div>

            {/* Card 3: Latest Report Date */}
            <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm transition hover:border-[#FF7A30]/40">
              <div className="flex items-center justify-between text-[#A1A8B5]">
                <span className="text-xs font-semibold uppercase tracking-wider">Latest Analysis</span>
                <span className="text-lg text-[#FFC857]"><SlCalender /></span>
              </div>
              <p className="mt-3 text-xl font-bold text-[#F8FAFC] truncate">
                {isLoading ? (
                  <span className="inline-block h-8 w-24 animate-pulse rounded bg-[#141820]" />
                ) : (
                  stats.latestFormatted
                )}
              </p>
              <p className="mt-1 text-xs text-[#A1A8B5]">Most recent report timestamp</p>
            </div>

            {/* Card 4: Reports This Month */}
            <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm transition hover:border-[#FF7A30]/40">
              <div className="flex items-center justify-between text-[#A1A8B5]">
                <span className="text-xs font-semibold uppercase tracking-wider">This Month</span>
                <span className="text-lg text-[#22C55E]">⚡</span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-[#F8FAFC]">
                {isLoading ? (
                  <span className="inline-block h-8 w-10 animate-pulse rounded bg-[#141820]" />
                ) : (
                  stats.thisMonthCount
                )}
              </p>
              <p className="mt-1 text-xs text-[#A1A8B5]">Reports generated this month</p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* E. ERROR STATE WITH RETRY                                 */}
        {/* ========================================================= */}
        {error && (
          <div
            role="alert"
            className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#F87171]/40 bg-[#F87171]/10 p-5 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl"><GoAlertFill />
</span>
              <div>
                <h3 className="text-sm font-bold text-[#F87171]">Failed to load reports</h3>
                <p className="text-xs text-[#A1A8B5]">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {error.includes("session has expired") ? (
                <Link
                  to="/login"
                  className="rounded-xl bg-[#F87171] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#F87171]/80"
                >
                  Log In Again
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={fetchReports}
                  className="rounded-xl border border-[#303641] bg-[#171A21] px-4 py-2 text-xs font-semibold text-[#F8FAFC] transition hover:bg-[#303641]"
                >
                  Retry Request
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* C. REPORTS HISTORY & D. EMPTY / LOADING STATES             */}
        {/* ========================================================= */}
        <section aria-label="Reports History">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#F8FAFC]">All Saved Reports</h2>
            {!isLoading && (
              <span className="text-xs text-[#A1A8B5]">
                {reportList.length} report{reportList.length === 1 ? "" : "s"} found
              </span>
            )}
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl border border-[#303641] bg-[#1D222B] p-6 shadow-sm animate-pulse"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-20 rounded-full bg-[#141820]" />
                      <div className="h-4 w-16 rounded bg-[#141820]" />
                    </div>
                    <div className="mt-4 h-6 w-3/4 rounded bg-[#141820]" />
                    <div className="mt-3 flex gap-2">
                      <div className="h-5 w-24 rounded-lg bg-[#141820]" />
                      <div className="h-5 w-24 rounded-lg bg-[#141820]" />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-[#303641] pt-4">
                    <div className="h-9 w-28 rounded-xl bg-[#141820]" />
                    <div className="h-9 w-9 rounded-xl bg-[#141820]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* D. Friendly Empty State */}
          {!isLoading && !error && reportList.length === 0 && (
            <div className="rounded-3xl border border-[#303641] bg-[#1D222B] p-12 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF7A30]/10 text-3xl text-[#FF7A30]">
                <MdDashboard />
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">No interview reports yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#A1A8B5]">
                Generate your first personalized interview report to get started. Upload your resume and paste the job description to receive tailored technical questions and roadmaps.
              </p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF7A30] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF7A30]/25 transition hover:bg-[#F06423]"
                >
                  <span><RiSparklingFill /></span>
                  <span>Generate Your First Report</span>
                </Link>
              </div>
            </div>
          )}

          {/* C. Report Cards Grid */}
          {!isLoading && reportList.length > 0 && (
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
                  : "Recent";

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
                    className="group flex flex-col justify-between rounded-2xl border border-[#303641] bg-[#1D222B] p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#FF7A30]/40 hover:shadow-xl hover:shadow-black/40"
                  >
                    <div>
                      {/* Top Meta: Score & Date */}
                      <div className="flex items-center justify-between gap-2">
                        {getScoreBadge(score)}
                        <span className="text-xs text-[#A1A8B5]">{formattedDate}</span>
                      </div>

                      {/* Title */}
                      <h3 className="mt-3.5 text-base font-bold leading-snug text-[#F8FAFC] line-clamp-2">
                        {title}
                      </h3>

                      {/* Question Counts Metadata */}
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#A1A8B5]">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#303641] bg-[#141820] px-2.5 py-1">
                          <span className="text-[#FF7A30]"> <MdComputer />
                    </span>
                          <span>{techCount} Technical Qs</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#303641] bg-[#141820] px-2.5 py-1">
                          <span className="text-[#FFC857]"><IoPeople /></span>
                          <span>{behavCount} Behavioral Qs</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions: View, Download Resume & Delete */}
                    <div className="mt-6 border-t border-[#303641] pt-4 flex items-center justify-between gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/interview/${rep._id}`, {
                            state: { report: rep },
                          })
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#FF7A30]/30 bg-[#FF7A30]/15 px-3.5 py-2.5 text-xs font-semibold text-[#FF7A30] transition hover:bg-[#FF7A30] hover:text-white"
                      >
                        <span>View</span>
                        <span>→</span>
                      </button>

                      {/* Download Report PDF */}
                      <button
                        type="button"
                        onClick={() => handleDownloadReport(rep._id)}
                        disabled={downloadingReportId === rep._id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#303641] bg-[#141820] px-2.5 py-2.5 text-xs font-medium text-[#FF7A30] transition hover:border-[#FF7A30]/60 hover:bg-[#FF7A30]/10 hover:text-white disabled:opacity-50"
                        title="Download Interview Report PDF"
                      >
                        {downloadingReportId === rep._id ? (
                          <svg className="h-4 w-4 animate-spin text-[#FF7A30]" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <>
                            <GeminiIcon className="h-3.5 w-3.5" />
                            <span>Report</span>
                          </>
                        )}
                      </button>

                      {/* Download Resume with Gemini Icon */}
                      <button
                        type="button"
                        onClick={() => handleDownloadResume(rep._id)}
                        disabled={downloadingResumeId === rep._id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#303641] bg-[#141820] px-2.5 py-2.5 text-xs font-medium text-[#FFC857] transition hover:border-[#FF7A30]/50 hover:bg-[#FF7A30]/10 hover:text-white disabled:opacity-50"
                        title="Download Tailored Resume (Gemini PDF)"
                      >
                        {downloadingResumeId === rep._id ? (
                          <svg className="h-4 w-4 animate-spin text-[#FF7A30]" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5 text-[#FF7A30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
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
                            className="rounded-lg bg-[#F87171] px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-[#F87171]/80 disabled:opacity-50"
                            title="Confirm delete"
                          >
                            {isDeleting ? "..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-lg border border-[#303641] bg-[#141820] px-2.5 py-2 text-xs text-[#A1A8B5] hover:text-[#F8FAFC]"
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
                          className="rounded-xl border border-[#303641] bg-[#141820] p-2.5 text-xs text-[#A1A8B5] transition hover:border-[#F87171]/40 hover:bg-[#F87171]/10 hover:text-[#F87171]"
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
          )}
        </section>
      </main>
    </div>
  );
};

export default Reports;
