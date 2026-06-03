"use client";

interface LoadingProps {
  fullPage?: boolean;
  size?: number;
  text?: string;
}

export default function Loading({
  fullPage = false,
  size = 50,
  text = "Loading...",
}: LoadingProps) {
  const customStyles = size !== 50 ? {
    ring1: {
      width: `${size}px`,
      height: `${size}px`,
    },
    ring2: {
      width: `${size * 0.72}px`,
      height: `${size * 0.72}px`,
    }
  } : null;

  const loader = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}>
      <div className="premium-loader">
        <div 
          className="premium-loader-ring1" 
          style={customStyles ? customStyles.ring1 : undefined}
        />
        <div 
          className="premium-loader-ring2" 
          style={customStyles ? customStyles.ring2 : undefined}
        />
      </div>
      {text && (
        <p
          style={{
            color: "hsl(var(--text-secondary))",
            fontSize: "0.875rem",
            fontWeight: 600,
            letterSpacing: "0.5px",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}>
          {text}
        </p>
      )}
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
