import React, { useState, useEffect, useCallback } from "react";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SectionEditor({
  selectedSection,
  selectedSectionId,
  updateSection,
  deleteSection,
  addLecture,
  setSelected,
}) {
  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync local state with selected section
  useEffect(() => {
    if (selectedSection) {
      setLocalTitle(selectedSection.title || "");
      setLocalDescription(selectedSection.description || "");
    }
  }, [selectedSection?.id]);

  const debouncedTitle = useDebounce(localTitle, 500);
  const debouncedDescription = useDebounce(localDescription, 500);

  // Save changes when debounced values change
  useEffect(() => {
    if (
      selectedSection &&
      debouncedTitle !== selectedSection.title &&
      debouncedTitle.trim()
    ) {
      updateSection(selectedSectionId, { title: debouncedTitle });
    }
  }, [debouncedTitle]);

  useEffect(() => {
    if (
      selectedSection &&
      debouncedDescription !== selectedSection.description
    ) {
      updateSection(selectedSectionId, { description: debouncedDescription });
    }
  }, [debouncedDescription]);

  const handleDelete = () => {
    if (confirmDelete) {
      deleteSection(selectedSectionId);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleTogglePublish = () => {
    updateSection(selectedSectionId, { published: !selectedSection.published });
  };

  if (!selectedSection) {
    return (
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg">No section selected</p>
          <p className="text-sm mt-1">Select a section from the outline to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Section Editor</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selectedSection.published || false}
            onChange={handleTogglePublish}
            className="rounded"
          />
          <span>Published</span>
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title
          </label>
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Enter section title..."
            className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            placeholder="Enter section description..."
            rows={3}
            className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => addLecture(selectedSectionId)}
            className="px-4 py-2 bg-yellow-400 rounded-md text-sm font-medium hover:bg-yellow-500 transition-colors"
          >
            + Add Lecture
          </button>

          <button
            onClick={handleDelete}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              confirmDelete
                ? "bg-red-600 text-white"
                : "text-red-600 border border-red-300 hover:bg-red-50"
            }`}
          >
            {confirmDelete ? "Click again to confirm" : "Delete Section"}
          </button>
        </div>
      </div>

      {/* Lectures List */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Lectures ({selectedSection.lectures?.length || 0})
        </h4>
        {selectedSection.lectures?.length === 0 ? (
          <p className="text-sm text-gray-500">No lectures in this section yet</p>
        ) : (
          <div className="space-y-2">
            {selectedSection.lectures?.map((lec, index) => (
              <div
                key={lec.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">{index + 1}.</span>
                  <span className="text-sm font-medium">{lec.title}</span>
                  <div className="flex gap-1">
                    {lec.videoUrl && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Video
                      </span>
                    )}
                    {lec.resourceUrl && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Resource
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSelected({ sectionId: selectedSectionId, lectureId: lec.id })
                  }
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
