import { Link } from "react-router-dom";

interface KPTopbarProps {
  clientName?: string;
  clientIndustry?: string;
  date?: string;
}

export default function KPTopbar({ clientName, clientIndustry, date }: KPTopbarProps) {
  return (
    <div className="kp-topbar">
      <div className="kp-topbar-inner">
        <Link to="/" className="kp-logo">
          <div className="kp-logo-mark">n</div>
          <div className="kp-logo-text">
            <span className="kp-logo-text-main">neeklo</span>
            <span className="kp-logo-text-sub">STUDIO</span>
          </div>
        </Link>
        <div className="kp-meta">
          {clientIndustry && <span className="kp-meta-industry">{clientIndustry}</span>}
          {clientIndustry && clientName && <span className="kp-meta-sep">·</span>}
          {clientName && <span>{clientName}</span>}
          {date && <><span className="kp-meta-sep">·</span><span>{date}</span></>}
        </div>
      </div>
    </div>
  );
}
