// common css
import "../assets/css/App.css";
// router components
import { BrowserRouter, Route, Routes } from "react-router-dom";
// pages
import HomePage from "../pages/HomePage";
import ReadTicketsPage from "../pages/ReadTicketsPage";
import LotteryPage from "../pages/LotteryPage";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tickets/" element={<ReadTicketsPage />} />
        <Route path="/lottery" element={<LotteryPage />} />
        {/* <Route path="/:username/:projectName/commits" element={<ProjectCommitsPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
