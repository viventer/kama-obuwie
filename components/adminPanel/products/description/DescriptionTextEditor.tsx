"use client";

import React, { useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function DescriptionTextEditor({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  id: string;
}) {
  const toolbarId = `toolbar-${id}`;

  const modules = useMemo(
    () => ({
      toolbar: `#${toolbarId}`,
    }),
    [toolbarId]
  );

  const change = (value: string) => {
    console.log("change", value);
    onChange(value);
  };

  const [currentValue, setCurrentValue] = useState(value);

  return (
    <div className="h-fit md:w-1/2 md:min-w-1/2 w-full">
      <div id={toolbarId}>
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
        onChange={(value) => setCurrentValue(value)}
        modules={modules}
        className="h-fit w-full min-w-full scrollbar"
        onBlur={() => change(currentValue)}
      />
    </div>
  );
}
