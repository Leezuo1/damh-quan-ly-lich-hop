import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { getRouter } from "./router";
import "./styles/global.css";
// Đây là file chạy đầu tiên của app.
const rootElement = document.getElementById("root");
if (rootElement) {
    createRoot(rootElement).render(<RouterProvider router={getRouter()}/>);
}

