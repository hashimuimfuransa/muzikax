import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ChartUpdate {
  type: string;
  data: any;
  timestamp: Date;
}

export const useWebSocket = (chartType: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState<ChartUpdate | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    if (!chartType) return;

    console.log('🔌 Initializing WebSocket connection...');
    
    const socketIo = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketIo.on('connect', () => {
      console.log('✅ WebSocket connected!', socketIo.id);
      setIsConnected(true);
      setConnectionAttempts(0);
      
      // Join the chart room
      socketIo.emit('join-charts', chartType);
    });

    socketIo.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socketIo.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error.message);
      setConnectionAttempts(prev => prev + 1);
    });

    socketIo.on('chart-updated', (data: ChartUpdate) => {
      console.log('📡 Chart update received:', data);
      setLatestUpdate({
        ...data,
        timestamp: new Date(data.timestamp),
      });
    });

    setSocket(socketIo);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      if (socketIo) {
        socketIo.disconnect();
      }
    };
  }, [chartType]);

  const broadcastUpdate = (type: string, data: any) => {
    if (socket) {
      socket.emit('chart-update', { type, data });
    }
  };

  return {
    socket,
    isConnected,
    latestUpdate,
    connectionAttempts,
    broadcastUpdate,
  };
};
