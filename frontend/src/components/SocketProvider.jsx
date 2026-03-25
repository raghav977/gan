import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectToken } from '../store/slices/authSlice';
import { connectSocket, disconnectSocket } from '../services/socket.service';

const SocketProvider = ({ children }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const token = useSelector(selectToken);

    useEffect(() => {
        if (isAuthenticated && token) {
            connectSocket(token);
        } else {
            disconnectSocket();
        }

        return () => {
            disconnectSocket();
        };
    }, [isAuthenticated, token]);

    return <>{children}</>;
};

export default SocketProvider;
