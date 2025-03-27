import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from './use-toast';
import { Alert } from '@shared/schema';

type WebSocketContextType = {
  connected: boolean;
  alerts: Alert[];
  sendMessage: (type: string, data: any) => void;
};

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  alerts: [],
  sendMessage: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Setup WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        setSocket(null);
      }, 5000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        
        // Handle different message types
        switch (message.type) {
          case 'alerts':
            setAlerts(message.data);
            break;
          
          case 'new_alert':
            setAlerts(prev => [...prev, message.data]);
            
            // Show toast notification for the new alert
            toast({
              title: 'New Alert',
              description: message.data.message,
              variant: message.data.level === 'critical' ? 'destructive' : 'default',
            });
            break;
          
          case 'emergency_request':
            // Show toast notification for emergency blood request
            toast({
              title: 'Emergency Blood Request',
              description: `${message.data.units} units of ${message.data.blood_type} blood needed urgently!`,
              variant: 'destructive',
            });
            break;
          
          case 'new_transaction':
            // Show toast notification for new transaction
            toast({
              title: 'New Transaction',
              description: `${message.data.units} units of ${message.data.blood_type} blood ${message.data.transaction_type}`,
              variant: 'default',
            });
            break;
          
          case 'request_fulfilled':
            // Show toast notification for fulfilled request
            toast({
              title: 'Request Fulfilled',
              description: `Blood request fulfilled: ${message.data.request.units} units of ${message.data.request.blood_type}`,
              variant: 'default',
            });
            break;
          
          case 'request_updated':
            // Show toast notification for request status update
            toast({
              title: 'Request Updated',
              description: `Blood request status changed to ${message.data.status}`,
              variant: 'default',
            });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    setSocket(ws);
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [toast]);
  
  const sendMessage = (type: string, data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, data }));
    } else {
      console.error('WebSocket is not connected');
    }
  };
  
  return (
    <WebSocketContext.Provider value={{ connected, alerts, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};