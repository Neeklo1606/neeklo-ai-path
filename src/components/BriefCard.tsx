import { FileText, Layers, DollarSign, Clock } from "lucide-react";

interface BriefCardProps {
  projectType: string;
  budget: string;
  timeline: string;
  onApprove: () => void;
}

const BriefCard = ({ projectType, budget, timeline, onApprove }: BriefCardProps) => (
  <div className="game-card-reward animate-card-reward ml-10">
    {/* Header */}
    <div className="flex items-center gap-2 mb-5">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <FileText size={15} className="text-primary" />
      </div>
      <span className="text-[13px] font-semibold uppercase tracking-widest text-primary">Бриф</span>
    </div>

    {/* Fields */}
    <div className="space-y-3.5 mb-6">
      <div className="flex items-center gap-3">
        <Layers size={16} className="text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Тип проекта</p>
          <p className="text-[14px] font-medium text-foreground">{projectType}</p>
        </div>
      </div>
      <div className="w-full h-px bg-border" />
      <div className="flex items-center gap-3">
        <DollarSign size={16} className="text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Бюджет</p>
          <p className="text-[14px] font-medium text-foreground">{budget}</p>
        </div>
      </div>
      <div className="w-full h-px bg-border" />
      <div className="flex items-center gap-3">
        <Clock size={16} className="text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Срок</p>
          <p className="text-[14px] font-medium text-foreground">{timeline}</p>
        </div>
      </div>
    </div>

    {/* Action */}
    <button
      onClick={onApprove}
      className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-[14px] active:scale-[0.97] transition-transform duration-150 glow-primary"
    >
      Утвердить
    </button>
  </div>
);

export default BriefCard;
