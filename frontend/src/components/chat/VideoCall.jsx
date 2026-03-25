import React, { useEffect, useRef, useState } from "react";

/*
  VideoCall (mock)
  - Requests local media (audio/video depending on type)
  - Shows local preview and a mocked remote (mirrored) preview to simulate a call.
  - Provides mute / camera toggle and end call.
  - NOTE: This is a local mock: to make real calls you'd need signaling & remote peer management.
*/

export default function VideoCall({ type = "video", trainer, onClose }) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const localStreamRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const constraints = type === "video" ? { video: true, audio: true } : { audio: true };
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = s;
        if (localRef.current) localRef.current.srcObject = s;

        // Mock remote by reusing same stream (simulate remote feed) after small delay
        setTimeout(() => {
          if (!mounted) return;
          if (remoteRef.current) {
            // clone tracks to simulate remote peer (not actual peer-to-peer)
            const cloned = s.clone();
            remoteRef.current.srcObject = cloned;
          }
        }, 500);
      } catch (err) {
        console.error("media error", err);
      }
    };

    start();

    return () => {
      mounted = false;
      // stop tracks
      try {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
    };
  }, [type]);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((m) => !m);
  };

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOff((c) => !c);
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={endCall}></div>

      <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-semibold">{trainer?.username}</div>
            <div className="text-xs text-slate-500">Live {type} call</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="px-3 py-1 rounded bg-slate-100 text-sm">
              {muted ? "Unmute" : "Mute"}
            </button>
            {type === "video" && (
              <button onClick={toggleCamera} className="px-3 py-1 rounded bg-slate-100 text-sm">
                {cameraOff ? "Enable Camera" : "Disable Camera"}
              </button>
            )}
            <button onClick={endCall} className="px-3 py-1 rounded bg-red-600 text-white">End</button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 rounded overflow-hidden h-80 flex items-center justify-center">
            <video ref={localRef} autoPlay muted className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-black/30 text-white text-xs px-2 py-1 rounded">{type === "video" ? "You" : "Microphone"}</div>
          </div>

          <div className="bg-slate-800 rounded overflow-hidden h-80 flex items-center justify-center">
            <video ref={remoteRef} autoPlay className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-black/30 text-white text-xs px-2 py-1 rounded">Trainer</div>
          </div>
        </div>
      </div>
    </div>
  );
}