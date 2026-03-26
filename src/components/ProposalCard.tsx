import { Zap, DollarSign, Calendar, ArrowRight } from "lucide-react";

interface ProposalCardProps {
  price: string;
  timeline: string;
  scope: string;
  onConnect: () => void;
}

const ProposalCard = ({ price, timeline, scope, onConnect }: ProposalCardProps) => (
  <div className="game-card-reward animate-card-reward border-accent/30" style={{ boxShadow: "var(--glow-accent)" }}>
    <div className="flex items-center gap-2 mb-4">
      <Zap size={20} className="text-accent" />
      <span className="text-xs font-semibold uppercase tracking-wider text-accent">Коммерческое предложение</span>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-5">
      <div className="bg-secondary rounded-xl p-4">
        <DollarSign size={18} className="text-accent mb-1" />
        <p className="text-xl font-bold text-foreground">{price}</p>
        <p className="text-xs text-muted-foreground">Стоимость</p>
      </div>
      <div className="bg-secondary rounded-xl p-4">
        <Calendar size={18} className="text-primary mb-1" />
        <p className="text-xl font-bold text-foreground">{timeline}</p>
        <p className="text-xs text-muted-foreground">Срок</p>
      </div>
    </div>

    <p className="text-sm text-muted-foreground mb-5">{scope}</p>

    <button
      onClick={onConnect}
      className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform duration-150 glow-accent flex items-center justify-center gap-2"
    >
      Подключить менеджера
      <ArrowRight size={16} />
    </button>
  </div>
);

export default ProposalCard;
