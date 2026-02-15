"use client";

import ClipLoader from "react-spinners/ClipLoader";

export default function Loader() {
  return (
    <div className="flex items-center justify-center text-primary p-4">
      <ClipLoader color={"#4a7ba7"} loading={true} size={50} />
    </div>
  );
}
