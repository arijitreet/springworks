import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { PlantProvider } from "./lib/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlantProvider>
      <App />
    </PlantProvider>
  </StrictMode>,
);
