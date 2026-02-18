import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootCategory } from "@/firebase/schemas/productsSchemas";

export default function ProductSeriesRootCategorySelector({
  selectedRootCategory,
  setSelectedRootCategory,
  className,
}: {
  selectedRootCategory: RootCategory;
  setSelectedRootCategory: (rootCategory: RootCategory) => void;
  className?: string;
}) {
  return (
    <Tabs
      defaultValue={selectedRootCategory}
      value={selectedRootCategory}
      onValueChange={(value) => setSelectedRootCategory(value as RootCategory)}
      className={className}
    >
      <TabsList className="md:py-6">
        <TabsTrigger value="obuwie męskie" className="md:px-6 md:py-4">
          <p className="md:text-lg">Męskie</p>
        </TabsTrigger>
        <TabsTrigger value="obuwie damskie" className="md:px-6 md:py-4">
          <p className="md:text-lg">Damskie</p>
        </TabsTrigger>
        <TabsTrigger value="obuwie dziecięce" className="md:px-6 md:py-4">
          <p className="md:text-lg">Dziecięce</p>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
