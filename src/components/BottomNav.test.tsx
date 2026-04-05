import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BottomNav from "./BottomNav";
import { LanguageProvider } from "@/hooks/useLanguage";

function wrap(ui: React.ReactElement, initial = "/") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <LanguageProvider>
        <MemoryRouter initialEntries={[initial]}>
          <Routes>
            <Route path="*" element={ui} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

function NavWithPath() {
  const loc = useLocation();
  return (
    <>
      <div data-testid="loc">{loc.pathname}</div>
      <BottomNav />
    </>
  );
}

describe("BottomNav", () => {
  it("renders four tabs with labels at least 13px equivalent (style)", () => {
    render(wrap(<BottomNav />));
    const labels = screen.getAllByRole("button");
    expect(labels).toHaveLength(4);
    const first = labels[0].querySelector("span");
    expect(first).toBeTruthy();
    const fs = first && window.getComputedStyle(first).fontSize;
    expect(parseFloat(fs || "0")).toBeGreaterThanOrEqual(13);
  });

  it("navigates to /chat when second tab clicked", () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <LanguageProvider>
          <MemoryRouter initialEntries={["/"]}>
            <Routes>
              <Route path="*" element={<NavWithPath />} />
            </Routes>
          </MemoryRouter>
        </LanguageProvider>
      </QueryClientProvider>,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(4);
    fireEvent.click(buttons[1]);
    expect(screen.getByTestId("loc").textContent).toBe("/chat");
  });
});
