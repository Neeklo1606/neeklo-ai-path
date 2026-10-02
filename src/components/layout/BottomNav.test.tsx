import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import BottomNav from "./BottomNav";
import { LanguageProvider } from "@/hooks/useLanguage";
import { BriefProvider } from "@/context/BriefContext";

/** Пять пунктов: Главная, Услуги, центральная кнопка брифа, Работы, Профиль. */
const TABS = 5;

function wrap(initial = "/") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function WithPath() {
    const loc = useLocation();
    return (
      <>
        <div data-testid="loc">{loc.pathname}</div>
        <BottomNav />
      </>
    );
  }
  return render(
    <QueryClientProvider client={qc}>
      <LanguageProvider>
        <MemoryRouter initialEntries={[initial]}>
          <BriefProvider>
            <Routes>
              <Route path="*" element={<WithPath />} />
            </Routes>
          </BriefProvider>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe("BottomNav (мобильное меню)", () => {
  it("показывает пять пунктов", () => {
    wrap();
    expect(screen.getAllByRole("button")).toHaveLength(TABS);
  });

  it("переходит на /services по второму пункту", () => {
    wrap();
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(screen.getByTestId("loc").textContent).toBe("/services");
  });

  it("переходит на /cases по пункту «Работы»", () => {
    wrap();
    fireEvent.click(screen.getAllByRole("button")[3]);
    expect(screen.getByTestId("loc").textContent).toBe("/cases");
  });

  it("центральная кнопка открывает визард брифа, а не ведёт на несуществующий /brief", () => {
    wrap();
    fireEvent.click(screen.getAllByRole("button")[2]);
    expect(screen.getByTestId("loc").textContent).toBe("/");
    expect(screen.getByText(/Что нужно сделать\?/i)).toBeInTheDocument();
  });

  it("помечает активный пункт через aria-current", () => {
    wrap("/cases");
    const current = screen.getAllByRole("button").filter((b) => b.getAttribute("aria-current") === "page");
    expect(current.length).toBeGreaterThanOrEqual(1);
  });
});
