"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export type PhaseSelectorOption = {
  value: string;
  icon: React.ReactNode;
};

export default function PhaseSelector({
  basePath,
  options,
}: {
  basePath: string;
  options: PhaseSelectorOption[];
}) {
  const pathname = usePathname();
  const currentStage = pathname.split("/").pop();

  const params = useParams();
  const isDetailPage = params?.productId || params?.id || params?.orderId;

  const [selectedStage, setSelectedStage] = useState(currentStage);
  const router = useRouter();

  const onChange = (value: string) => {
    setSelectedStage(value);
    router.push(`${basePath}/${value}`);
  };

  return (
    <Tabs
      className={`${
        isDetailPage ? "hidden" : "flex"
      } fixed left-0 bottom-0 pb-4 w-screen flex-row justify-center`}
      onValueChange={onChange}
      value={selectedStage}
    >
      <TabsList className="flex justify-between w-[90%] max-w-lg">
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.icon}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
