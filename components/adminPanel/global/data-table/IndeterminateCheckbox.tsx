import React, { useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface IndeterminateCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  indeterminate?: boolean;
}

const IndeterminateCheckbox = React.forwardRef<
  HTMLButtonElement,
  IndeterminateCheckboxProps
>(({ indeterminate, ...props }, ref) => {
  const defaultRef = useRef<HTMLButtonElement>(null);
  const resolvedRef = (ref || defaultRef) as React.RefObject<HTMLButtonElement>;

  useEffect(() => {
    if (resolvedRef.current) {
      const input = resolvedRef.current.querySelector("input");
      if (input) {
        input.indeterminate = Boolean(indeterminate);
      }
    }
  }, [resolvedRef, indeterminate]);

  return <Checkbox ref={resolvedRef} {...props} />;
});

IndeterminateCheckbox.displayName = "IndeterminateCheckbox";

export default IndeterminateCheckbox;
