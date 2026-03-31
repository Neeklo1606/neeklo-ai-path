const TypingIndicator = () => (
  <div className="flex items-center gap-[5px] py-1 px-0.5">
    <div className="w-[7px] h-[7px] rounded-full animate-dot-1" style={{ background: "#999" }} />
    <div className="w-[7px] h-[7px] rounded-full animate-dot-2" style={{ background: "#999" }} />
    <div className="w-[7px] h-[7px] rounded-full animate-dot-3" style={{ background: "#999" }} />
  </div>
);

export default TypingIndicator;
