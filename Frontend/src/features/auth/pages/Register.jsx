import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { SiGooglegemini } from "react-icons/si";


const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { loading, handleRegister } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await handleRegister({ username, email, password });
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please verify your details and try again."
      );
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-[#0B0B0D]/70 backdrop-blur-[2px] text-[#F8FAFC]">
      {/* Split screen: Left branding hero panel (desktop only) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-[#303641]/80 bg-[#171A21]/80 backdrop-blur-md p-12 lg:flex">
        {/* Subtle burnt-orange ambient glow */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#FF6A00]/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#FFC857]/10 blur-3xl" />

        {/* Top brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A30] to-[#F06423] text-xl font-bold text-white shadow-lg shadow-[#FF7A30]/20">
            <SiGooglegemini />
          </div>
          <div>
            <div className="flex items-center gap-1 text-xl font-bold tracking-tight text-[#F8FAFC]">
              <span>Interview</span>
              <span className="text-[#FF7A30]">AI</span>
            </div>
          </div>
        </div>

        {/* Middle hero content */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A30]/30 bg-[#FF7A30]/10 px-3.5 py-1 text-xs font-semibold text-[#FF7A30]">
            <span></span>
            <span>Join 10,000+ Prepared Candidates</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#F8FAFC] xl:text-5xl">
            Get interview-ready, one step at a<span className="text-[#FF7A30]"> time.</span>
          </h1>

          <p className="text-base leading-relaxed text-[#A1A8B5]">
            Upload your resume, analyze any target job description, and obtain realistic interview questions, gap assessments, and daily roadmaps.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Instant job match evaluation & score",
              "Personalized technical & behavioral drills",
              "Exportable AI-enhanced tailored resumes",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-[#F8FAFC]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF7A30]/15 text-[#FF7A30]">
                  ✓
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 text-xs text-[#A1A8B5]">
          © 2026 Interview-AI. Empowering ambitious engineers worldwide.
        </div>
      </div>

      {/* Split screen: Right registration form panel */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
        {/* Subtle orange accent light */}
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#FF7A30]/5 blur-3xl" />

        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand header */}
          <div className="text-center lg:hidden">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A30] to-[#F06423] text-2xl font-bold text-white shadow-lg shadow-[#FF7A30]/20">
              ⚡
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#F8FAFC]">
              Interview<span className="text-[#FF7A30]">AI</span>
            </h2>
          </div>

          {/* Form Card Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
              Create an account
            </h2>
            <p className="text-sm text-[#A1A8B5]">
              Get started with free AI interview preparation and report generation.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-[#F87171]/40 bg-[#F87171]/10 p-3.5 text-xs text-[#F87171]"
            >
              <span className="mt-0.5 text-sm font-bold">⚠️</span>
              <p className="flex-1 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wider text-[#A1A8B5]"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-[#303641] bg-[#141820] px-4 py-3 text-sm text-[#F8FAFC] outline-none transition placeholder:text-[#A1A8B5]/50 focus:border-[#FF7A30] focus:ring-2 focus:ring-[#FF7A30]/20"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#A1A8B5]"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-[#303641] bg-[#141820] px-4 py-3 text-sm text-[#F8FAFC] outline-none transition placeholder:text-[#A1A8B5]/50 focus:border-[#FF7A30] focus:ring-2 focus:ring-[#FF7A30]/20"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#A1A8B5]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="w-full rounded-xl border border-[#303641] bg-[#141820] px-4 py-3 pr-11 text-sm text-[#F8FAFC] outline-none transition placeholder:text-[#A1A8B5]/50 focus:border-[#FF7A30] focus:ring-2 focus:ring-[#FF7A30]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A8B5] transition hover:text-[#F8FAFC]"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Primary Orange Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF7A30] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF7A30]/25 transition duration-200 hover:bg-[#F06423] hover:shadow-[#FF7A30]/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Login Navigation */}
          <div className="pt-2 text-center text-sm text-[#A1A8B5]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#FF7A30] transition hover:text-[#F06423] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
