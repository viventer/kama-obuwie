import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BestsellersRootCategory } from "@/lib/bestsellers";

export default function ProductSeriesRootCategorySelector({
  selectedRootCategory,
  setSelectedRootCategory,
  className,
}: {
  selectedRootCategory: BestsellersRootCategory;
  setSelectedRootCategory: (rootCategory: BestsellersRootCategory) => void;
  className?: string;
}) {
  return (
    <Tabs
      defaultValue={selectedRootCategory}
      value={selectedRootCategory}
      onValueChange={(value) =>
        setSelectedRootCategory(value as BestsellersRootCategory)
      }
      className={className}
    >
      <TabsList>
        <TabsTrigger value="obuwie męskie">
          <p className="text-base">Męskie</p>
        </TabsTrigger>
        <TabsTrigger value="obuwie damskie">
          <p className="text-base">Damskie</p>
        </TabsTrigger>
        <TabsTrigger value="obuwie dziecięce">
          <p className="text-base">Dziecięce</p>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
