import { API } from "./api";

export const assessmentApi = {
  getQuestions: (type) => API.get(`/v1/assessments/questions/${type}`),
  submit: (type, answers) => API.post(`/v1/assessments/${type}`, { answers }),
  getHistory: (params) => API.get("/v1/assessments", { params }),
  getProgress: (type, params) => API.get(`/v1/assessments/progress/${type}`, { params })
};
