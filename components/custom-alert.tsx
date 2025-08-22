import React from "react";
import { Alert, Button } from "@heroui/react";

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

const cn = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

const CustomAlert = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Alert> & Props
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
      variant = "faded",
      className,
      classNames = {},
      ...props
    },
    ref
  ) => {
    const colorClass = React.useMemo(() => {
      switch (color) {
        case "default":
          return "before:bg-default-300";
        case "primary":
          return "before:bg-primary";
        case "secondary":
          return "before:bg-secondary";
        case "success":
          return "before:bg-success";
        case "warning":
          return "before:bg-warning";
        case "danger":
          return "before:bg-danger";
        default:
          return "before:bg-default-200";
      }
    }, [color]);

    return (
      <Alert
        ref={ref}
        color={color}
        variant={variant}
        title={title}
        classNames={{
          ...classNames,
          base: cn(
            "bg-default-50 dark:bg-background shadow-sm",
            "border-1 border-default-200 dark:border-default-100",
            "relative before:content-[''] before:absolute before:z-10",
            "before:left-0 before:top-[-1px] before:bottom-[-1px] before:w-1",
            "rounded-l-none border-l-0",
            colorClass,
            classNames?.base,
            className
          ),
          mainWrapper: cn("pt-1", classNames?.mainWrapper),
          iconWrapper: cn("dark:bg-transparent", classNames?.iconWrapper),
        }}
        {...props}
      >
        {description ? (
          <p className="text-sm text-default-600">{description}</p>
        ) : (
          children
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="light"
            onPress={onCancel}
            disabled={isCancelDisabled || isConfirmLoading}
          >
            {cancelText}
          </Button>
          <Button
            color="primary"
            onPress={onConfirm}
            isLoading={isConfirmLoading}
            disabled={isConfirmLoading}
          >
            {confirmText}
          </Button>
        </div>
      </Alert>
    );
  }
);

CustomAlert.displayName = "CustomAlert";
export default CustomAlert;
