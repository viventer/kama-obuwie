import PhaseSelector from "@/components/adminPanel/global/PhaseSelector";
import {
  BanIcon,
  PackageCheck,
  PackageOpen,
  PackagePlus,
  TruckIcon,
} from "lucide-react";
import { ReactNode } from "react";

export default async function layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PhaseSelector
        basePath="/admin-panel/orders"
        options={[
          { value: "new", icon: <PackagePlus className="size-5" /> },
          { value: "processing", icon: <PackageOpen className="size-5" /> },
          {
            value: "ready-for-shipment",
            icon: <PackageCheck className="size-5" />,
          },
          { value: "sent", icon: <TruckIcon className="size-5" /> },
          { value: "cancelled", icon: <BanIcon className="size-5" /> },
        ]}
      />
    </>
  );
}
