import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex-1 bg-background flex flex-col items-center justify-center px-8">
      <div className="text-center">
        <p className="text-[48px] font-bold text-foreground mb-2">404</p>
        <p className="text-[15px] text-muted-foreground mb-6">Страница не найдена</p>
        <button
          onClick={() => navigate("/")}
          className="btn-accent max-w-[200px] mx-auto"
        >
          <ArrowLeft size={16} />
          На главную
        </button>
      </div>
    </div>
  );
};

export default NotFound;
