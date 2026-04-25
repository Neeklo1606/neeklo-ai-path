import "@/styles/services.css";
import ServiceSidebar from "@/components/services/ServiceSidebar";
import ServiceHero from "@/components/services/ServiceHero";
import ServiceForWhom from "@/components/services/ServiceForWhom";
import ServiceDelivers from "@/components/services/ServiceDelivers";
import ServiceCase from "@/components/services/ServiceCase";
import ServicePackages from "@/components/services/ServicePackages";
import ServiceProcess from "@/components/services/ServiceProcess";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import ServiceCTA from "@/components/services/ServiceCTA";
import { hero, heroPkgs, forWhom, delivers, caseData, packages, process, faq } from "@/data/services/education";

export default function ServiceEducation() {
  return (
    <div className="svc-root">
      <div className="svc-layout">
        <ServiceSidebar />
        <main className="svc-main">
          <ServiceHero data={hero} packages={heroPkgs} />
          <ServiceForWhom items={forWhom} />
          <ServiceDelivers items={delivers} />
          <ServiceCase data={caseData} />
          <ServicePackages packages={packages} />
          <ServiceProcess steps={process} />
          <ServiceFAQ items={faq} />
          <ServiceCTA service="обучение по нейросетям" />
        </main>
      </div>
    </div>
  );
}
