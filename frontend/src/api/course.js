import trainerApi from "./interceptor";

export const createCourse = async (formData) => {
  try {
    const response = await trainerApi.post("/courses/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (err) {
    const message =
      err.response?.data?.message || "Failed to create course";
    console.error("Create course error:", message);
    throw new Error(message);
  }
};


export const getTrainerCourses = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  try {
    const response = await trainerApi.get("/courses/all", {
      params: { page, limit, search, status },
    });
    console.log("This is response",response);

    return response.data;
  } catch (err) {
    const message =
      err.response?.data?.message || "Failed to fetch courses";
    console.error("Get courses error:", message);
    throw new Error(message);
  }
};

// Get single course with weeks and lectures
export const getCourseDetail = async (courseId) => {
  try {
    const response = await trainerApi.get(`/courses/${courseId}`);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to fetch course details";
    console.error("Get course detail error:", message);
    throw new Error(message);
  }
};

// Update course status (draft, published, archived)
export const updateCourseStatus = async (courseId, status) => {
  try {
    const response = await trainerApi.put(`/courses/${courseId}/status`, { status });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to update course status";
    console.error("Update course status error:", message);
    throw new Error(message);
  }
};

// Week APIs
export const createWeek = async (courseId, data) => {
  try {
    const response = await trainerApi.post(`/courses/${courseId}/weeks`, data);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to create week";
    console.error("Create week error:", message);
    throw new Error(message);
  }
};

export const updateWeek = async (weekId, data) => {
  try {
    const response = await trainerApi.put(`/courses/weeks/${weekId}`, data);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to update week";
    console.error("Update week error:", message);
    throw new Error(message);
  }
};

export const deleteWeek = async (weekId) => {
  try {
    const response = await trainerApi.delete(`/courses/weeks/${weekId}`);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to delete week";
    console.error("Delete week error:", message);
    throw new Error(message);
  }
};

export const reorderWeeks = async (courseId, weekOrders) => {
  try {
    const response = await trainerApi.put(`/courses/${courseId}/weeks/reorder`, { weekOrders });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to reorder weeks";
    console.error("Reorder weeks error:", message);
    throw new Error(message);
  }
};

// Lecture APIs
export const createLecture = async (weekId, data) => {
  try {
    console.log("API createLecture - weekId:", weekId, "data:", data);
    const response = await trainerApi.post(`/courses/weeks/${weekId}/lectures`, data);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to create lecture";
    console.error("Create lecture error:", message);
    throw new Error(message);
  }
};

export const updateLecture = async (lectureId, data) => {
  try {
    const response = await trainerApi.put(`/courses/lectures/${lectureId}`, data);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to update lecture";
    console.error("Update lecture error:", message);
    throw new Error(message);
  }
};

export const deleteLecture = async (lectureId) => {
  try {
    const response = await trainerApi.delete(`/courses/lectures/${lectureId}`);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to delete lecture";
    console.error("Delete lecture error:", message);
    throw new Error(message);
  }
};

export const reorderLectures = async (weekId, lectureOrders) => {
  try {
    const response = await trainerApi.put(`/courses/weeks/${weekId}/lectures/reorder`, { lectureOrders });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to reorder lectures";
    console.error("Reorder lectures error:", message);
    throw new Error(message);
  }
};

// Upload video for lecture
export const uploadLectureVideo = async (lectureId, videoFile) => {
  try {
    const formData = new FormData();
    formData.append("video", videoFile);
    
    const response = await trainerApi.post(`/course/lecture/upload/${lectureId}/video`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to upload video";
    console.error("Upload video error:", message);
    throw new Error(message);
  }
};

// Upload resource for lecture
export const uploadLectureResource = async (lectureId, resourceFile) => {
  try {
    const formData = new FormData();
    formData.append("resource", resourceFile);
    
    const response = await trainerApi.post(`/course/lecture/upload/${lectureId}/resource`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to upload resource";
    console.error("Upload resource error:", message);
    throw new Error(message);
  }
};




