
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
interviewRouter.get("/report/:interviewId",authMiddleware.authUser,interviewController.genrateInterviewReportController);
module.exports = interviewRouter;

