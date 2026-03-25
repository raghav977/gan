import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import CourseOutline from "./CourseOutline";
import SectionEditor from "./SectionEditor";
import LectureEditor from "./LectureEditor";
import {
  getCourseDetail,
  createWeek,
  updateWeek,
  deleteWeek,
  createLecture,
  updateLecture,
  deleteLecture,
  reorderWeeks,
  reorderLectures,
  uploadLectureVideo,
  uploadLectureResource,
} from "../../../../../api/course";

export default function CourseBuilder() {
  const { courseId } = useParams();
  const [sections, setSections] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState({
    sectionId: null,
    lectureId: null,
  });

  // Fetch course data
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      setError("");
      const course = await getCourseDetail(courseId);
      setCourseInfo(course);
      
      // Transform weeks to sections format
      const transformedSections = (course.weeks || [])
        .sort((a, b) => a.position - b.position)
        .map((week) => ({
          id: week.id,
          title: week.title,
          description: week.description || "",
          published: week.published,
          position: week.position,
          lectures: (week.materials || [])
            .sort((a, b) => a.position - b.position)
            .map((material) => ({
              id: material.id,
              title: material.title,
              videoUrl: material.videoUrl,
              resourceUrl: material.resourceUrl,
              published: material.published,
              position: material.position,
            })),
        }));
      
      setSections(transformedSections);
      
      if (transformedSections.length > 0 && !selected.sectionId) {
        setSelected({ sectionId: transformedSections[0].id, lectureId: null });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selected.sectionId) || null,
    [sections, selected.sectionId]
  );

  const selectedLecture = useMemo(() => {
    if (!selectedSection || !selected.lectureId) return null;
    return selectedSection.lectures.find((l) => l.id === selected.lectureId) || null;
  }, [selectedSection, selected.lectureId]);

  // Add section (week)
  const addSection = async () => {
    try {
      setSaving(true);
      const result = await createWeek(courseId, {
        title: "New Section",
        description: "",
      });
      
      const newSec = {
        id: result.week.id,
        title: result.week.title,
        description: result.week.description || "",
        published: result.week.published,
        position: result.week.position,
        lectures: [],
      };
      
      setSections((prev) => [...prev, newSec]);
      setSelected({ sectionId: newSec.id, lectureId: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update section
  const handleUpdateSection = async (sectionId, patch) => {
    try {
      setSaving(true);
      await updateWeek(sectionId, patch);
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, ...patch } : s))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete section
  const handleDeleteSection = async (sectionId) => {
    try {
      setSaving(true);
      await deleteWeek(sectionId);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      setSelected({ sectionId: null, lectureId: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add lecture
  const addLecture = async (sectionId) => {
    console.log("Adding lecture to section:", sectionId);
    if (!sectionId) {
      setError("Please select a section first");
      return;
    }
    try {
      setSaving(true);
      const result = await createLecture(sectionId, {
        title: "New Lecture",
      });
      console.log("Lecture created:", result);
      
      const newLec = {
        id: result.lecture.id,
        title: result.lecture.title,
        videoUrl: result.lecture.videoUrl,
        resourceUrl: result.lecture.resourceUrl,
        published: result.lecture.published,
        position: result.lecture.position,
      };
      
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, lectures: [...s.lectures, newLec] } : s
        )
      );
      setSelected({ sectionId, lectureId: newLec.id });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update lecture
  const handleUpdateLecture = async (sectionId, lectureId, patch) => {
    try {
      setSaving(true);
      await updateLecture(lectureId, patch);
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                lectures: s.lectures.map((l) =>
                  l.id === lectureId ? { ...l, ...patch } : l
                ),
              }
            : s
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete lecture
  const handleDeleteLecture = async (sectionId, lectureId) => {
    try {
      setSaving(true);
      await deleteLecture(lectureId);
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, lectures: s.lectures.filter((l) => l.id !== lectureId) }
            : s
        )
      );
      setSelected({ sectionId, lectureId: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reorder sections (weeks)
  const handleReorderSections = async (newSections) => {
    const weekOrders = newSections.map((s, index) => ({
      id: s.id,
      position: index + 1,
    }));

    // Optimistic update
    setSections(newSections.map((s, index) => ({ ...s, position: index + 1 })));

    try {
      await reorderWeeks(courseId, weekOrders);
    } catch (err) {
      setError(err.message);
      // Revert on error
      fetchCourseData();
    }
  };

  // Reorder lectures
  const handleReorderLectures = async (sectionId, newLectures) => {
    const lectureOrders = newLectures.map((l, index) => ({
      id: l.id,
      position: index + 1,
    }));

    // Optimistic update
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lectures: newLectures.map((l, index) => ({
                ...l,
                position: index + 1,
              })),
            }
          : s
      )
    );

    try {
      await reorderLectures(sectionId, lectureOrders);
    } catch (err) {
      setError(err.message);
      // Revert on error
      fetchCourseData();
    }
  };

  // Upload video
  const handleUploadVideo = async (sectionId, lectureId, file) => {
    try {
      setSaving(true);
      const result = await uploadLectureVideo(lectureId, file);
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                lectures: s.lectures.map((l) =>
                  l.id === lectureId ? { ...l, videoUrl: result.videoUrl } : l
                ),
              }
            : s
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Upload resource
  const handleUploadResource = async (sectionId, lectureId, file) => {
    try {
      setSaving(true);
      const result = await uploadLectureResource(lectureId, file);
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                lectures: s.lectures.map((l) =>
                  l.id === lectureId ? { ...l, resourceUrl: result.resourceUrl } : l
                ),
              }
            : s
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[80vh] bg-gray-50 items-center justify-center">
        <div className="text-gray-500">Loading course...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[80vh] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{courseInfo?.courseName || "Course Builder"}</h1>
          <p className="text-sm text-gray-500">Manage your course sections and lectures</p>
        </div>
        {saving && (
          <span className="text-sm text-yellow-600">Saving...</span>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-sm text-red-500 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-1">
        <CourseOutline
          sections={sections}
          selected={selected}
          setSelected={setSelected}
          addSection={addSection}
          addLecture={addLecture}
          onReorderSections={handleReorderSections}
          onReorderLectures={handleReorderLectures}
        />

        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <SectionEditor
            selectedSection={selectedSection}
            selectedSectionId={selected.sectionId}
            updateSection={handleUpdateSection}
            deleteSection={handleDeleteSection}
            addLecture={addLecture}
            setSelected={setSelected}
          />

          <LectureEditor
            selectedLecture={selectedLecture}
            sectionId={selected.sectionId}
            lectureId={selected.lectureId}
            updateLecture={handleUpdateLecture}
            deleteLecture={handleDeleteLecture}
            onUploadVideo={handleUploadVideo}
            onUploadResource={handleUploadResource}
          />
        </div>
      </div>
    </div>
  );
}
