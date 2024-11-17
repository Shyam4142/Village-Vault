import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Login } from "./pages/login"; 
import { Register } from "./pages/register"; 
import { HomePage } from "./pages/homepage";
import { TransferMoney } from "./pages/transfermoney"; 
import { TransactionHistory } from "./pages/transactionhistory";
import { FraudDetection } from "./pages/frauddetection";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/transfermoney" element={<TransferMoney />} />
        <Route path="/transactionhistory" element={<TransactionHistory />} />
        <Route path="/frauddetection" element={<FraudDetection />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
