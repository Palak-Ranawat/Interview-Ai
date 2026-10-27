const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Resilient candidate models ordered by responsiveness and low-latency availability
const CANDIDATE_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
];

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100),
    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string(),
        })
    ),
    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string(),
        })
    ),
    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"]),
        })
    ),
    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string()),
        })
    ).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
});

function cleanJsonText(rawText) {
    if (!rawText) return "{}";
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
    }
    return cleaned.trim();
}

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    const prompt = `
Generate a detailed interview preparation report.

Candidate Resume:
${resume || "Not provided"}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription || "Not provided"}

Requirements:
1. Calculate a realistic match score between 0 and 100 based on candidate qualifications vs job expectations.
2. Generate 4-6 relevant technical interview questions with interview intention and model answers.
3. Generate 3-5 behavioral interview questions with answer guidance using the STAR method.
4. Identify missing skills and categorize their severity as low, medium, or high.
5. Create a practical 7-day interview preparation plan with actionable daily tasks.
6. Extract or generate an accurate job title for the position.
7. Base the report on the candidate's actual profile without fabricating experience.
`;

    let lastError = null;

    // Try candidate models in order of latency and availability to gracefully handle 503/429 spikes
    for (const model of CANDIDATE_MODELS) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: zodToJsonSchema(interviewReportSchema),
                },
            });

            const parsedText = cleanJsonText(response.text);
            const result = JSON.parse(parsedText);
            return interviewReportSchema.parse(result);
        } catch (error) {
            lastError = error;
            console.warn(`Model ${model} failed in generateInterviewReport (${error.message || error.status}). Trying next fallback...`);
        }
    }

    console.error("All candidate models failed for interview report generation:", lastError);
    throw lastError || new Error("Failed to generate interview report across all available models.");
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: "shell",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-first-run",
        ],
    });
    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "load" });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
        });
        return Buffer.from(pdfBuffer);
    } finally {
        await browser.close();
    }
}

async function genrateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumepdfSchema = z.object({
        html: z.string().describe("The complete HTML content of the resume with modern styling suitable for PDF conversion"),
    });

    const prompt = `Generate a modern, highly professional resume for a candidate with the following details:
Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription || "Not provided"}

The response MUST be a JSON object with a single field "html" containing clean, complete, standalone HTML (including <style> in head) formatted for an A4 page.
The resume must be tailored for the job description, highlight candidate strengths, use modern clean typography, standard margins, and clear section dividers (Experience, Skills, Projects, Education).
It must be ATS-friendly and concise (1-2 pages).`;

    let lastError = null;

    for (const model of CANDIDATE_MODELS) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: zodToJsonSchema(resumepdfSchema),
                },
            });

            const parsedText = cleanJsonText(response.text);
            const jsonContent = JSON.parse(parsedText);
            const html = jsonContent.html || jsonContent.resumehtml;

            if (!html || typeof html !== "string") {
                throw new Error("Invalid HTML returned by AI for resume PDF.");
            }

            const pdfBuffer = await generatePdfFromHtml(html);
            return Buffer.from(pdfBuffer);
        } catch (error) {
            lastError = error;
            console.warn(`Model ${model} failed in genrateResumePdf (${error.message || error.status}). Trying fallback...`);
        }
    }

    console.error("All models failed for resume PDF generation:", lastError);
    throw lastError || new Error("Failed to generate resume PDF across all available models.");
}

/**
 * Builds an elegant, printable HTML document for the Interview Preparation Report.
 */
