import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../../lib/utils";

export const RadioGroup = RadioGroupPrimitive.Root;

export const RadioGroupItem = ({ className, ...props }) => (
  <RadioGroupPrimitive.Item
    className={cn(
      "h-4 w-4 rounded-full border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "checked:bg-primary checked:border-primary",
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <div className="h-2 w-2 rounded-full bg-primary" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
);
