"use client";

interface LoadingProps {
  fullPage?: boolean;
  size?: number;
  text?: string;
}

export default function Loading({
  fullPage = false,
  size = 40,
  text = "Loading...",
}: LoadingProps) {
  const loader = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: "3px solid hsl(var(--primary) / 0.1)",
          borderTop: "3px solid hsl(var(--primary))",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      {text && (
        <p
          style={{
            color: "hsl(var(--text-secondary))",
            fontSize: "0.875rem",
            fontWeight: 500,
            letterSpacing: "0.5px",
          }}>
          {text}
        </p>
      )}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "hsl(var(--bg-primary))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
        {loader}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px 0",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      {loader}
    </div>
  );
}
