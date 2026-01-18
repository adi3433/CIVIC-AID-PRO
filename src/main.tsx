import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// PWA registration is handled by vite-plugin-pwa
// The service worker will be automatically registered and updated
