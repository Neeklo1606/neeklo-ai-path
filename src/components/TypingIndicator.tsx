const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 py-0.5">
    <div className="w-[6px] h-[6px] rounded-full bg-muted-foreground animate-dot-1" />
    <div className="w-[6px] h-[6px] rounded-full bg-muted-foreground animate-dot-2" />
    <div className="w-[6px] h-[6px] rounded-full bg-muted-foreground animate-dot-3" />
  </div>
);

export default TypingIndicator;
