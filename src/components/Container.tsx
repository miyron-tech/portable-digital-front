export function Container({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`} style={style}>{children}</div>;
}
