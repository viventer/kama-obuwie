"use client";

import React, { useEffect, useRef, useState } from "react";
import HashLoader from "react-spinners/HashLoader";

export default function Loader() {
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
      className="w-screen h-screen flex items-center justify-center text-primary"
    >
      <HashLoader color={spinnerColor} loading={true} size={50} />
    </div>
  );
}
