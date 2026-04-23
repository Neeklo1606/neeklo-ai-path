import type { KpIncludedData } from "@/lib/cms-api";

interface KPIncludedProps {
  data: KpIncludedData;
}

export default function KPIncluded({ data }: KPIncludedProps) {
  return (
    <section className="kp-section" id="included">
      <div className="kp-container">
        <div className="kp-sec-num">04 / ДЕТАЛИ</div>
        <h2 className="kp-sec-title">
          {data.title_1}<br />
          <span className="kp-accent">{data.title_2}</span>
        </h2>
        <div className="kp-included-grid">
          <div>
            <div className="kp-incl-col-title">+ Включено в пакет</div>
            <ul className="kp-incl-list kp-incl-yes">
              {data.yes.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div>
            <div className="kp-incl-col-title">— Не входит в пакет</div>
            <ul className="kp-incl-list kp-incl-no">
              {data.no.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
