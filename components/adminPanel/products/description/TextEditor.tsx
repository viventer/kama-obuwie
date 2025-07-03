"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  loading: () => <p>Loading editor...</p>,
  ssr: false,
});

export default function TextEditor({
  value,
  onChange,
  id,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  id: string;
  className?: string;
}) {
  const modules = useMemo(() => ({ toolbar: `#${id}` }), [id]);

  const [currentValue, setCurrentValue] = useState(value);

  return (
    <div
      className={cn("h-fit md:w-1/2 md:min-w-1/2 w-full", className)}
      onBlur={() => onChange(currentValue)}
    >
      <div id={id}>
        <span className="ql-formats">
          <button className="ql-header" value="1">
            H1
          </button>
          <button className="ql-header" value="2">
            H2
          </button>
          <button className="ql-header" value="">
            P
          </button>
        </span>
        <button className="ql-bold" />
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
      </div>

      <ReactQuill
        theme="snow"
        value={currentValue}
        onChange={setCurrentValue}
        modules={modules}
        className="h-fit w-full min-w-full scrollbar"
      />
    </div>
  );
}
