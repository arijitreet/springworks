import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Overview } from "./pages/Overview";
import { Vouchers } from "./pages/Vouchers";
import { Stock } from "./pages/Stock";
import { Masters } from "./pages/Masters";
import { Reports } from "./pages/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="vouchers" element={<Vouchers />} />
          <Route path="stock" element={<Stock />} />
          <Route path="masters" element={<Masters />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
