import type { KpNextPhaseData } from "@/lib/cms-api";

interface KPNextPhaseProps {
  data: KpNextPhaseData;
}

export default function KPNextPhase({ data }: KPNextPhaseProps) {
  return (
    <section className="kp-section" id="next-phase">
      <div className="kp-container">
        <div className="kp-sec-num">06 / ЧТО ПОТОМ</div>
        <h2 className="kp-sec-title">
          {data.title_1}<br />
          <span className="kp-accent">{data.title_2}</span>
        </h2>
        <div className="kp-nextph-box">
          <div className="kp-nextph-badge">Фаза 2</div>
          <h3 className="kp-nextph-lead">
            {data.lead_1}<br />{data.lead_2}
          </h3>
          <p className="kp-nextph-text">{data.text}</p>
          <ul className="kp-nextph-list">
            {data.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
          <div className="kp-nextph-price">
            <span className="kp-nextph-price-num">{data.price}</span>
            <span className="kp-nextph-price-label">{data.price_label}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
