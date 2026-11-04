import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RootsSignIn } from "./screens/RootsSignIn";
import { RootsHome } from "./screens/Wireframe/RootsHome";
import { RootsBennettFamily } from "./screens/RootsBennettFamily";

const app = document.getElementById("app");
if (app) {
  createRoot(app).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootsHome />} />
          <Route path="/sign-in" element={<RootsSignIn />} />
          <Route
            path="/roots-u183-bennett-family-tree"
            element={<RootsBennettFamily />}
          />
        </Routes>
      </BrowserRouter>
    </StrictMode>,
  );
}
