import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.scss";

const appElement = document.getElementById("app");
if (appElement) createRoot(appElement).render(<App />);
