import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RootsSignIn } from "./screens/RootsSignIn";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const app = document.getElementById("app");

if (app) {
  createRoot(app).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootsSignIn />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>,
  );
}
