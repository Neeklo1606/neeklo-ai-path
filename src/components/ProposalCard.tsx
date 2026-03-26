import { Zap, ArrowRight, CheckCircle } from "lucide-react";

interface ProposalCardProps {
  price: string;
  timeline: string;
  deliverables: string[];
  onConnect: () => void;
}

const ProposalCard = ({ price, timeline, deliverables, onConnect }: ProposalCardProps) => (
  <div className="animate-card-reward ml-[38px] game-card">
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-7 h-7 rounded-lg bg-card flex items-center justify-center">
        <Zap size={14} className="text-foreground" />
      </div>
      <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground">Предложение</span>
    </div>

    <div className="bg-card rounded-xl text-center mb-5" style={{ padding: "16px" }}>
      <p className="text-[26px] font-bold text-foreground tracking-tight leading-none">{price}</p>
      <p className="text-[12px] text-muted-foreground mt-1.5">срок — {timeline}</p>
    </div>

    <div className="space-y-3 mb-6">
      {deliverables.map((item) => (
        <div key={item} className="flex items-start gap-2.5">
          <CheckCircle size={14} className="text-foreground mt-[2px] flex-shrink-0" />
          <span className="text-[13px] text-muted-foreground leading-snug">{item}</span>
        </div>
      ))}
    </div>

    <button onClick={onConnect} className="btn-accent">
      Подключить менеджера
      <ArrowRight size={15} />
    </button>
  </div>
);

export default ProposalCard;
