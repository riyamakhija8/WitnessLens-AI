"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  accept: string;
  label: string;
  description: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
};

export function FileDropzone({
  accept,
  label,
  description,
  multiple = false,
  onFiles
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [active, setActive] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed p-8 text-center transition",
        active
          ? "border-cyan-400 bg-cyan-500/10"
          : "border-zinc-300 bg-white/70 dark:border-white/15 dark:bg-white/[0.03]"
      )}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        setActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setActive(false);
        onFiles(Array.from(event.dataTransfer.files));
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = "";
        }}
      />
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-cyan-500/12 text-cyan-700 dark:text-cyan-200">
        <UploadCloud className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-950 dark:text-white">
        {label}
      </p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