function buildInterviewReportHtml(report) {
    const title = report.title || "Target Role";
    const score = typeof report.matchScore === "number" ? report.matchScore : 75;
    const dateStr = new Date(report.createdAt || Date.now()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const techQuestionsHtml = (report.technicalQuestions || [])
        .map(
            (q, idx) => `
        <div class="card">
            <div class="q-title">Q${idx + 1}. ${escapeHtml(q.question)}</div>
            <div class="q-meta"><strong>Interviewer Intention:</strong> ${escapeHtml(q.intention)}</div>
            <div class="q-ans"><strong>Model Answer:</strong><br>${escapeHtml(q.answer)}</div>
        </div>
    `
        )
        .join("");

    const behavQuestionsHtml = (report.behavioralQuestions || [])
        .map(
            (q, idx) => `
        <div class="card">
            <div class="q-title">Q${idx + 1}. ${escapeHtml(q.question)}</div>
            <div class="q-meta"><strong>Assessment Focus:</strong> ${escapeHtml(q.intention)}</div>
            <div class="q-ans"><strong>STAR Framework Guidance:</strong><br>${escapeHtml(q.answer)}</div>
        </div>
    `
        )
        .join("");

    const skillGapsHtml = (report.skillGaps || [])
        .map((gap) => {
            const sev = (gap.severity || "medium").toLowerCase();
            const badgeClass =
                sev === "high" ? "badge-high" : sev === "medium" ? "badge-med" : "badge-low";
            return `
        <div class="skill-item">
            <span class="skill-name">${escapeHtml(gap.skill)}</span>
            <span class="badge ${badgeClass}">${sev.toUpperCase()} PRIORITY</span>
        </div>
        `;
        })
        .join("");

    const roadmapHtml = (report.preparationPlan || [])
        .map(
            (day) => `
        <div class="day-block">
            <div class="day-header">
                <span class="day-badge">Day ${day.day}</span>
                <span class="day-focus">${escapeHtml(day.focus)}</span>
            </div>
            <ul class="task-list">
                ${(day.tasks || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("")}
            </ul>
        </div>
    `
        )
        .join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SkillSync Interview Report - ${escapeHtml(title)}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            background: #ffffff;
            margin: 0;
            padding: 0;
            line-height: 1.5;
            font-size: 13px;
        }
        .header {
            border-bottom: 3px solid #FF7A30;
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .brand {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.5px;
        }
        .brand span { color: #FF7A30; }
        .role-title {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 4px;
        }
        .date {
            font-size: 11px;
            color: #64748b;
        }
        .score-box {
            text-align: right;
            border: 2px solid #FF7A30;
            background: #fff7ed;
            padding: 8px 16px;
            border-radius: 12px;
        }
        .score-val {
            font-size: 26px;
            font-weight: 800;
            color: #FF7A30;
            line-height: 1;
        }
        .score-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 700;
            color: #9a3412;
            letter-spacing: 0.5px;
        }
        h2 {
            font-size: 15px;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 3px solid #FF7A30;
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
        .q-title {
            font-weight: 700;
            color: #0f172a;
            font-size: 13px;
            margin-bottom: 4px;
        }
        .q-meta {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 6px;
        }
        .q-ans {
            font-size: 12px;
            color: #334155;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 8px 10px;
            border-radius: 6px;
            line-height: 1.45;
        }
        .skill-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 12px;
        }
        .skill-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            border-radius: 6px;
        }
        .skill-name { font-weight: 600; color: #1e293b; }
        .badge {
            font-size: 9px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
        }
        .badge-high { background: #fee2e2; color: #991b1b; }
        .badge-med { background: #fef3c7; color: #92400e; }
        .badge-low { background: #dcfce7; color: #166534; }
        .day-block {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 8px;
            page-break-inside: avoid;
        }
        .day-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
        }
        .day-badge {
            background: #FF7A30;
            color: #ffffff;
            font-weight: 700;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 4px;
        }
        .day-focus {
            font-weight: 700;
            color: #0f172a;
            font-size: 12px;
        }
        .task-list {
            margin: 0;
            padding-left: 20px;
            color: #475569;
            font-size: 12px;
        }
        .footer {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="brand">Skill<span>Sync</span> &bull; Career Intelligence</div>
            <div class="role-title">${escapeHtml(title)}</div>
            <div class="date">Generated on ${dateStr}</div>
        </div>
        <div class="score-box">
            <div class="score-val">${score}%</div>
            <div class="score-label">Match Score</div>
        </div>
    </div>

    <h2>Identified Skill Gaps & Focus Areas</h2>
    <div class="skill-grid">
        ${skillGapsHtml || "<p>No critical skill gaps identified.</p>"}
    </div>

    <h2>Technical Interview Questions & Answers</h2>
    ${techQuestionsHtml || "<p>No technical questions available.</p>"}

    <h2>Behavioral Interview Scenarios & Guidance</h2>
    ${behavQuestionsHtml || "<p>No behavioral questions available.</p>"}

    <h2>7-Day Personalized Preparation Roadmap</h2>
    ${roadmapHtml || "<p>No preparation plan available.</p>"}

    <div class="footer">
        SkillSync &mdash; Align your skills. Own your future. &bull; Generated by SkillSync AI
    </div>
</body>
</html>
    `;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function generateReportPdf(interviewReport) {
    const htmlContent = buildInterviewReportHtml(interviewReport);
    return await generatePdfFromHtml(htmlContent);
}

module.exports = {
    generateInterviewReport,
    genrateResumePdf,
    generateReportPdf,
    generatePdfFromHtml,
};
