import type { KpWhyUsData } from "@/lib/cms-api";

interface KPWhyUsProps {
  data: KpWhyUsData;
}

export default function KPWhyUs({ data }: KPWhyUsProps) {
  return (
    <section className="kp-section" id="why">
      <div className="kp-container">
        <div className="kp-sec-num">07 / ПОЧЕМУ NEEKLO</div>
        <h2 className="kp-sec-title">
          {data.title_1}<br />
          <span className="kp-accent">{data.title_2}</span>
        </h2>
        <div className="kp-why-grid">
          {data.items.map((item, i) => (
            <div key={i} className="kp-why-item">
              <div className="kp-why-num">{item.num}</div>
              <h4 className="kp-why-title">{item.title}</h4>
              <p className="kp-why-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
