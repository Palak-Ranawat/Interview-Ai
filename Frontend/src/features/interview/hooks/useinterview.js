import {
    getAllInterviewReports,
    generateInterviewReportApi,
    getAllInterviewReportById,
    deleteInterviewReportApi,
    generateResumePdf
} from "../services/interview.api";
import { useContext } from "react";
import { InterviewContext } from "../interview.context";

const useInterview = () => {
    const context = useContext(InterviewContext);
    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }
    const { loading, setLoading, report, setReport, reports, setReports } = context;

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true);
        try {
            const response = await generateInterviewReportApi({ jobDescription, selfDescription, resume: resumeFile });
            if (response?.interviewReport) {
                setReport(response.interviewReport);
                setReports((prev) => [response.interviewReport, ...(Array.isArray(prev) ? prev : [])]);
            }
            return response?.interviewReport;
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getReportById = async (interviewId) => {
        setLoading(true);
        try {
            const response = await getAllInterviewReportById(interviewId);
            if (response?.interviewReport) {
                setReport(response.interviewReport);
            }
            return response?.interviewReport;
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getReports = async () => {
        setLoading(true);
        try {
            const response = await getAllInterviewReports();
            const list = Array.isArray(response?.interviewReports) ? response.interviewReports : [];
            setReports(list);
            return list;
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteReport = async (interviewId) => {
        setLoading(true);
        try {
            const response = await deleteInterviewReportApi(interviewId);
            setReports((prev) => (Array.isArray(prev) ? prev.filter((r) => r._id !== interviewId) : []));
            return response;
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getResumePdf = async (interviewReportId) => {
        setLoading(true);
        try {
            const response = await generateResumePdf({ interviewReportId });
            const blob = new Blob([response], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `resume_${interviewReportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            return true;
        } catch (error) {
            console.error("Failed to download resume PDF:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
        generateReport,
        getReportById,
        getReports,
        deleteReport,
        getResumePdf
    };
};

export default useInterview;
export { useInterview };
