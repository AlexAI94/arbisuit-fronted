"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Cookies from "js-cookie";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

interface DailyPoint {
  date: string;
  profit: number;
  volumen: number;
}

export interface LiveMetrics {
  profit_total: number;
  volumen_total: number;
  spread_promedio: number;
  ops_count: number;
  match_rate: number;
  unmatched_count: number;
  serie_diaria: DailyPoint[];
  last_updated: string | null;
}

const DEFAULT_METRICS: LiveMetrics = {
  profit_total: 0,
  volumen_total: 0,
  spread_promedio: 0,
  ops_count: 0,
  match_rate: 0,
  unmatched_count: 0,
  serie_diaria: [],
  last_updated: null,
};

export function useAnalyticsWS(workspaceId: string | null) {
  const [metrics, setMetrics] = useState<LiveMetrics>(DEFAULT_METRICS);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!workspaceId) return;

    const token = Cookies.get("access_token");
    const url = `${WS_URL}/api/v1/analytics/${workspaceId}/ws${token ? `?token=${token}` : ""}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "metrics_update") {
          setMetrics({ ...msg.data, last_updated: msg.timestamp });
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      // Reconectar en 5 segundos
      reconnectRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = () => ws.close();
  }, [workspaceId]);

  const forceRefresh = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "refresh" }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  return { metrics, connected, forceRefresh };
}
