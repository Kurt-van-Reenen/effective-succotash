import { useId, type ReactNode } from "react";

type StatusMessageProps = {
  status: "status" | "alert";
  title: string;
  message: string;
  children?: ReactNode;
};

export function StatusMessage({ status, title, message, children }: StatusMessageProps) {
  const titleId = useId();

  return (
    <section
      className={`status-card status-card--${status}`}
      role={status}
      aria-labelledby={titleId}
    >
      <h2 id={titleId}>{title}</h2>
      <p>{message}</p>
      {children}
    </section>
  );
}
