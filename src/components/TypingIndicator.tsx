const TypingIndicator = () => (
  <div className="flex items-center py-1 px-0.5" style={{ gap: 4 }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="rounded-full"
        style={{
          width: 6,
          height: 6,
          background: "#D0D0D0",
          animation: `typingBounce 0.8s infinite ${i * 0.15}s`,
        }}
      />
    ))}
  </div>
);

export default TypingIndicator;
