import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getLocalePair, setLocalePair, type LocaleValue } from "./locale-utils";

type Props = {
  label: string;
  value: LocaleValue | unknown;
  onChange: (next: { ru: string; en: string }) => void;
  multiline?: boolean;
};

export function LocalePair({ label, value, onChange, multiline }: Props) {
  const { ru, en } = getLocalePair(value);
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">RU</Label>
          {multiline ? (
            <Textarea
              className="rounded-xl font-body min-h-[72px]"
              value={ru}
              onChange={(e) => onChange(setLocalePair(e.target.value, en))}
              rows={3}
            />
          ) : (
            <Input className="rounded-xl font-body" value={ru} onChange={(e) => onChange(setLocalePair(e.target.value, en))} />
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">EN</Label>
          {multiline ? (
            <Textarea
              className="rounded-xl font-body min-h-[72px]"
              value={en}
              onChange={(e) => onChange(setLocalePair(ru, e.target.value))}
              rows={3}
            />
          ) : (
            <Input className="rounded-xl font-body" value={en} onChange={(e) => onChange(setLocalePair(ru, e.target.value))} />
          )}
        </div>
      </div>
    </div>
  );
}
