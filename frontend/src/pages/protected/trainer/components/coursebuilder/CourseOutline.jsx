import React, { useState } from "react";

export default function CourseOutline({
  sections,
  selected,
  setSelected,
  addSection,
  addLecture,
  onReorderSections,
  onReorderLectures,
}) {
  const [draggedSection, setDraggedSection] = useState(null);
  const [draggedLecture, setDraggedLecture] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);
  const [dragOverLecture, setDragOverLecture] = useState(null);

  // Section drag handlers
  const handleSectionDragStart = (e, section) => {
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSectionDragOver = (e, section) => {
    e.preventDefault();
    if (draggedSection && draggedSection.id !== section.id) {
      setDragOverSection(section.id);
    }
  };

  const handleSectionDragLeave = () => {
    setDragOverSection(null);
  };

  const handleSectionDrop = (e, targetSection) => {
    e.preventDefault();
    if (!draggedSection || draggedSection.id === targetSection.id) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    const newSections = [...sections];
    const draggedIndex = newSections.findIndex((s) => s.id === draggedSection.id);
    const targetIndex = newSections.findIndex((s) => s.id === targetSection.id);

    newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);

    onReorderSections(newSections);
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const handleSectionDragEnd = () => {
    setDraggedSection(null);
    setDragOverSection(null);
  };

  // Lecture drag handlers
  const handleLectureDragStart = (e, sectionId, lecture) => {
    setDraggedLecture({ sectionId, lecture });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleLectureDragOver = (e, sectionId, lecture) => {
    e.preventDefault();
    if (
      draggedLecture &&
      draggedLecture.sectionId === sectionId &&
      draggedLecture.lecture.id !== lecture.id
    ) {
      setDragOverLecture(lecture.id);
    }
  };

  const handleLectureDragLeave = () => {
    setDragOverLecture(null);
  };

  const handleLectureDrop = (e, sectionId, targetLecture) => {
    e.preventDefault();
    if (
      !draggedLecture ||
      draggedLecture.sectionId !== sectionId ||
      draggedLecture.lecture.id === targetLecture.id
    ) {
      setDraggedLecture(null);
      setDragOverLecture(null);
      return;
    }

    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newLectures = [...section.lectures];
    const draggedIndex = newLectures.findIndex(
      (l) => l.id === draggedLecture.lecture.id
    );
    const targetIndex = newLectures.findIndex((l) => l.id === targetLecture.id);

    newLectures.splice(draggedIndex, 1);
    newLectures.splice(targetIndex, 0, draggedLecture.lecture);

    onReorderLectures(sectionId, newLectures);
    setDraggedLecture(null);
    setDragOverLecture(null);
  };

  const handleLectureDragEnd = () => {
    setDraggedLecture(null);
    setDragOverLecture(null);
  };

  return (
    <div className="w-96 p-4 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Course Outline</h2>
        <button
          onClick={addSection}
          className="px-3 py-1.5 bg-yellow-400 rounded-md text-sm hover:bg-yellow-500 transition-colors"
        >
          + Add Section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No sections yet</p>
          <p className="text-sm">Click "Add Section" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`border p-3 rounded-lg cursor-move transition-all ${
                dragOverSection === section.id
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200"
              } ${
                selected.sectionId === section.id && !selected.lectureId
                  ? "ring-2 ring-yellow-400"
                  : ""
              }`}
              draggable
              onDragStart={(e) => handleSectionDragStart(e, section)}
              onDragOver={(e) => handleSectionDragOver(e, section)}
              onDragLeave={handleSectionDragLeave}
              onDrop={(e) => handleSectionDrop(e, section)}
              onDragEnd={handleSectionDragEnd}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400 cursor-grab">⋮⋮</span>
                <button
                  onClick={() =>
                    setSelected({ sectionId: section.id, lectureId: null })
                  }
                  className={`font-medium text-sm flex-1 text-left ${
                    selected.sectionId === section.id
                      ? "text-yellow-700"
                      : "text-gray-700"
                  }`}
                >
                  {section.title}
                </button>
                {section.published && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Published
                  </span>
                )}
              </div>

              <div className="pl-6 mt-2 space-y-1">
                {section.lectures.map((lec) => (
                  <div
                    key={lec.id}
                    className={`flex items-center gap-2 p-1 rounded cursor-move transition-all ${
                      dragOverLecture === lec.id
                        ? "bg-yellow-100"
                        : selected.lectureId === lec.id
                        ? "bg-yellow-50"
                        : "hover:bg-gray-50"
                    }`}
                    draggable
                    onDragStart={(e) =>
                      handleLectureDragStart(e, section.id, lec)
                    }
                    onDragOver={(e) => handleLectureDragOver(e, section.id, lec)}
                    onDragLeave={handleLectureDragLeave}
                    onDrop={(e) => handleLectureDrop(e, section.id, lec)}
                    onDragEnd={handleLectureDragEnd}
                  >
                    <span className="text-gray-300 text-xs cursor-grab">⋮</span>
                    <button
                      onClick={() =>
                        setSelected({ sectionId: section.id, lectureId: lec.id })
                      }
                      className={`text-xs text-left flex-1 ${
                        selected.lectureId === lec.id
                          ? "text-yellow-700 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {lec.title}
                    </button>
                    {lec.videoUrl && (
                      <span className="text-xs text-blue-500">🎥</span>
                    )}
                    {lec.resourceUrl && (
                      <span className="text-xs text-green-500">📎</span>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => addLecture(section.id)}
                  className="text-xs text-blue-600 mt-1 hover:text-blue-800"
                >
                  + Add Lecture
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
