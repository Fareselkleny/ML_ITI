import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ResultPage from "./pages/ResultPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
