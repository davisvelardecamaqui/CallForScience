import React from "react";

export function Card({ children, className }: any) {
  return (
    <div className={`rounded-lg shadow-md p-4 bg-zinc-900 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: any) {
  return <div className={`p-2 ${className}`}>{children}</div>;
}
