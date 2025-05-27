import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, TextIcon } from "lucide-react";
import { useState } from "react";

export default function DescriptionElementTypeSelector({
  value,
  onChange,
}: {
  value: ("text" | "image")[];
  onChange: (value: ("text" | "image")[]) => void;
}) {
  const [tabValue, setTabValue] = useState(
    value ? value.join(".") : "image.text"
  );

  const onTabValueChange = (newValue: string) => {
    setTabValue(newValue);
    const newValues = newValue.split(".") as ("text" | "image")[];
    onChange(newValues);
  };

  return (
    <Tabs
      onValueChange={onTabValueChange}
      value={tabValue}
      className="overflow-x-auto scrollbar"
    >
      <TabsList className="w-full h-fit flex overflow-x-auto scrollbar">
        <TabsTrigger value="text">
          <TextIcon className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="image">
          <ImageIcon className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="image.text">
          <ImageIcon className="size-4" />
          <TextIcon className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="text.image">
          <TextIcon className="size-4" />
          <ImageIcon className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="image.image">
          <ImageIcon className="size-4" />
          <ImageIcon className="size-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
