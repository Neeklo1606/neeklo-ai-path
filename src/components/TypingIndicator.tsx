const TypingIndicator = () => (
  <div className="flex items-center gap-[5px] py-1 px-0.5">
    <div className="w-[7px] h-[7px] rounded-full bg-muted-foreground/50 animate-dot-1" />
    <div className="w-[7px] h-[7px] rounded-full bg-muted-foreground/50 animate-dot-2" />
    <div className="w-[7px] h-[7px] rounded-full bg-muted-foreground/50 animate-dot-3" />
  </div>
);

export default TypingIndicator;
