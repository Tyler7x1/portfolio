import { ImageResponse } from "next/og";

export const alt = "Jayprakash Malik · Business informatics and data analytics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          color: "#ffffff",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          Portfolio
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            Jayprakash Malik
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 38,
              marginTop: 24,
              opacity: 0.6,
            }}
          >
            Business Informatics · Data analytics · Independent research
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}