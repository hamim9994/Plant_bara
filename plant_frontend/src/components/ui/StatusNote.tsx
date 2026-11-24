export type StatusNoteKind = "loading" | "error" | "empty";

export interface StatusNoteProps {
  kind: StatusNoteKind;
  message: string;
}

const LABELS: Record<StatusNoteKind, string> = {
  loading: "LOADING",
  error: "NOTICE",
  empty: "NO DATA",
};

export function StatusNote({ kind, message }: StatusNoteProps) {
  return (
    <div className="status-note" role={kind === "error" ? "alert" : "status"}>
      <p className="status-note__label">{LABELS[kind]}</p>
      <p className="status-note__message">{message}</p>
    </div>
  );
}

export default StatusNote;
