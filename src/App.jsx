import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Quotations from "./pages/Quotations";
import DealsRevenue from "./pages/DealsRevenue";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg">
        <Sidebar />

        <main className="min-w-0 lg:ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/deals" element={<DealsRevenue />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;