import { toast } from "sonner";

export const useToast = () => {
  const showToast = (
    message: string,
    variant: "default" | "success" | "error" = "default",
    duration?: number // czas w milisekundach, domyślnie 4000ms (4s)
  ) => {
    const toastOptions = {
      duration: duration || (variant === "error" ? 8000 : 4000), // błędy dłużej, reszta krócej
    };

    if (variant === "success") {
      toast.success(message, {
        className: "border-success",
        ...toastOptions,
      });
    } else if (variant === "error") {
      toast.error(message, {
        className: "border-destructive",
        ...toastOptions,
      });
    } else {
      toast(message, {
        className: "border-accent",
        ...toastOptions,
      });
    }
  };

  return { showToast };
};
