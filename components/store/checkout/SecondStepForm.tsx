import { CheckoutData } from "@/firebase/schemas/checkoutSchemas";
import { UseFormReturn } from "react-hook-form";

export default function SecondStepForm({
  form,
}: {
  form: UseFormReturn<CheckoutData>;
}) {
  return <div>SecondStepForm</div>;
}
