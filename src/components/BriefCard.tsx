import { FileText, Layers, DollarSign, Clock } from "lucide-react";

interface BriefCardProps {
  projectType: string;
  budget: string;
  timeline: string;
  onApprove: () => void;
}

const BriefCard = ({ projectType, budget, timeline, onApprove }: BriefCardProps) => (
  <div className="game-card-reward animate-card-reward ml-[38px]">
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <FileText size={14} className="text-primary" />
      </div>
      <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-primary">Бриф</span>
    </div>

    <div className="space-y-0 mb-6">
      {[
        { icon: Layers, label: "Тип проекта", value: projectType },
        { icon: DollarSign, label: "Бюджет", value: budget },
        { icon: Clock, label: "Срок", value: timeline },
      ].map((field, idx) => (
        <div key={field.label}>
          {idx > 0 && <div className="h-px bg-border my-3" />}
          <div className="flex items-center gap-3">
            <field.icon size={15} className="text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide leading-none mb-1">{field.label}</p>
              <p className="text-[14px] font-medium text-foreground leading-tight">{field.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <button onClick={onApprove} className="btn-primary">
      Утвердить
    </button>
  </div>
);

export default BriefCard;
