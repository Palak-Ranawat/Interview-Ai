import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export async function generateInterviewReportApi({ resume, jobDescription, selfDescription }) {
  const formData = new FormData();
  if (resume) {
    formData.append("resume", resume);
  }
  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);

  const response = await api.post("/api/interview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

