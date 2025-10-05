"use client";
import React, { useState, useEffect } from "react";
import { RefreshCcw, CheckCheck } from "lucide-react";
import { adminConnected } from "@/actions/common/socketChecker";

export default function AdminSocketConnected() {
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConnectionStatus = async () => {
    setIsLoading(true);
    try {
      const result = await adminConnected();
      setConnected(result.status);
    } catch (error) {
      console.error("Error checking connection:", error);
      setConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  const refresh = () => {
    fetchConnectionStatus();
  };

  const handleRefresh = () => {
    refresh();
    // Optionally, you can also reload the page:
    // window.location.reload();
  };

  if (isLoading) {
    return (
      <button type="button" disabled>
        <RefreshCcw className="animate-spin" />
      </button>
    );
  }

  if (connected) {
    return <CheckCheck className="text-green-500" />;
  }

  return (
    <button type="button" onClick={handleRefresh}>
      <RefreshCcw className="text-gray-500 hover:text-blue-500" />
    </button>
  );
}
