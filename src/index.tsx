import { createRoot } from "react-dom/client";
import { App } from "./components/App";

const appElement = document.getElementById("app");
if (appElement) createRoot(appElement).render(<App />);
