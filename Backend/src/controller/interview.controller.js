const { PDFParse } = require("pdf-parse")
const {generateInterviewReport,genrateResumePdf} = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")



/**
 * @description Controller to generate interview report based on user self description , resume and job description.
 *  
 */
async function genrateInterviewReportController(req, res) {
    try {
        let resumeContent = ""
        if (req.file) {
            const parser = new PDFParse({ data: req.file.buffer })
            const parsedPdf = await parser.getText()
            resumeContent = parsedPdf.text
        }

        const { selfDescription, jobDescription } = req.body

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            interviewReport
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

/**
 * @description Controller to get all interview report by interviewId.
 */
async function getInterviewReportByIdController(req,res){
    const {interviewId} = req.params
    const interviewReport = await interviewReportModel.findOne({_id:interviewId,user:req.user.id})
    if(!interviewReport){
        return res.status(404).json({
            message:"Interview report not found."
        })
    }
    res.status(200).json({
        message:"Interview report fetched successfully.",
        interviewReport
    })
}

async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription");

        res.status(200).json({
            success: true,
            totalReports: interviewReports.length,
            interviewReports
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

/**
 * @description Controller to securely delete an interview report belonging to the logged-in user.
 */
async function deleteInterviewReportController(req, res) {
    try {
        const { interviewId } = req.params;
        const deletedReport = await interviewReportModel.findOneAndDelete({
            _id: interviewId,
            user: req.user.id
        });

        if (!deletedReport) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found or unauthorized."
            });
        }

        res.status(200).json({
            success: true,
            message: "Interview report deleted successfully."
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const pdfBuffer = await genrateResumePdf({
            resume: interviewReport.resume,
            selfDescription: interviewReport.selfDescription,
            jobDescription: interviewReport.jobDescription
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="resume-${interviewReportId}.pdf"`);
        return res.send(pdfBuffer);
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}
module.exports = {
    genrateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    deleteInterviewReportController,
    generateResumePdfController
};