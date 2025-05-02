import { toast } from "sonner";

export const useToast = () => {
  const showToast = (
    message: string,
    variant: "default" | "success" | "error" = "default"
  ) => {
    if (variant === "success") {
      toast.success(message, {
        className: "border-success",
      });
    } else if (variant === "error") {
      toast.error(message, {
        className: "border-destructive",
      });
    } else {
      toast(message, {
        className: "border-accent",
      });
    }
  };

  return { showToast };
};
