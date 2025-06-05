interface ChipProps {
  name: string;
  bgcolor: string;
  color: string;
  length: number;
}

export default function Chip({ name, bgcolor, color, length }: ChipProps) {
  return (
    <div
      className="shrink-0 h-[34px] bg-white border border-container flex items-center gap-1.5 rounded-lg p-2"
      style={{ background: bgcolor, color: color }}
    >
      <div className="w-[15px] h-[15px] bg-container grid place-content-center rounded border border-container text-xxs font-semibold text-foreground dark:text-background">
        {length}
      </div>

      <span className="text-xs font-medium">{name}</span>
    </div>
  );
}
