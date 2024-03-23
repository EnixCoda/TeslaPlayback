import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { ErrorBoundary } from "./components/ErrorBoundary";

const appElement = document.getElementById("app");
if (appElement)
  createRoot(appElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
