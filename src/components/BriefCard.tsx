import { FileText, Clock, Layers, CheckCircle } from "lucide-react";

interface BriefCardProps {
  title: string;
  type: string;
  timeline: string;
  features: string[];
  onApprove: () => void;
}

const BriefCard = ({ title, type, timeline, features, onApprove }: BriefCardProps) => (
  <div className="game-card-reward animate-card-reward">
    <div className="flex items-center gap-2 mb-4">
      <FileText size={20} className="text-primary" />
      <span className="text-xs font-semibold uppercase tracking-wider text-primary">Бриф готов</span>
    </div>

    <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>

    <div className="space-y-3 mb-5">
      <div className="flex items-center gap-3">
        <Layers size={16} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Тип: <span className="text-foreground">{type}</span></span>
      </div>
      <div className="flex items-center gap-3">
        <Clock size={16} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Срок: <span className="text-foreground">{timeline}</span></span>
      </div>
    </div>

    <div className="space-y-2 mb-5">
      {features.map((f) => (
        <div key={f} className="flex items-center gap-2">
          <CheckCircle size={14} className="text-accent" />
          <span className="text-sm text-foreground">{f}</span>
        </div>
      ))}
    </div>

    <button
      onClick={onApprove}
      className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform duration-150 glow-primary"
    >
      Утвердить бриф
    </button>
  </div>
);

export default BriefCard;
