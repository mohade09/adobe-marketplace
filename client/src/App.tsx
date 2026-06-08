import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CatalogPage } from "./pages/CatalogPage";
import { MyRequestsPage } from "./pages/MyRequestsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { RequestAccessPage } from "./pages/RequestAccessPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/request/:id" element={<RequestAccessPage />} />
        <Route path="/requests" element={<MyRequestsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
