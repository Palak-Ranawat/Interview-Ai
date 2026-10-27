import React, { useState, useEffect } from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import useInterview from "../hooks/useinterview";
import { SiGooglegemini } from "react-icons/si";
import { RiGeminiFill } from "react-icons/ri";
import { LuFileChartColumnIncreasing } from "react-icons/lu";
import { HiSparkles } from "react-icons/hi2";
import { MdComputer } from "react-icons/md";
import { FiMessageCircle } from "react-icons/fi";
import { CiStar } from "react-icons/ci";
import { TbTargetArrow } from "react-icons/tb";
import { IoPeople } from "react-icons/io5";
import { BiError } from "react-icons/bi";
import { FaRegCalendarAlt , FaCopy} from "react-icons/fa";
import { IoBulbOutline } from "react-icons/io5";


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
      fill="url(#gemini_sparkle_orange)"
    />
    <defs>
      <linearGradient
        id="gemini_sparkle_orange"
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

const Interview = (props) => {
  const location = useLocation();
  const params = useParams();
  const routeState = location.state || {};
  const { getReportById, getResumePdf, getReportPdf } = useInterview();

  const [fetchedReport, setFetchedReport] = useState(null);
  const [isFetching, setIsFetching] = useState(
    Boolean(params.interviewId && !props.report && !routeState.report)
  );
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reportDownloadError, setReportDownloadError] = useState(null);

  const handleDownloadResume = async () => {
    const targetId = report?._id || params?.interviewId;
    if (!targetId) {
      alert("Report ID not found. Please view a saved report to download the tailored resume.");
      return;
    }
    try {
      setDownloadingResume(true);
      setDownloadError(null);
      await getResumePdf(targetId);
    } catch (err) {
      console.error("Resume download failed:", err);
      setDownloadError("Failed to generate resume PDF. Please try again.");
      setTimeout(() => setDownloadError(null), 4000);
    } finally {
      setDownloadingResume(false);
    }
  };

  const handleDownloadReport = async () => {
    const targetId = report?._id || params?.interviewId;
    if (!targetId) {
      alert("Report ID not found. Please view a saved report to download the interview report PDF.");
      return;
    }
    try {
      setDownloadingReport(true);
      setReportDownloadError(null);
      await getReportPdf(targetId);
    } catch (err) {
      console.error("Report PDF download failed:", err);
      setReportDownloadError("Failed to generate report PDF. Please try again.");
      setTimeout(() => setReportDownloadError(null), 4000);
    } finally {
      setDownloadingReport(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchById = async () => {
      if (params.interviewId && !props.report && !routeState.report) {
        setIsFetching(true);
        try {
          const rep = await getReportById(params.interviewId);
          if (rep && isMounted) {
            setFetchedReport(rep);
          }
        } catch (e) {
          console.error("Could not fetch interview report by ID:", e);
        } finally {
          if (isMounted) {
            setIsFetching(false);
          }
        }
      }
    };
    fetchById();
    return () => {
      isMounted = false;
    };
  }, [params.interviewId]);

  // Resolve report data safely from props, React Router location state, fetched report, or fallback
  const rawReport =
    props.report ||
    props.interviewReport ||
    props.data ||
    routeState.report ||
    routeState.interviewReport ||
    fetchedReport ||
    routeState.data ||
    null;

  // Unpack in case of nested { interviewReport: { ... } } structure
  const report = rawReport?.interviewReport || rawReport;

  // Active navigation tab: 'dashboard' | 'technical' | 'behavioral' | 'skills' | 'roadmap'
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mobile sidebar drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Skill gap severity filter: 'all' | 'high' | 'medium' | 'low'
  const [severityFilter, setSeverityFilter] = useState("all");

  // Collapsible question states
  const [expandedTech, setExpandedTech] = useState({});
  const [expandedBehav, setExpandedBehav] = useState({});

  // Copy answer feedback tracker
  const [copiedId, setCopiedId] = useState(null);

  // Interactive task completion state for Preparation Roadmap
  const [completedTasks, setCompletedTasks] = useState({});

  // Loading indicator from props, routeState, or direct fetch
  const isLoading = Boolean(props.loading || props.isLoading || routeState.loading || isFetching);

  // Safely extract report arrays and values with fallbacks
  const matchScore = typeof report?.matchScore === "number" ? report.matchScore : 0;
  const technicalQuestions = Array.isArray(report?.technicalQuestions) ? report.technicalQuestions : [];
  const behavioralQuestions = Array.isArray(report?.behavioralQuestions)
    ? report.behavioralQuestions
    : Array.isArray(report?.behaviorQuestions)
    ? report.behaviorQuestions
    : [];
  const skillGaps = Array.isArray(report?.skillGaps) ? report.skillGaps : [];
  const preparationPlan = Array.isArray(report?.preparationPlan) ? report.preparationPlan : [];
  const jobDescription = report?.jobDescription || "";
  const selfDescription = report?.selfDescription || "";

  // Skill gap severity counts
  const highGaps = skillGaps.filter((g) => (g.severity || "").toLowerCase() === "high");
  const mediumGaps = skillGaps.filter((g) => (g.severity || "").toLowerCase() === "medium");
  const lowGaps = skillGaps.filter((g) => (g.severity || "").toLowerCase() === "low");

  // Filtered skill gaps based on selected filter
  const displayedSkillGaps =
    severityFilter === "all"
      ? skillGaps
      : skillGaps.filter((g) => (g.severity || "").toLowerCase() === severityFilter);

  // Roadmap task completion statistics
  const totalRoadmapTasks = preparationPlan.reduce(
    (acc, day) => acc + (Array.isArray(day?.tasks) ? day.tasks.length : 0),
    0
  );
  const completedTasksCount = Object.values(completedTasks).filter(Boolean).length;
  const roadmapProgressPct =
    totalRoadmapTasks > 0 ? Math.round((completedTasksCount / totalRoadmapTasks) * 100) : 0;

  // Toggle task checkbox
  const handleTaskToggle = (dayIdx, taskIdx) => {
    const key = `${dayIdx}-${taskIdx}`;
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Copy text helper
  const handleCopy = (text, id) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Toggle tech question accordion
  const toggleTechQuestion = (idx) => {
    setExpandedTech((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAllTech = () => {
    const allExpanded = technicalQuestions.every((_, i) => expandedTech[i]);
    const nextState = {};
    if (!allExpanded) {
      technicalQuestions.forEach((_, i) => {
        nextState[i] = true;
      });
    }
    setExpandedTech(nextState);
  };

  // Toggle behavioral question accordion
  const toggleBehavQuestion = (idx) => {
    setExpandedBehav((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAllBehav = () => {
    const allExpanded = behavioralQuestions.every((_, i) => expandedBehav[i]);
    const nextState = {};
    if (!allExpanded) {
      behavioralQuestions.forEach((_, i) => {
        nextState[i] = true;
      });
    }
    setExpandedBehav(nextState);
  };

  // Circular progress calculations for Right Sidebar
  const circleRadius = 46;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const clampedScore = Math.min(Math.max(matchScore, 0), 100);
  const strokeDashoffset = circleCircumference - (clampedScore / 100) * circleCircumference;

  // Navigation Items Definition
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 17a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z"
          />
        </svg>
      ),
    },
    {
      id: "technical",
      label: "Technical Questions",
      badge: technicalQuestions.length,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
    {
      id: "behavioral",
      label: "Behavioral Questions",
      badge: behavioralQuestions.length,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      ),
    },
    {
      id: "skills",
      label: "Skill Gaps",
      badge: skillGaps.length,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    {
      id: "roadmap",
      label: "Preparation Roadmap",
      badge: preparationPlan.length ? `${preparationPlan.length}d` : null,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
    },
  ];

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111318] px-4 text-[#F8FAFC]">
        <div className="w-full max-w-md rounded-2xl border border-[#303641] bg-[#1D222B] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF7A30]/10 text-[#FF7A30]">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF7A30]/30 border-t-[#FF7A30]" />
          </div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">Loading Report</h2>
          <p className="mt-1.5 text-xs text-[#A1A8B5]">
            Retrieving your personalized interview evaluation and roadmap...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // EMPTY STATE (No report provided)
  // ==========================================
  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111318] px-4 text-[#F8FAFC]">
        <div className="w-full max-w-lg rounded-2xl border border-[#303641] bg-[#1D222B] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF7A30]/10 text-3xl text-[#FF7A30]">
            <LuFileChartColumnIncreasing />

          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">No Interview Report Available</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#A1A8B5]">
            We couldn't find an interview report session. Please upload your resume and paste the job
            description to generate your personalized AI interview plan.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF7A30] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF7A30]/25 transition hover:bg-[#F06423]"
            >
              <span><SiGooglegemini /></span>
              <span>Generate New Report</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Helper for severity badge styling
  const renderSeverityBadge = (severity = "") => {
    const s = severity.toLowerCase();
    if (s === "high") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F87171]/30 bg-[#F87171]/10 px-2.5 py-1 text-xs font-semibold text-[#F87171]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F87171]" />
          High Severity
        </span>
      );
    }
    if (s === "medium") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFC857]/30 bg-[#FFC857]/10 px-2.5 py-1 text-xs font-semibold text-[#FFC857]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFC857]" />
          Medium Severity
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-2.5 py-1 text-xs font-semibold text-[#22C55E]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
        Low Severity
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D]/75 backdrop-blur-[1px] text-[#F8FAFC] antialiased">
      {/* Mobile Header Bar */}
      <div className="flex items-center justify-between border-b border-[#303641] bg-[#171A21]/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A30] to-[#F06423] text-lg font-bold text-white shadow-md shadow-[#FF7A30]/20">
            <RiGeminiFill />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-[#F8FAFC]">Interview</span>
            <span className="text-base font-bold text-[#FF7A30]">AI</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="rounded-lg border border-[#303641] bg-[#141820] p-2 text-[#A1A8B5] transition hover:text-[#F8FAFC]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Main Container Layout */}
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        {/* ========================================================= */}
        {/* 1. LEFT SIDEBAR — NAVIGATION                              */}
        {/* ========================================================= */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } fixed inset-y-0 left-0 z-40 w-64 border-r border-[#303641] bg-[#171A21] p-5 shadow-2xl lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:shrink-0 lg:shadow-none`}
        >
          {/* Logo Brand */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A30] to-[#F06423] text-lg font-bold text-white shadow-lg shadow-[#FF7A30]/20">
                <SiGooglegemini />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-[#F8FAFC]">Interview</span>
                <span className="text-lg font-bold text-[#FF7A30]">AI</span>
              </div>
            </div>
            {/* Close button for mobile drawer */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close mobile navigation"
              className="rounded-lg p-1 text-[#A1A8B5] hover:text-[#F8FAFC] lg:hidden"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border border-[#FF7A30]/30 bg-[#FF7A30]/15 text-[#FF7A30] shadow-sm"
                      : "text-[#A1A8B5] hover:bg-[#1D222B] hover:text-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors duration-200 ${
                        isActive ? "text-[#FF7A30]" : "text-[#A1A8B5] group-hover:text-[#F8FAFC]"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && (
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                        isActive
                          ? "bg-[#FF7A30]/20 text-[#FF7A30]"
                          : "bg-[#141820] text-[#A1A8B5] group-hover:text-[#F8FAFC]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-5 left-5 right-5 space-y-2">
            {/* Download Resume with Gemini Icon */}
            <button
              type="button"
              onClick={handleDownloadResume}
              disabled={downloadingResume}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#FF7A30]/40 bg-gradient-to-r from-[#FF7A30]/20 via-[#F06423]/20 to-[#FFC857]/10 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-[#FF7A30]/15 backdrop-blur-sm transition-all duration-200 hover:border-[#FF7A30] hover:bg-[#FF7A30]/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              title="Download tailored resume PDF generated with Gemini"
            >
              {downloadingResume ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-[#FF7A30]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <GeminiIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span>Download Resume</span>
                  <svg className="h-3 w-3 text-[#FFC857] transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </>
              )}
            </button>

            <Link
              to="/reports"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#303641] bg-[#141820] px-3.5 py-2 text-xs font-medium text-[#A1A8B5] transition hover:border-[#FF7A30]/50 hover:bg-[#1D222B] hover:text-[#FF7A30]"
            >
              <svg className="h-4 w-4 text-[#FF7A30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>My Reports</span>
            </Link>
            <Link
              to="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#303641] bg-[#141820] px-3.5 py-2 text-xs font-medium text-[#A1A8B5] transition hover:border-[#303641] hover:bg-[#1D222B] hover:text-[#F8FAFC]"
            >
              <span>←</span>
              <span>New Analysis</span>
            </Link>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. CENTER CONTENT — DYNAMIC SECTION                       */}
        {/* ========================================================= */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Welcome Heading Banner */}
              <div className="rounded-2xl border border-[#303641] bg-gradient-to-r from-[#1D222B] via-[#171A21] to-[#1D222B] p-6 shadow-xl sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF7A30]/30 bg-[#FF7A30]/10 px-3 py-1 text-xs font-semibold text-[#FF7A30]">
                    <HiSparkles /> AI Analysis Complete
                    </span>
                    <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-3xl">
                      Interview Preparation Dashboard
                    </h1>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#A1A8B5]">
                      Your resume has been comprehensively evaluated against the role requirements.
                      Review your technical & behavioral questions, bridge skill gaps, and execute the roadmap.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end sm:shrink-0">
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <span className="text-3xl font-extrabold text-[#FF7A30] sm:text-4xl">
                        {matchScore}%
                      </span>
                      <span className="text-xs font-medium uppercase tracking-wider text-[#A1A8B5]">
                        Match Score
                      </span>
                    </div>

                    {/* Action Buttons: Report PDF & Tailored Resume PDF */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadReport}
                        disabled={downloadingReport}
                        className="group inline-flex items-center gap-2 rounded-xl bg-[#FF7A30] px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#FF7A30]/25 backdrop-blur-sm transition-all duration-200 hover:bg-[#F06423] hover:shadow-[#FF7A30]/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Download full interview preparation report PDF"
                      >
                        {downloadingReport ? (
                          <>
                            <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Generating Report...</span>
                          </>
                        ) : (
                          <>
                            <GeminiIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            <span>Download Report PDF</span>
                            <svg className="h-3.5 w-3.5 text-[#FFC857] transition-transform duration-200 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadResume}
                        disabled={downloadingResume}
                        className="group inline-flex items-center gap-2 rounded-xl border border-[#303641] bg-[#141820] px-3 py-2.5 text-xs font-semibold text-[#FFC857] transition-all duration-200 hover:border-[#FF7A30]/50 hover:bg-[#FF7A30]/10 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Download tailored ATS resume PDF"
                      >
                        {downloadingResume ? (
                          <>
                            <svg className="h-4 w-4 animate-spin text-[#FF7A30]" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Generating Resume...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 text-[#FF7A30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download Resume</span>
                          </>
                        )}
                      </button>
                    </div>
                    {reportDownloadError && (
                      <span className="text-[11px] text-[#F87171]">{reportDownloadError}</span>
                    )}
                    {downloadError && (
                      <span className="text-[11px] text-[#F87171]">{downloadError}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Stats Cards */}
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
                {/* Stat 1: Match Score */}
                <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-4 shadow-sm transition hover:border-[#FF7A30]/40">
                  <div className="flex items-center justify-between text-[#A1A8B5]">
                    <span className="text-xs font-semibold">Match Score</span>
                    <span className="text-base text-[#FF7A30]"><TbTargetArrow /></span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">{matchScore}%</p>
                  <p className="mt-1 text-xs text-[#A1A8B5]">
                    {matchScore >= 80 ? "Strong Fit" : matchScore >= 60 ? "Moderate Fit" : "Needs Prep"}
                  </p>
                </div>

                {/* Stat 2: Technical Qs */}
                <div
                  onClick={() => setActiveTab("technical")}
                  className="cursor-pointer rounded-2xl border border-[#303641] bg-[#1D222B] p-4 shadow-sm transition hover:border-[#FF7A30]/50 hover:bg-[#141820]"
                >
                  <div className="flex items-center justify-between text-[#A1A8B5]">
                    <span className="text-xs font-semibold">Technical Qs</span>
                    <span className="text-base text-[#FF7A30]"><MdComputer /></span>


                
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">{technicalQuestions.length}</p>
                  <p className="mt-1 text-xs text-[#FF7A30]">View questions →</p>
                </div>

                {/* Stat 3: Behavioral Qs */}
                <div
                  onClick={() => setActiveTab("behavioral")}
                  className="cursor-pointer rounded-2xl border border-[#303641] bg-[#1D222B] p-4 shadow-sm transition hover:border-[#FF7A30]/50 hover:bg-[#141820]"
                >
                  <div className="flex items-center justify-between text-[#A1A8B5]">
                    <span className="text-xs font-semibold">Behavioral Qs</span>
                    <span className="text-base text-[#FFC857]"><IoPeople /></span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">{behavioralQuestions.length}</p>
                  <p className="mt-1 text-xs text-[#FFC857]">View questions →</p>
                </div>

                {/* Stat 4: Skill Gaps */}
                <div
                  onClick={() => setActiveTab("skills")}
                  className="cursor-pointer rounded-2xl border border-[#303641] bg-[#1D222B] p-4 shadow-sm transition hover:border-[#FF7A30]/50 hover:bg-[#141820]"
                >
                  <div className="flex items-center justify-between text-[#A1A8B5]">
                    <span className="text-xs font-semibold">Skill Gaps</span>
                    <span className="text-base text-[#FFC857]"><BiError /></span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">{skillGaps.length}</p>
                  <p className="mt-1 text-xs text-[#FFC857]">Review gaps →</p>
                </div>
              </div>

              {/* Quick Navigation Action Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                  onClick={() => setActiveTab("technical")}
                  className="group cursor-pointer rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm transition hover:border-[#FF7A30]/50 hover:bg-[#141820]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF7A30]/15 text-xl text-[#FF7A30] transition group-hover:scale-105">
                      <MdComputer />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#FF7A30]">
                        Technical Questions
                      </h3>
                      <p className="text-xs text-[#A1A8B5]">
                        {technicalQuestions.length} curated questions with interviewer intentions and model answers.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("behavioral")}
                  className="group cursor-pointer rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm transition hover:border-[#FF7A30]/50 hover:bg-[#141820]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFC857]/15 text-xl text-[#FFC857] transition group-hover:scale-105">
                      <FiMessageCircle />

                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#FFC857]">
                        Behavioral Questions
                      </h3>
                      <p className="text-xs text-[#A1A8B5]">
                        {behavioralQuestions.length} situational questions with STAR methodology responses.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("skills")}
                  className="group cursor-pointer rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm transition hover:border-[#FF7A30]/50 hover:bg-[#141820]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF7A30]/15 text-xl text-[#FF7A30] transition group-hover:scale-105">
                      <TbTargetArrow />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#FF7A30]">
                        Skill Gaps & Impact
                      </h3>
                      <p className="text-xs text-[#A1A8B5]">
                        {skillGaps.length} areas identified, categorized by low, medium, and high severity.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("roadmap")}
                  className="group cursor-pointer rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm transition hover:border-[#FF7A30]/50 hover:bg-[#141820]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22C55E]/15 text-xl text-[#22C55E] transition group-hover:scale-105">
                      <FaRegCalendarAlt />

                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#22C55E]">
                        Preparation Roadmap
                      </h3>
                      <p className="text-xs text-[#A1A8B5]">
                        {preparationPlan.length}-day action plan with interactive task checkboxes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary of Job & Profile Context if present */}
              {(jobDescription || selfDescription) && (
                <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-6 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A8B5]">
                    Role & Candidate Profile Reference
                  </h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {jobDescription && (
                      <div className="rounded-xl border border-[#303641] bg-[#141820] p-4">
                        <span className="text-xs font-semibold text-[#FF7A30]">Target Role Requirements</span>
                        <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-[#A1A8B5]">
                          {jobDescription}
                        </p>
                      </div>
                    )}
                    {selfDescription && (
                      <div className="rounded-xl border border-[#303641] bg-[#141820] p-4">
                        <span className="text-xs font-semibold text-[#22C55E]">Candidate Background</span>
                        <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-[#A1A8B5]">
                          {selfDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TECHNICAL QUESTIONS */}
          {activeTab === "technical" && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#F8FAFC] sm:text-2xl">Technical Questions</h2>
                  <p className="text-xs text-[#A1A8B5] sm:text-sm">
                    {technicalQuestions.length} questions tailored to test your technical competency.
                  </p>
                </div>
                {technicalQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllTech}
                    className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#303641] bg-[#141820] px-3.5 py-2 text-xs font-semibold text-[#F8FAFC] transition hover:border-[#FF7A30]/50 hover:bg-[#1D222B] hover:text-[#FF7A30]"
                  >
                    <span>{technicalQuestions.every((_, i) => expandedTech[i]) ? "Collapse All" : "Expand All"}</span>
                  </button>
                )}
              </div>

              {technicalQuestions.length === 0 ? (
                <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-8 text-center text-sm text-[#A1A8B5]">
                  No technical questions generated in this report.
                </div>
              ) : (
                <div className="space-y-4">
                  {technicalQuestions.map((q, idx) => {
                    const isExpanded = Boolean(expandedTech[idx]);
                    const copyKey = `tech-${idx}`;
                    const isCopied = copiedId === copyKey;

                    return (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-2xl border border-[#303641] bg-[#1D222B] shadow-sm transition hover:border-[#FF7A30]/40"
                      >
                        {/* Question Card Header */}
                        <div
                          onClick={() => toggleTechQuestion(idx)}
                          className="flex cursor-pointer items-start justify-between gap-4 p-5"
                        >
                          <div className="flex items-start gap-3.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF7A30]/15 text-xs font-bold text-[#FF7A30]">
                              Q{idx + 1}
                            </span>
                            <div>
                              <h3 className="text-sm font-semibold leading-snug text-[#F8FAFC] sm:text-base">
                                {q.question}
                              </h3>
                              <span className="mt-1.5 inline-block text-[11px] font-medium text-[#FF7A30]">
                                {isExpanded ? "Click to collapse" : "Click to view intention & answer"}
                              </span>
                            </div>
                          </div>
                          <span className="text-[#A1A8B5] transition-transform duration-200">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>

                        {/* Collapsible Answer & Intention Section */}
                        {isExpanded && (
                          <div className="space-y-4 border-t border-[#303641] bg-[#141820]/60 p-5 pt-4">
                            {/* Intention */}
                            {q.intention && (
                              <div className="rounded-xl border border-[#303641] bg-[#141820] p-4">
                                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#FF7A30]">
                                  <span><TbTargetArrow /></span> Interviewer Intention
                                </span>
                                <p className="mt-1.5 text-xs leading-relaxed text-[#A1A8B5] sm:text-sm">
                                  {q.intention}
                                </p>
                              </div>
                            )}

                            {/* Suggested Answer */}
                            {q.answer && (
                              <div className="rounded-xl border border-[#303641] bg-[#141820] p-4">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
                                    <span><IoBulbOutline /></span> Suggested Answer & Strategy
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(q.answer, copyKey);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#303641] bg-[#171A21] px-2.5 py-1 text-xs font-medium text-[#A1A8B5] transition hover:border-[#FF7A30]/40 hover:text-[#FF7A30]"
                                  >
                                    <span><FaCopy />
{isCopied ? "✓ Copied" : "Copy Answer"}</span>
                                  </button>
                                </div>
                                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-[#F8FAFC] sm:text-sm">
                                  {q.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BEHAVIORAL QUESTIONS */}
          {activeTab === "behavioral" && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#F8FAFC] sm:text-2xl">Behavioral Questions</h2>
                  <p className="text-xs text-[#A1A8B5] sm:text-sm">
                    {behavioralQuestions.length} situational questions to assess leadership, collaboration, and problem solving.
                  </p>
                </div>
                {behavioralQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllBehav}
                    className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#303641] bg-[#141820] px-3.5 py-2 text-xs font-semibold text-[#F8FAFC] transition hover:border-[#FF7A30]/50 hover:bg-[#1D222B] hover:text-[#FF7A30]"
                  >
                    <span>{behavioralQuestions.every((_, i) => expandedBehav[i]) ? "Collapse All" : "Expand All"}</span>
                  </button>
                )}
              </div>

              {behavioralQuestions.length === 0 ? (
                <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-8 text-center text-sm text-[#A1A8B5]">
                  No behavioral questions generated in this report.
                </div>
              ) : (
                <div className="space-y-4">
                  {behavioralQuestions.map((q, idx) => {
                    const isExpanded = Boolean(expandedBehav[idx]);
                    const copyKey = `behav-${idx}`;
                    const isCopied = copiedId === copyKey;

                    return (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-2xl border border-[#303641] bg-[#1D222B] shadow-sm transition hover:border-[#FF7A30]/40"
                      >
                        {/* Question Card Header */}
                        <div
                          onClick={() => toggleBehavQuestion(idx)}
                          className="flex cursor-pointer items-start justify-between gap-4 p-5"
                        >
                          <div className="flex items-start gap-3.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFC857]/15 text-xs font-bold text-[#FFC857]">
                              B{idx + 1}
                            </span>
                            <div>
                              <h3 className="text-sm font-semibold leading-snug text-[#F8FAFC] sm:text-base">
                                {q.question}
                              </h3>
                              <span className="mt-1.5 inline-block text-[11px] font-medium text-[#FFC857]">
                                {isExpanded ? "Click to collapse" : "Click to view intention & answer"}
                              </span>
                            </div>
                          </div>
                          <span className="text-[#A1A8B5] transition-transform duration-200">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>

                        {/* Collapsible Intention & Answer */}
                        {isExpanded && (
                          <div className="space-y-4 border-t border-[#303641] bg-[#141820]/60 p-5 pt-4">
                            {/* Intention */}
                            {q.intention && (
                              <div className="rounded-xl border border-[#303641] bg-[#141820] p-4">
                                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#FFC857]">
                                  <span><TbTargetArrow /></span> Behavioral Objective
                                </span>
                                <p className="mt-1.5 text-xs leading-relaxed text-[#A1A8B5] sm:text-sm">
                                  {q.intention}
                                </p>
                              </div>
                            )}

                            {/* Suggested Answer */}
                            {q.answer && (
                              <div className="rounded-xl border border-[#303641] bg-[#141820] p-4">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
                                    <span><CiStar /></span> STAR Method Model Answer
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(q.answer, copyKey);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#303641] bg-[#171A21] px-2.5 py-1 text-xs font-medium text-[#A1A8B5] transition hover:border-[#FF7A30]/40 hover:text-[#FF7A30]"
                                  >
                                    <span>{isCopied ? "✓ Copied" : "<FaRegCopy /> Copy Answer"}</span>
                                  </button>
                                </div>
                                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-[#F8FAFC] sm:text-sm">
                                  {q.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SKILL GAPS */}
          {activeTab === "skills" && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#F8FAFC] sm:text-2xl">Identified Skill Gaps</h2>
                  <p className="text-xs text-[#A1A8B5] sm:text-sm">
                    Skills to prioritize before your interview based on profile discrepancies.
                  </p>
                </div>
                {/* Severity Filter Controls */}
                <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#303641] bg-[#141820] p-1">
                  {[
                    { id: "all", label: `All (${skillGaps.length})` },
                    { id: "high", label: `High (${highGaps.length})` },
                    { id: "medium", label: `Med (${mediumGaps.length})` },
                    { id: "low", label: `Low (${lowGaps.length})` },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSeverityFilter(filter.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        severityFilter === filter.id
                          ? "bg-[#FF7A30] text-white shadow-sm"
                          : "text-[#A1A8B5] hover:text-[#F8FAFC]"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {displayedSkillGaps.length === 0 ? (
                <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-8 text-center text-sm text-[#A1A8B5]">
                  {skillGaps.length === 0
                    ? "No skill gaps identified. Your profile closely matches the requirements!"
                    : "No skill gaps found for this severity filter."}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {displayedSkillGaps.map((item, idx) => {
                    const skillName = item.skill || item.skills || "Unspecified Skill";
                    const severity = item.severity || "medium";
                    const explanation = item.explanation || item.reason || item.description || null;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col justify-between rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm transition hover:border-[#FF7A30]/40"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-semibold text-[#F8FAFC]">{skillName}</h3>
                            {renderSeverityBadge(severity)}
                          </div>
                          {explanation && (
                            <p className="mt-2 text-xs leading-relaxed text-[#A1A8B5]">
                              {explanation}
                            </p>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-[#303641] pt-3 text-[11px] text-[#A1A8B5]">
                          <span>Priority Index: #{idx + 1}</span>
                          <span
                            onClick={() => setActiveTab("roadmap")}
                            className="cursor-pointer text-[#FF7A30] transition hover:underline"
                          >
                            Addressed in Roadmap →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PREPARATION ROADMAP */}
          {activeTab === "roadmap" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#F8FAFC] sm:text-2xl">Preparation Roadmap</h2>
                  <p className="text-xs text-[#A1A8B5] sm:text-sm">
                    Structured day-by-day plan to prepare thoroughly before interview day.
                  </p>
                </div>
                <div className="rounded-xl border border-[#303641] bg-[#141820] px-3.5 py-2 text-xs text-[#A1A8B5]">
                  <span className="font-bold text-[#FF7A30]">{completedTasksCount}</span> of{" "}
                  <span className="font-bold text-[#F8FAFC]">{totalRoadmapTasks}</span> tasks completed (
                  <span className="font-bold text-[#22C55E]">{roadmapProgressPct}%</span>)
                </div>
              </div>

              {/* Session persistence notice */}
              <div className="flex items-center gap-2 rounded-xl border border-[#FF7A30]/30 bg-[#FF7A30]/10 px-4 py-3 text-xs text-[#FF7A30]">
                <span>ℹ</span>
                <span>
                  Roadmap task checkboxes are tracked interactively for your current preparation session.
                </span>
              </div>

              {preparationPlan.length === 0 ? (
                <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-8 text-center text-sm text-[#A1A8B5]">
                  No preparation plan generated for this report.
                </div>
              ) : (
                <div className="space-y-4">
                  {preparationPlan.map((dayPlan, dayIdx) => {
                    const dayNum = dayPlan.day || dayIdx + 1;
                    const focus = dayPlan.focus || "Focus Topic";
                    const tasks = Array.isArray(dayPlan.tasks) ? dayPlan.tasks : [];

                    // Count completed for this day
                    const dayCompleted = tasks.filter((_, tIdx) => completedTasks[`${dayIdx}-${tIdx}`]).length;

                    return (
                      <div
                        key={dayIdx}
                        className="rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm transition hover:border-[#FF7A30]/40 sm:p-6"
                      >
                        {/* Day Header */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FF7A30]/15 text-xs font-bold text-[#FF7A30]">
                              D{dayNum}
                            </span>
                            <div>
                              <h3 className="text-base font-semibold text-[#F8FAFC]">
                                Day {dayNum}: {focus}
                              </h3>
                              <p className="text-xs text-[#A1A8B5]">
                                {tasks.length} targeted preparation task{tasks.length === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>
                          <span className="self-start rounded-full border border-[#303641] bg-[#141820] px-3 py-1 text-xs font-medium text-[#A1A8B5] sm:self-auto">
                            {dayCompleted}/{tasks.length} Done
                          </span>
                        </div>

                        {/* Tasks Checklist */}
                        <div className="mt-4 space-y-2.5 border-t border-[#303641] pt-4">
                          {tasks.map((task, taskIdx) => {
                            const isChecked = Boolean(completedTasks[`${dayIdx}-${taskIdx}`]);

                            return (
                              <label
                                key={taskIdx}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                                  isChecked
                                    ? "border-[#22C55E]/30 bg-[#22C55E]/5 text-[#A1A8B5]"
                                    : "border-[#303641] bg-[#141820] text-[#F8FAFC] hover:border-[#FF7A30]/40"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTaskToggle(dayIdx, taskIdx)}
                                  className="mt-0.5 h-4 w-4 rounded border-[#303641] bg-[#1D222B] text-[#FF7A30] accent-[#FF7A30] focus:ring-[#FF7A30]"
                                />
                                <span className={`text-xs leading-relaxed sm:text-sm ${isChecked ? "line-through text-[#A1A8B5]" : "text-[#F8FAFC]"}`}>
                                  {task}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ========================================================= */}
        {/* 3. RIGHT SIDEBAR — INSIGHTS                               */}
        {/* ========================================================= */}
        <aside className="w-full shrink-0 border-t border-[#303641] bg-[#171A21] p-5 lg:w-80 lg:border-l lg:border-t-0 lg:p-6">
          <div className="sticky top-6 space-y-6">
            {/* Overall Match Score Card with Circular Gauge */}
            <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-5 text-center shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A8B5]">
                Candidate Fit Score
              </h3>

              {/* Circular Indicator */}
              <div className="relative mx-auto my-4 flex h-32 w-32 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="scoreOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF7A30" />
                      <stop offset="100%" stopColor="#FFC857" />
                    </linearGradient>
                  </defs>
                  {/* Track Circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r={circleRadius}
                    stroke="#303641"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r={circleRadius}
                    stroke="url(#scoreOrangeGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Score Number in Center */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-[#F8FAFC]">{matchScore}%</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#A1A8B5]">Match</span>
                </div>
              </div>

              <div className="mt-3">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    matchScore >= 80
                      ? "border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]"
                      : matchScore >= 60
                      ? "border border-[#FF7A30]/30 bg-[#FF7A30]/10 text-[#FF7A30]"
                      : "border border-[#FFC857]/30 bg-[#FFC857]/10 text-[#FFC857]"
                  }`}
                >
                  {matchScore >= 80 ? "High Match Potential" : matchScore >= 60 ? "Moderate Alignment" : "Preparation Required"}
                </span>
                <p className="mt-2 text-xs text-[#A1A8B5]">
                  {matchScore >= 80
                    ? "Your skills strongly overlap with primary job requirements."
                    : "Focus on identified skill gaps to boost interview confidence."}
                </p>
              </div>
            </div>

            {/* Skill Gap Severity Breakdown */}
            <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A8B5]">
                  Skill Gaps Severity
                </h3>
                <span className="text-xs font-semibold text-[#F8FAFC]">{skillGaps.length} total</span>
              </div>

              {/* Progress Stack Bar */}
              {skillGaps.length > 0 && (
                <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-[#141820]">
                  {highGaps.length > 0 && (
                    <div
                      style={{ width: `${(highGaps.length / skillGaps.length) * 100}%` }}
                      className="bg-[#F87171] transition-all duration-500"
                      title={`${highGaps.length} High Severity`}
                    />
                  )}
                  {mediumGaps.length > 0 && (
                    <div
                      style={{ width: `${(mediumGaps.length / skillGaps.length) * 100}%` }}
                      className="bg-[#FFC857] transition-all duration-500"
                      title={`${mediumGaps.length} Medium Severity`}
                    />
                  )}
                  {lowGaps.length > 0 && (
                    <div
                      style={{ width: `${(lowGaps.length / skillGaps.length) * 100}%` }}
                      className="bg-[#22C55E] transition-all duration-500"
                      title={`${lowGaps.length} Low Severity`}
                    />
                  )}
                </div>
              )}

              {/* Severity Counts Table */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#A1A8B5]">
                    <span className="h-2 w-2 rounded-full bg-[#F87171]" />
                    High Severity
                  </span>
                  <span className="font-semibold text-[#F8FAFC]">{highGaps.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#A1A8B5]">
                    <span className="h-2 w-2 rounded-full bg-[#FFC857]" />
                    Medium Severity
                  </span>
                  <span className="font-semibold text-[#F8FAFC]">{mediumGaps.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#A1A8B5]">
                    <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                    Low Severity
                  </span>
                  <span className="font-semibold text-[#F8FAFC]">{lowGaps.length}</span>
                </div>
              </div>
            </div>

            {/* Recommended Preparation Priorities */}
            <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A8B5]">
                Preparation Priorities
              </h3>
              <p className="mt-1 text-xs text-[#A1A8B5]">Address high-severity items first</p>

              <div className="mt-3.5 space-y-2">
                {highGaps.length > 0 ? (
                  highGaps.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-[#F87171]/20 bg-[#F87171]/5 px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-[#F8FAFC] truncate max-w-[150px]">
                        {item.skill || item.skills}
                      </span>
                      <span className="text-[10px] font-semibold text-[#F87171]">High Priority</span>
                    </div>
                  ))
                ) : mediumGaps.length > 0 ? (
                  mediumGaps.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-[#FFC857]/20 bg-[#FFC857]/5 px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-[#F8FAFC] truncate max-w-[150px]">
                        {item.skill || item.skills}
                      </span>
                      <span className="text-[10px] font-semibold text-[#FFC857]">Medium Priority</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#A1A8B5]">No critical priority gaps identified.</p>
                )}
              </div>
            </div>

            {/* Preparation Roadmap Progress Card */}
            <div className="rounded-2xl border border-[#303641] bg-[#1D222B] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A8B5]">
                  Roadmap Progress
                </h3>
                <span className="text-xs font-semibold text-[#FF7A30]">{roadmapProgressPct}%</span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#141820]">
                <div
                  style={{ width: `${roadmapProgressPct}%` }}
                  className="h-full bg-gradient-to-r from-[#FF7A30] to-[#FFC857] transition-all duration-300"
                />
              </div>
              <p className="mt-2 text-xs text-[#A1A8B5]">
                {completedTasksCount} of {totalRoadmapTasks} tasks checked off in this session.
              </p>
            </div>

            {/* Gemini Tailored Resume Card */}
            <div className="rounded-2xl border border-[#FF7A30]/30 bg-gradient-to-b from-[#171A21] to-[#1D222B] p-5 shadow-lg">
              <div className="flex items-center gap-2">
                <GeminiIcon className="h-4 w-4" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FF7A30]">
                  Gemini Resume
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#A1A8B5]">
                Tailored ATS-optimized resume crafted specifically to match this job description.
              </p>
              <button
                type="button"
                onClick={handleDownloadResume}
                disabled={downloadingResume}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF7A30] px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#FF7A30]/20 transition hover:bg-[#F06423] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloadingResume ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4" />
                    <span>Download Resume</span>
                    <svg className="h-3.5 w-3.5 text-[#FFC857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Interview;
