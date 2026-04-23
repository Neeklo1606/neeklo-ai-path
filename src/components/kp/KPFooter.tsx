interface KPFooterProps {
  kpNumber: string;
  expiresDays: number;
}

export default function KPFooter({ kpNumber, expiresDays }: KPFooterProps) {
  return (
    <footer className="kp-footer">
      <div className="kp-footer-inner">
        <div>
          © 2026 neeklo.studio · ИП Клочко Н.Н. · ИНН 263520430560
          <br />
          КП {kpNumber} · действительно {expiresDays} дней
        </div>
        <div className="kp-footer-links">
          <a href="#problems">Проблемы</a>
          <a href="#packages">Пакеты</a>
          <a href="#timeline">Сроки</a>
          <a href="#cta">Обсудить</a>
        </div>
      </div>
    </footer>
  );
}
