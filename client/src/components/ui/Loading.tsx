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
    <div className="flex flex-col items-center justify-center gap-4">
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
        <p className="text-secondary text-sm font-semibold tracking-wider animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-9999">
        {loader}
      </div>
    );
  }

  return (
    <div className="py-10 w-full flex items-center justify-center">
      {loader}
    </div>
  );
}
