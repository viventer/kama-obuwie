import React, { useMemo, useRef, useEffect } from "react";
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

  return (
    <div className="w-full h-fit max-w-full">
      <div id={toolbarId}>
        <select className="ql-header" defaultValue="">
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="">Normal</option>
        </select>
        <button className="ql-bold" />
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
      </div>

      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        className="h-fit w-full min-w-full scrollbar"
      />
    </div>
  );
}
