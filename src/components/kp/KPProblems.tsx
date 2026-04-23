import { useEffect, useRef } from "react";
import type { KpProblemsData } from "@/lib/cms-api";

interface KPProblemsProps {
  data: KpProblemsData;
}

export default function KPProblems({ data }: KPProblemsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).style.opacity = "1"; (e.target as HTMLElement).style.transform = "translateY(0)"; observer.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    ref.current?.querySelectorAll(".kp-prob").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="kp-section">
      <div className="kp-container" ref={ref}>
        <div className="kp-sec-num">01 / ЧТО МЫ УСЛЫШАЛИ</div>
        <h2 className="kp-sec-title">
          {data.title_1}<br />
          <span className="kp-accent">{data.title_2}</span>
        </h2>
        <div className="kp-problems-grid">
          {data.items.map((item, i) => (
            <div
              key={i}
              className="kp-prob"
              style={{ opacity: 0, transform: "translateY(28px)", transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)", transitionDelay: `${i * 0.08}s` }}
            >
              <div className="kp-prob-num">{item.num}</div>
              <h3 className="kp-prob-title">{item.title}</h3>
              <p className="kp-prob-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
