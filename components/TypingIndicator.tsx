export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="size-2 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="size-2 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  )
}
