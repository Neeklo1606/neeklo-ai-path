import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import type { CmsMedia } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";
import { MediaPickerModal } from "./MediaPickerModal";

type Props = {
  imageId: string | undefined;
  onChange: (imageId: string | undefined) => void;
  label?: string;
  /** Schema slot name (fixed in block editor — not user-editable). */
  imageSlot?: string;
};

export function MediaPickerField({ imageId, onChange, label = "Изображение", imageSlot }: Props) {
  const [open, setOpen] = useState(false);
  const q = useQuery({
    queryKey: ["cms", "media", "admin"],
    queryFn: async () => {
      const { data } = await adminApi.get<CmsMedia[]>("/media");
      return Array.isArray(data) ? data : [];
    },
  });
  const selected = q.data?.find((m) => m.id === imageId);
  const noMediaYet = !q.isLoading && !q.isError && (q.data?.length ?? 0) === 0;

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {imageSlot ? (
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">slot: {imageSlot}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-20 w-20 overflow-hidden rounded-xl border border-border bg-muted/50 flex items-center justify-center">
          {selected?.mime?.startsWith("image/") ? (
            <img src={selected.public_url} alt="" className="h-full w-full object-cover" />
          ) : imageId ? (
            <span className="text-[10px] text-muted-foreground text-center px-1">ID…{imageId.slice(0, 6)}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Нет</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button type="button" variant="outline" className="rounded-xl w-fit" onClick={() => setOpen(true)}>
            Выбрать изображение
          </Button>
          {imageId ? (
            <Button type="button" variant="ghost" className="text-destructive h-8 text-xs w-fit" onClick={() => onChange(undefined)}>
              Сбросить
            </Button>
          ) : null}
        </div>
      </div>
      {noMediaYet ? (
        <p className="text-xs text-muted-foreground">
          В библиотеке пока нет файлов.{" "}
          <Link to="/admin/media" className="text-[#0052FF] underline underline-offset-2">
            Открыть «Медиа»
          </Link>
        </p>
      ) : null}
      <MediaPickerModal open={open} onOpenChange={setOpen} onSelect={(id) => onChange(id)} />
    </div>
  );
}
