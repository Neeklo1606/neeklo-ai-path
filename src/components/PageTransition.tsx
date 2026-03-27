import { ReactNode } from "react";

const PageTransition = ({ children }: { children: ReactNode }) => (
  <div className="animate-page-in">{children}</div>
);

export default PageTransition;
