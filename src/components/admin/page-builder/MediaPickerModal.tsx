import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import type { CmsMedia } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (mediaId: string) => void;
  title?: string;
};

export function MediaPickerModal({ open, onOpenChange, onSelect, title = "Выберите изображение" }: Props) {
  const q = useQuery({
    queryKey: ["cms", "media", "admin", "picker"],
    queryFn: async () => {
      const { data } = await adminApi.get<CmsMedia[]>("/media");
      return data;
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
        </DialogHeader>
        {q.isLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка…</p>
        ) : q.isError ? (
          <p className="text-sm text-destructive">Не удалось загрузить медиа</p>
        ) : !q.data?.length ? (
          <p className="text-sm text-muted-foreground">Нет файлов. Загрузите в разделе «Медиа».</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {q.data.map((m) => (
              <button
                key={m.id}
                type="button"
                className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/40 hover:ring-2 hover:ring-[#0052FF]/40 transition-all"
                onClick={() => {
                  onSelect(m.id);
                  onOpenChange(false);
                }}
              >
                {m.mime?.startsWith("image/") ? (
                  <img src={m.public_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-muted-foreground p-1">file</span>
                )}
              </button>
            ))}
          </div>
        )}
        <Button type="button" variant="outline" className="rounded-xl w-full sm:w-auto" onClick={() => onOpenChange(false)}>
          Отмена
        </Button>
      </DialogContent>
    </Dialog>
  );
}
