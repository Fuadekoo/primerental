import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Props = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isConfirmLoading?: boolean;
  isCancelDisabled?: boolean;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  variant?: "faded" | "solid" | "bordered" | "flat" | "shadow";
  className?: string;
  classNames?: Record<string, string>;
};

const CustomAlert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & Props
>(
  (
    {
      title,
      description,
      children,
      confirmText = "Sure",
      cancelText = "Cancel",
      onConfirm,
      onCancel,
      isConfirmLoading = false,
      isCancelDisabled = false,
      color = "warning",
      className,
      ...props
    },
    ref
  ) => {
    const getColorClasses = (c: string) => {
      switch (c) {
        case "success":
          return "border-green-500 text-green-800 dark:text-green-400 [&>svg]:text-green-800 dark:[&>svg]:text-green-400 bg-green-50 dark:bg-green-900/10";
        case "warning":
          return "border-yellow-500 text-yellow-800 dark:text-yellow-400 [&>svg]:text-yellow-800 dark:[&>svg]:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10";
        case "danger":
          return "border-red-500 text-red-800 dark:text-red-400 [&>svg]:text-red-800 dark:[&>svg]:text-red-400 bg-red-50 dark:bg-red-900/10";
        case "primary":
          return "border-blue-500 text-blue-800 dark:text-blue-400 [&>svg]:text-blue-800 dark:[&>svg]:text-blue-400 bg-blue-50 dark:bg-blue-900/10";
        default:
          return "";
      }
    };

    return (
      <Alert
        ref={ref}
        className={cn(getColorClasses(color as string), className)}
        {...props}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>
          {description ? (
            <p className="text-sm mb-4">{description}</p>
          ) : (
            <div className="mb-4">{children}</div>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isCancelDisabled || isConfirmLoading}
              size="sm"
            >
              {cancelText}
            </Button>
            <Button
              variant={color === "danger" ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={isConfirmLoading}
              size="sm"
            >
              {isConfirmLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {confirmText}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
);

CustomAlert.displayName = "CustomAlert";
export default CustomAlert;
