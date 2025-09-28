"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <Card className="max-w-md w-full">
            <CardBody className="text-center p-8">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We're sorry, but something unexpected happened. Please try
                refreshing the page.
              </p>
              <div className="space-y-3">
                <Button
                  color="primary"
                  variant="solid"
                  onClick={this.handleRetry}
                  className="w-full"
                  startContent={<RefreshCw className="h-4 w-4" />}
                >
                  Try Again
                </Button>
                <Button
                  variant="light"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Refresh Page
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
