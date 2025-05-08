"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ImageIcon,
  InfoIcon,
  PlusCircleIcon,
  SendIcon,
  TextIcon,
  Wand2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreationStageSelector() {
  const [selectedStage, setSelectedStage] = useState("new");
  const router = useRouter();

  const onChange = (value: string) => {
    setSelectedStage(value);
    router.push(`/admin-panel/create-products/${value}`);
  };

  return (
    <Tabs
      className="fixed left-0 bottom-0 pb-4 w-screen flex flex-row justify-center"
      onValueChange={onChange}
      value={selectedStage}
      defaultValue="new"
    >
      <TabsList className="flex justify-between w-[90%] max-w-lg">
        <TabsTrigger value="new">
          <PlusCircleIcon className="size-5" />
        </TabsTrigger>
        <TabsTrigger value="photos">
          <ImageIcon className="size-5" />
        </TabsTrigger>
        <TabsTrigger value="photos-edit">
          <Wand2Icon className="size-5" />
        </TabsTrigger>
        <TabsTrigger value="parameters">
          <InfoIcon className="size-5" />
        </TabsTrigger>
        <TabsTrigger value="description">
          <TextIcon className="size-5" />
        </TabsTrigger>
        <TabsTrigger value="post-offer">
          <SendIcon className="size-5" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
