
const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewRouter = express.Router();
const upload = require("../middlewares/file.middleware");
const interviewController = require("../controller/interview.controller");

/**
 * @route POST /api/interview/
 * @description Generate a new interview report based on the user's self-description, resume PDF, and job description
 * @access Private
 */
interviewRouter.post("/",
    authMiddleware.authUser,
    upload.single("resume"),
    interviewController.genrateInterviewReportController
);
/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private 
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController);
/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController);

/**
 * @routes GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description , resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, upload.single("resume"), interviewController.generateResumePdfController);
interviewRouter.get("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController);


/**
 * @route DELETE /api/interview/:interviewId
 * @description Delete an interview report by interviewId.
 * @access private
 */
interviewRouter.delete("/:interviewId", authMiddleware.authUser, interviewController.deleteInterviewReportController);
interviewRouter.delete("/report/:interviewId", authMiddleware.authUser, interviewController.deleteInterviewReportController);

module.exports = interviewRouter;

