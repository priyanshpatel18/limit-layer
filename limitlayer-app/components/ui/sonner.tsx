"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group"
    closeButton={false}
    richColors={false}
    icons={{
      success: <CircleCheckIcon className="size-4 text-primary" />,
      info: <InfoIcon className="size-4 text-primary" />,
      warning: <TriangleAlertIcon className="size-4 text-primary" />,
      error: <OctagonXIcon className="size-4 text-primary" />,
      loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
    }}
    toastOptions={{
      classNames: {
        title: "!text-primary",
        description: "!text-primary",
      },
    }}
    style={
      {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--primary)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      } as React.CSSProperties
    }
    {...props}
  />
);

export { Toaster };
