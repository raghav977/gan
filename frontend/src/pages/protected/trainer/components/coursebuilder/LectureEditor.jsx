import React, { useState, useEffect, useRef } from "react";
import { useEffectEvent } from "react";

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

export default function LectureEditor({
  selectedLecture,
  sectionId,
  lectureId,
  updateLecture,
  deleteLecture,
  onUploadVideo,
  onUploadResource,
}) {
  const [localTitle, setLocalTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  
  const videoInputRef = useRef(null);
  const resourceInputRef = useRef(null);

  // Sync local state with selected lecture
  useEffect(() => {
    if (selectedLecture) {
      setLocalTitle(selectedLecture.title || "");
    }
  }, [selectedLecture?.id]);

  const debouncedTitle = useDebounce(localTitle, 500);

  // Save title changes when debounced value changes
  useEffect(() => {
    if (
      selectedLecture &&
      debouncedTitle !== selectedLecture.title &&
      debouncedTitle.trim()
    ) {
      updateLecture(sectionId, lectureId, { title: debouncedTitle });
    }
  }, [debouncedTitle]);

  useEffect(()=>{
    console.log("This is selected lecture ",selectedLecture);
  },[selectedLecture])

  const handleDelete = () => {
    if (confirmDelete) {
      deleteLecture(sectionId, lectureId);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleTogglePublish = () => {
    updateLecture(sectionId, lectureId, {
      published: !selectedLecture.published,
    });
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      await onUploadVideo(sectionId, lectureId, file);
    } catch (err) {
      console.error("Video upload failed:", err);
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    }
  };

  const handleResourceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResource(true);
    try {
      await onUploadResource(sectionId, lectureId, file);
    } catch (err) {
      console.error("Resource upload failed:", err);
    } finally {
      setUploadingResource(false);
      if (resourceInputRef.current) {
        resourceInputRef.current.value = "";
      }
    }
  };

  if (!selectedLecture) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg">No lecture selected</p>
          <p className="text-sm mt-1">Select a lecture to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Lecture Editor</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selectedLecture.published || false}
            onChange={handleTogglePublish}
            className="rounded"
          />
          <span>Published</span>
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lecture Title
          </label>
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Enter lecture title..."
            className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video
          </label>
          {selectedLecture.videoUrl ? (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
              <span className="text-blue-600">🎥</span>
              <span className="text-sm text-blue-700 flex-1 truncate">
                Video uploaded
              </span>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Replace
              </button>
            </div>
          ) : (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-yellow-400 transition-colors"
            >
              {uploadingVideo ? (
                <span className="text-gray-500">Uploading...</span>
              ) : (
                <>
                  <span className="text-2xl">🎥</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Click to upload video
                  </p>
                </>
              )}
            </div>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
            disabled={uploadingVideo}
          />
        </div>

        {/* Resource Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource File
          </label>
          {selectedLecture.resourceUrl ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md">
              <span className="text-green-600">📎</span>
              <span className="text-sm text-green-700 flex-1 truncate">
                Resource uploaded
              </span>
              <button
                onClick={() => resourceInputRef.current?.click()}
                className="text-xs text-green-600 hover:text-green-800"
              >
                Replace
              </button>
            </div>
          ) : (
            <div
              onClick={() => resourceInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-yellow-400 transition-colors"
            >
              {uploadingResource ? (
                <span className="text-gray-500">Uploading...</span>
              ) : (
                <>
                  <span className="text-2xl">📎</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Click to upload resource (PDF, ZIP)
                  </p>
                </>
              )}
            </div>
          )}
          <input
            ref={resourceInputRef}
            type="file"
            accept=".pdf,.zip,application/pdf,application/zip"
            onChange={handleResourceUpload}
            className="hidden"
            disabled={uploadingResource}
          />
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            confirmDelete
              ? "bg-red-600 text-white"
              : "text-red-600 border border-red-300 hover:bg-red-50"
          }`}
        >
          {confirmDelete ? "Click again to confirm" : "Delete Lecture"}
        </button>
      </div>
    </div>
  );
}
