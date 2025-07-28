"use client";

import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { useForm } from "react-hook-form";

export interface SendRefundFormValues {}

export default function SendRefundForm({ order }: { order: OrderWithId }) {
  const form = useForm<SendRefundFormValues>({});

  return <div>SendRefundForm</div>;
}
