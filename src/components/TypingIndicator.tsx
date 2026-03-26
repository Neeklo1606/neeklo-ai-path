const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-dot-1" />
    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-dot-2" />
    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-dot-3" />
  </div>
);

export default TypingIndicator;
