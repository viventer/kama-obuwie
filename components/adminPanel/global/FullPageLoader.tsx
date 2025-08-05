"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Loader from "./Loader";

interface FullPageLoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const FullPageLoadingContext = createContext<
  FullPageLoadingContextType | undefined
>(undefined);

export function useFullPageLoading() {
  const context = useContext(FullPageLoadingContext);
  if (!context) {
    throw new Error(
      "useFullPageLoading must be used within a FullPageLoaderProvider"
    );
  }
  return context;
}

interface FullPageLoaderProps {
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function FullPageLoader({
  isLoading,
  children,
}: FullPageLoaderProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <>
      {children && <div className="pointer-events-none">{children}</div>}
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
        <Loader />
      </div>
    </>
  );
}

// Context Provider component
export function FullPageLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const contextValue = {
    isLoading,
    startLoading,
    stopLoading,
  };

  return (
    <FullPageLoadingContext.Provider value={contextValue}>
      <FullPageLoader isLoading={isLoading}>{children}</FullPageLoader>
    </FullPageLoadingContext.Provider>
  );
}
