const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
    matchScore: z.number()
        .min(0)
        .max(100),

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
    ).describe("A day-wise prepration paln for the cnadidate to follow in order to prepare for the interview"),
    title:z.string().describe("The title of the job for which the interview report is generate"),
});

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    const prompt = `
Generate a detailed interview preparation report.

Candidate Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Requirements:
1. Calculate a realistic match score between 0 and 100.
2. Generate relevant technical interview questions with answers.
3. Generate behavioral interview questions with answer guidance.
4. Identify missing skills and their severity.
5. Create a practical 7-day interview preparation plan.
6. Base the report on the candidate's actual profile.
7. Do not invent qualifications or experience.
`;

    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-3.8-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: zodToJsonSchema(
                        interviewReportSchema
                    ),
                },
            });

            const result = JSON.parse(response.text);

            // Validate the AI-generated response.
            return interviewReportSchema.parse(result);

        } catch (error) {
            const status = error.status ?? error.code;
            const isTemporaryError =
                status === 503 ||
                status === 429 ||
                status === 500 ||
                status === "UNAVAILABLE" ||
                status === "RESOURCE_EXHAUSTED";

            if (!isTemporaryError || attempt === maxRetries - 1) {
                console.error("Interview report generation failed:", error);
                throw error;
            }

            const delay = 1000 * 2 ** attempt;

            await new Promise((resolve) => {
                setTimeout(resolve, delay);
            });
        }
    }
}

module.exports = generateInterviewReport;