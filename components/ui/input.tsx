import React from "react";

export function Input({ type = "text", ...props }: any) {
  return (
    <input
      type={type}
      className="px-3 py-2 rounded text-black text-sm"
      {...props}
    />
  );
}
