"use client";

import React, { useEffect, useRef, useState } from "react";
import BarLoader from "react-spinners/BarLoader";

export default function MiniLoader() {
  const [spinnerColor, setSpinnerColor] = useState("#000");
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const computedColor = getComputedStyle(containerRef.current).color;
      setSpinnerColor(computedColor);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-start text-primary"
    >
      <BarLoader color={spinnerColor} loading={true} />
    </div>
  );
}
