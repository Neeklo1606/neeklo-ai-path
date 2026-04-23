import type { KpTimelineData } from "@/lib/cms-api";

interface KPTimelineProps {
  data: KpTimelineData;
}

export default function KPTimeline({ data }: KPTimelineProps) {
  return (
    <section className="kp-section" id="timeline">
      <div className="kp-container">
        <div className="kp-sec-num">05 / СРОКИ</div>
        <h2 className="kp-sec-title">
          {data.title_1}<br />
          <span className="kp-accent">{data.title_2}</span>
        </h2>
        <div className="kp-timeline">
          {data.items.map((item, i) => (
            <div key={i} className="kp-tl-item">
              <div className="kp-tl-dot" />
              <div className="kp-tl-week">{item.week}</div>
              <h4 className="kp-tl-title">{item.title}</h4>
              <p className="kp-tl-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
