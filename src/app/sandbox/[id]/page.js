"use client";

import { use } from "react";
import SandboxEditor from "@/components/SandboxEditor";

export default function SandboxPage({ params }) {
  const { id } = use(params);

  return <SandboxEditor id={id} />;
}
