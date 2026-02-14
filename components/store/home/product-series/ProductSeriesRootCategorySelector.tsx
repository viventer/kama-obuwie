import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootCategory } from "@/firebase/schemas/productsSchemas";

export default function ProductSeriesRootCategorySelector({
  selectedRootCategory,
  setSelectedRootCategory,
}: {
  selectedRootCategory: RootCategory;
  setSelectedRootCategory: (rootCategory: RootCategory) => void;
}) {
  return (
    <Tabs
      defaultValue={selectedRootCategory}
      value={selectedRootCategory}
      onValueChange={(value) => setSelectedRootCategory(value as RootCategory)}
    >
      <TabsList>
        <TabsTrigger value="obuwie męskie">
          <p>Męskie</p>
        </TabsTrigger>
        <TabsTrigger value="obuwie damskie">
          <p>Damskie</p>
        </TabsTrigger>
        <TabsTrigger value="obuwie dziecięce">
          <p>Dziecięce</p>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
