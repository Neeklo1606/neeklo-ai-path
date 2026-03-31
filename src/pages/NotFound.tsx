import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ background: "#F0EEE8", minHeight: "100dvh" }}>
      <p className="font-heading leading-none" style={{ fontSize: 80, fontWeight: 800, color: "#E0E0E0" }}>404</p>
      <p className="font-body mt-2" style={{ fontSize: 18, fontWeight: 600, color: "#0D0D0B" }}>Страница не найдена</p>
      <p className="font-body mt-2 max-w-xs text-center" style={{ fontSize: 14, color: "#6A6860" }}>
        Возможно, она была удалена или вы ввели неправильный адрес
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 font-body text-white rounded-xl cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all"
        style={{ background: "#0D0D0B", padding: "12px 24px", fontSize: 15, fontWeight: 600 }}
      >
        На главную
      </button>
    </div>
  );
};

export default NotFound;
