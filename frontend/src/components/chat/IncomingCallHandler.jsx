import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    selectIncomingCall,
    selectCallAccepted,
    resetCall
} from "../../store/slices/chatSlice";
import { rejectCall } from "../../services/socket.service";
import VideoCallModal from "./VideoCallModal";

const IncomingCallHandler = () => {
    const dispatch = useDispatch();
    const incomingCall = useSelector(selectIncomingCall);
    const callAccepted = useSelector(selectCallAccepted);

    const handleReject = () => {
        if (incomingCall) {
            rejectCall(incomingCall.from);
        }
        dispatch(resetCall());
    };

    // Show incoming call UI
    if (incomingCall && !callAccepted) {
        return (
            <VideoCallModal
                trainer={{
                    userId: incomingCall.from,
                    username: incomingCall.callerName
                }}
                callType={incomingCall.callType || "video"}
                onClose={handleReject}
                isIncoming={true}
            />
        );
    }

    return null;
};

export default IncomingCallHandler;
