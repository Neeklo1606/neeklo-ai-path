import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ensureNeekloVisitorId } from "@/lib/visitor-id";

ensureNeekloVisitorId();

createRoot(document.getElementById("root")!).render(<App />);
