type JsonBlockProps = {
  value: unknown;
};

export function JsonBlock({ value }: JsonBlockProps) {
  return (
    <pre className="max-h-[420px] overflow-auto rounded-lg border border-zinc-200 bg-zinc-950 p-4 text-xs leading-relaxed text-cyan-50 dark:border-white/10">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
