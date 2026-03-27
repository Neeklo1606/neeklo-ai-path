import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, Play, Globe, Smartphone, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const serviceMap: Record<string, { name: string; icon: React.ElementType }> = {
  "ai-roliki": { name: "AI-ролики", icon: Play },
  "sajt-pod-klyuch": { name: "Сайт под ключ", icon: Globe },
  "telegram-mini-app": { name: "Telegram Mini App", icon: Smartphone },
  "ai-agent": { name: "AI-агент", icon: Sparkles },
};

const budgetOptions = ["до 50 000 ₽", "50 000 — 150 000 ₽", "150 000 ₽+"];

const OrderPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = serviceMap[serviceId || ""] ?? { name: serviceId || "Услуга", icon: Sparkles };

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");

  // Step 2
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");

  // Validation
  const step1Valid = description.trim().length > 0 && deadline.trim().length > 0 && budget.length > 0;
  const step2Valid = name.trim().length > 0 && contact.trim().length > 0;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex-1 bg-background text-foreground flex items-center justify-center px-5 pb-24 md:pb-0">
        <div className="text-center max-w-[400px]">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-primary" />
          </div>
          <h1 className="text-[24px] md:text-[28px] font-extrabold mb-3">Заявка принята!</h1>
          <p className="text-[15px] text-muted-foreground mb-8">
            Менеджер свяжется в течение часа
          </p>
          <button onClick={() => navigate("/")} className="btn-primary w-full max-w-[280px] mx-auto flex items-center justify-center gap-2">
            На главную
            <ArrowRight size={16} />
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground pb-24 md:pb-0">
      <div className="max-w-[560px] mx-auto px-5 pt-8 md:pt-14">
        {/* Back */}
        <button onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))} className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} />
          {step > 1 ? "Назад" : "Услуги"}
        </button>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`w-full h-1.5 rounded-full transition-colors duration-200 ${s <= step ? "bg-foreground" : "bg-muted"}`} />
              <span className={`text-[11px] font-medium ${s <= step ? "text-foreground" : "text-muted-foreground"}`}>
                {s === 1 ? "О проекте" : s === 2 ? "Контакты" : "Подтверждение"}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="game-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <service.icon size={18} className="text-foreground" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Услуга</p>
                <p className="text-[15px] font-bold">{service.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-1.5">Опишите задачу подробнее</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                placeholder="Расскажите о проекте, целях, аудитории…"
                rows={4}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-1.5">Срок (когда нужно)</label>
              <input
                value={deadline}
                onChange={(e) => setDeadline(e.target.value.slice(0, 100))}
                placeholder="Например: через 2 недели"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-1.5">Бюджет</label>
              <div className="flex gap-2 flex-wrap">
                {budgetOptions.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors duration-150 ${
                      budget === b
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              Далее
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-[20px] font-extrabold">Контакты</h2>

            <div>
              <label className="block text-[13px] font-semibold mb-1.5">Имя</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 100))}
                placeholder="Как к вам обращаться"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-1.5">Телефон или Telegram</label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value.slice(0, 100))}
                placeholder="+7 … или @username"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-1.5">Email <span className="text-muted-foreground font-normal">(необязательно)</span></label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value.slice(0, 255))}
                placeholder="email@example.com"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!step2Valid}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              Далее
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-[20px] font-extrabold">Подтверждение</h2>

            <div className="game-card space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-muted-foreground">Услуга</span>
                <span className="font-semibold">{service.name}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-muted-foreground">Бюджет</span>
                <span className="font-semibold">{budget}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-muted-foreground">Срок</span>
                <span className="font-semibold">{deadline}</span>
              </div>
            </div>

            <div className="game-card space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-muted-foreground">Имя</span>
                <span className="font-semibold">{name}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-muted-foreground">Контакт</span>
                <span className="font-semibold">{contact}</span>
              </div>
              {email && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-semibold">{email}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Отправить заявку
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default OrderPage;
