import { Zap, ArrowRight, CheckCircle } from "lucide-react";

interface ProposalCardProps {
  price: string;
  timeline: string;
  deliverables: string[];
  onConnect: () => void;
}

const ProposalCard = ({ price, timeline, deliverables, onConnect }: ProposalCardProps) => (
  <div className="animate-card-reward ml-10 game-card border-accent/25" style={{ boxShadow: "0 0 24px hsl(187 92% 43% / 0.15), 0 0 0 1px hsl(187 92% 43% / 0.1)" }}>
    {/* Header */}
    <div className="flex items-center gap-2 mb-5">
      <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
        <Zap size={15} className="text-accent" />
      </div>
      <span className="text-[13px] font-semibold uppercase tracking-widest text-accent">Предложение</span>
    </div>

    {/* Price highlight */}
    <div className="bg-secondary rounded-xl p-4 mb-4 text-center">
      <p className="text-[28px] font-bold text-foreground tracking-tight">{price}</p>
      <p className="text-[12px] text-muted-foreground mt-0.5">срок — {timeline}</p>
    </div>

    {/* Deliverables */}
    <div className="space-y-2.5 mb-6">
      {deliverables.map((item) => (
        <div key={item} className="flex items-start gap-2.5">
          <CheckCircle size={15} className="text-accent mt-0.5 flex-shrink-0" />
          <span className="text-[13px] text-foreground leading-snug">{item}</span>
        </div>
      ))}
    </div>

    {/* Action */}
    <button
      onClick={onConnect}
      className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-semibold text-[14px] active:scale-[0.97] transition-transform duration-150 glow-accent flex items-center justify-center gap-2"
    >
      Подключить менеджера
      <ArrowRight size={16} />
    </button>
  </div>
);

export default ProposalCard;
