"use client";

import Loader from "@/components/adminPanel/global/Loader";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen fixed left-0 right-0 top-0 text-primary">
      <Loader />
    </div>
  );
}
