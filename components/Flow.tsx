type Step = { label: string; actor?: string; description?: string };

export default function Flow({
  title,
  steps,
  note,
}: {
  title?: string;
  steps: Step[];
  note?: string;
}) {
  return (
    <figure className="not-prose my-10">
      {title && (
        <figcaption className="text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50">
          {title}
        </figcaption>
      )}

      <ol className="mt-4">
        {steps.map((step, i) => (
          <li key={`${i}`}>
            <div className="flex items-start gap-4 rounded-xl border border-black/15 p-4 dark:border-white/20">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-medium text-white dark:bg-white dark:text-black">
                {i + 1}
              </span>
              <div>
                {step.actor && (
                  <p className="text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50">
                    {step.actor}
                  </p>
                )}
                <p className="font-semibold tracking-tight">{step.label}</p>
                {step.description && (
                  <p className="mt-1 text-sm leading-relaxed text-black/60 dark:text-white/60">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                aria-hidden
                className="ml-8 h-6 w-px bg-black/30 dark:bg-white/40"
              />
            )}
          </li>
        ))}
      </ol>

      {note && (
        <p className="mt-4 text-sm italic text-black/50 dark:text-white/50">
          {note}
        </p>
      )}
    </figure>
  );
}