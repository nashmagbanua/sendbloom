"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ textAlign: "center", padding: 40 }}>
          <h2>May naganap na error</h2>
          <button onClick={() => reset()}>Ulitin</button>
        </div>
      </body>
    </html>
  );
}
