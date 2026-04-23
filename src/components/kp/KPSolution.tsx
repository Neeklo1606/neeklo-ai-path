import type { KpSolutionData } from "@/lib/cms-api";

interface KPSolutionProps {
  data: KpSolutionData;
}

export default function KPSolution({ data }: KPSolutionProps) {
  return (
    <section className="kp-section">
      <div className="kp-container">
        <div className="kp-sec-num">02 / НАШЕ РЕШЕНИЕ</div>
        <h2 className="kp-sec-title">
          {data.title_1}<br />
          <span className="kp-accent">{data.title_2}</span>
        </h2>
        <p className="kp-solution-lead">{data.lead}</p>
        <div className="kp-flow">
          {data.steps.map((step, i) => (
            <div key={i} className="kp-flow-step">
              <div className="kp-flow-step-num">{step.num}</div>
              <h4 className="kp-flow-step-title">{step.title}</h4>
              <p className="kp-flow-step-text">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
