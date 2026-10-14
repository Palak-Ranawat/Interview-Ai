const { PDFParse } = require("pdf-parse")
const generateInterviewReport = require("../services/ai.service")
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

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(res,req){
 const  interviewReports = await interviewReportModel.find({user:req.user.id})
}
module.exports = { genrateInterviewReportController }