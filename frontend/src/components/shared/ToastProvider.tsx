"use client";

import { Toaster, toast } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2000,
        style: {
          fontSize: "14px",
          borderRadius: "10px",
        },
      }}
    />
  );
}