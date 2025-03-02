import { useParams } from "wouter";
import { IDELayout } from "@/components/IDELayout";

export default function IDE() {
  const { mode } = useParams<{ mode: string }>();
  return <IDELayout mode={mode} />;
}