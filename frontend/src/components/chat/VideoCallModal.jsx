import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    MdCall,
    MdCallEnd,
    MdMic,
    MdMicOff,
    MdVideocam,
    MdVideocamOff
} from "react-icons/md";
import { selectUser } from "../../store/slices/authSlice";
import {
    selectIncomingCall,
    selectCallAccepted,
    selectCallEnded,
    setCallAccepted,
    resetCall
} from "../../store/slices/chatSlice";
import {
    callUser,
    answerCall,
    endCall as socketEndCall,
    getSocket,
    sendIceCandidate
} from "../../services/socket.service";

// ICE servers for WebRTC
const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ]
};

const VideoCallModal = ({ trainer, callType = "video", onClose, isIncoming = false }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const incomingCall = useSelector(selectIncomingCall);
    const callAccepted = useSelector(selectCallAccepted);
    const callEnded = useSelector(selectCallEnded);

    const [stream, setStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [calling, setCalling] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("connecting");

    const myVideoRef = useRef(null);
    const peerVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const streamRef = useRef(null);
    const iceCandidatesQueue = useRef([]);

    // Create RTCPeerConnection
    const createPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const targetUserId = trainer?.userId || incomingCall?.from;
                if (targetUserId) {
                    sendIceCandidate(targetUserId, event.candidate);
                }
            }
        };

        pc.ontrack = (event) => {
            if (peerVideoRef.current && event.streams[0]) {
                peerVideoRef.current.srcObject = event.streams[0];
                setConnectionStatus("connected");
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "connected") {
                setConnectionStatus("connected");
            } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
                setConnectionStatus("error");
            }
        };

        return pc;
    }, [trainer?.userId, incomingCall?.from]);

    // Get media stream
    useEffect(() => {
        const getMedia = async () => {
            try {
                const constraints =
                    callType === "video"
                        ? { video: true, audio: true }
                        : { audio: true, video: false };

                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                setStream(mediaStream);
                streamRef.current = mediaStream;

                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error getting media:", err);
                setConnectionStatus("error");
            }
        };

        getMedia();

        return () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, [callType]);

    // Setup socket event listeners for WebRTC signaling
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        // Handle incoming ICE candidates
        const handleIceCandidate = async ({ candidate }) => {
            try {
                if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } else {
                    iceCandidatesQueue.current.push(candidate);
                }
            } catch (err) {
                console.error("Error adding ICE candidate:", err);
            }
        };

        // Handle call accepted (for caller)
        const handleCallAccepted = async ({ signal }) => {
            try {
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
                    dispatch(setCallAccepted(true));
                    setConnectionStatus("connected");

                    // Process queued ICE candidates
                    while (iceCandidatesQueue.current.length > 0) {
                        const candidate = iceCandidatesQueue.current.shift();
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                }
            } catch (err) {
                console.error("Error setting remote description:", err);
            }
        };

        socket.on("ice-candidate", handleIceCandidate);
        socket.on("call-accepted", handleCallAccepted);

        return () => {
            socket.off("ice-candidate", handleIceCandidate);
            socket.off("call-accepted", handleCallAccepted);
        };
    }, [dispatch]);

    // Start outgoing call
    const initiateCall = useCallback(async () => {
        if (!stream || !trainer?.userId) return;

        setCalling(true);
        setConnectionStatus("calling");

        try {
            const pc = createPeerConnection();
            peerConnectionRef.current = pc;

            // Add local stream tracks to peer connection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Send offer via socket
            callUser(trainer.userId, offer, user?.username || "User", callType);
        } catch (err) {
            console.error("Error initiating call:", err);
            setConnectionStatus("error");
        }
    }, [stream, trainer?.userId, user?.username, callType, createPeerConnection]);

    // Answer incoming call
    const handleAnswerCall = useCallback(async () => {
        if (!stream || !incomingCall) return;

        dispatch(setCallAccepted(true));
        setConnectionStatus("connecting");

        try {
            const pc = createPeerConnection();
            peerConnectionRef.current = pc;

            // Add local stream tracks to peer connection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Set remote description from incoming offer
            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));

            // Process queued ICE candidates
            while (iceCandidatesQueue.current.length > 0) {
                const candidate = iceCandidatesQueue.current.shift();
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }

            // Create answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Send answer via socket
            answerCall(incomingCall.from, answer);
        } catch (err) {
            console.error("Error answering call:", err);
            setConnectionStatus("error");
        }
    }, [stream, incomingCall, dispatch, createPeerConnection]);

    // Auto-initiate call for outgoing calls
    useEffect(() => {
        if (!isIncoming && stream && !calling) {
            initiateCall();
        }
    }, [isIncoming, stream, calling, initiateCall]);

    // Handle call ended
    useEffect(() => {
        if (callEnded) {
            handleEndCall();
        }
    }, [callEnded]);

    // End call
    const handleEndCall = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        
        if (trainer?.userId) {
            socketEndCall(trainer.userId);
        }
        
        dispatch(resetCall());
        onClose();
    };

    // Toggle mute
    const toggleMute = () => {
        streamRef.current?.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });
        setIsMuted(!isMuted);
    };

    // Toggle camera
    const toggleCamera = () => {
        streamRef.current?.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });
        setIsCameraOff(!isCameraOff);
    };

    // Incoming call UI
    if (isIncoming && incomingCall && !callAccepted) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
                <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-yellow-600">
                            {incomingCall.callerName?.[0]?.toUpperCase() || "?"}
                        </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                        {incomingCall.callerName || "Someone"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Incoming {incomingCall.callType || "video"} call...
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleEndCall}
                            className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            <MdCallEnd size={28} />
                        </button>
                        <button
                            onClick={handleAnswerCall}
                            className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 animate-pulse"
                        >
                            <MdCall size={28} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
            {/* Connection status */}
            {connectionStatus !== "connected" && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                    {connectionStatus === "calling" && "Calling..."}
                    {connectionStatus === "connecting" && "Connecting..."}
                    {connectionStatus === "error" && "Connection error"}
                </div>
            )}

            {/* Videos container */}
            <div className="relative w-full h-full">
                {/* Remote video (large) */}
                <video
                    ref={peerVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Local video (small) */}
                <div className="absolute top-4 right-4 w-40 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-white">
                    <video
                        ref={myVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Trainer name */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
                    <p className="font-semibold">{trainer?.username || "Trainer"}</p>
                </div>

                {/* Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition ${
                            isMuted ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        {isMuted ? (
                            <MdMicOff size={24} className="text-white" />
                        ) : (
                            <MdMic size={24} className="text-white" />
                        )}
                    </button>

                    {callType === "video" && (
                        <button
                            onClick={toggleCamera}
                            className={`p-4 rounded-full transition ${
                                isCameraOff ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        >
                            {isCameraOff ? (
                                <MdVideocamOff size={24} className="text-white" />
                            ) : (
                                <MdVideocam size={24} className="text-white" />
                            )}
                        </button>
                    )}

                    <button
                        onClick={handleEndCall}
                        className="p-4 bg-red-500 rounded-full hover:bg-red-600 transition"
                    >
                        <MdCallEnd size={24} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallModal;
