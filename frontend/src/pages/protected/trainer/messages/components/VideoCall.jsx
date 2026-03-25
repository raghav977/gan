import React, { useEffect, useRef, useState } from "react";

export default function VideoCall({ type = "video", trainer = { name: "Partner" }, onClose }) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const streamRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const startMedia = async () => {
      try {
        const constraints = type === "video" ? { video: true, audio: true } : { audio: true };
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = s;
        if (localRef.current) localRef.current.srcObject = s;

        // simulate remote by cloning stream after short delay
        setTimeout(() => {
          if (!mounted) return;
          try {
            const cloned = s.clone();
            if (remoteRef.current) remoteRef.current.srcObject = cloned;
          } catch (err) {
            console.warn("Could not clone stream for mock remote", err);
          }
        }, 400);

        setStarted(true);
        // start timer
        timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
      } catch (err) {
        console.error("Could not get user media", err);
        // close if media not available
        onClose?.();
      }
    };

    startMedia();

    return () => {
      mounted = false;
      clearInterval(timerRef.current);
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
    };
  }, [type, onClose]);

  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((m) => !m);
  };

  const toggleCamera = () => {
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOff((c) => !c);
  };

  const endCall = () => {
    clearInterval(timerRef.current);
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    onClose?.();
  };

  const fmtTime = (s) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={endCall} />

      <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-3">
            <div className="font-semibold">{trainer?.name || "Call"}</div>
            <div className="text-xs text-slate-500">{type === "video" ? "Video call" : "Audio call"}</div>
            {started && <div className="ml-3 text-xs text-slate-400">• {fmtTime(timer)}</div>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="px-3 py-1 rounded-md bg-slate-100 text-sm hover:bg-slate-200"
              aria-pressed={muted}
            >
              {muted ? "Unmute" : "Mute"}
            </button>

            {type === "video" && (
              <button
                onClick={toggleCamera}
                className="px-3 py-1 rounded-md bg-slate-100 text-sm hover:bg-slate-200"
                aria-pressed={cameraOff}
              >
                {cameraOff ? "Enable Camera" : "Disable Camera"}
              </button>
            )}

            <button onClick={endCall} className="px-3 py-1 rounded-md bg-red-600 text-white">
              End
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative bg-black rounded-lg h-72 flex items-center justify-center overflow-hidden">
            {type === "video" ? (
              <video ref={localRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="text-white text-center">
                <div className="text-2xl">🎧</div>
                <div className="mt-2 text-sm">You</div>
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded">
              You
            </div>
          </div>

          <div className="relative bg-black rounded-lg h-72 flex items-center justify-center overflow-hidden">
            {type === "video" ? (
              <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="text-white text-center">
                <div className="text-2xl">👤</div>
                <div className="mt-2 text-sm">Trainer</div>
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded">
              {trainer?.name || "Trainer"}
            </div>
          </div>
        </div>

        <div className="p-3 border-t text-right">
          <div className="text-xs text-slate-500">This is a local mock call. Integrate WebRTC/signaling for real calls.</div>
        </div>
      </div>
    </div>
  );
}