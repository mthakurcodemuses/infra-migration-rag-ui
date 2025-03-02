import { useParams } from "wouter";
import { IDELayout } from "@/components/IDELayout";

export default function IDE() {
  const { mode } = useParams<{ mode: string }>();

  // Validate that mode is either "automated" or "manual"
  if (mode !== "automated" && mode !== "manual") {
    return <div>Invalid mode specified</div>;
  }

  return <IDELayout mode={mode} />;
}