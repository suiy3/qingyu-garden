import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import DailyCheckIn from "@/pages/DailyCheckIn";
import MoodInsight from "@/pages/MoodInsight";
import MoodHistory from "@/pages/MoodHistory";
import SmartInsight from "@/pages/SmartInsight";
import StudyRecord from "@/pages/StudyRecord";
import KnowledgeList from "@/pages/KnowledgeList";
import KnowledgeCreate from "@/pages/KnowledgeCreate";
import KnowledgeDetail from "@/pages/KnowledgeDetail";
import ActionCenter from "@/pages/ActionCenter";
import ActionDetail from "@/pages/ActionDetail";
import ParentEntry from "@/pages/ParentEntry";
import ParentDashboard from "@/pages/ParentDashboard";
import ParentCrisis from "@/pages/ParentCrisis";
import ParentCommunication from "@/pages/ParentCommunication";
import QingyuChat from "@/pages/QingyuChat";
import WeeklyReport from "@/pages/WeeklyReport";
import Profile from "@/pages/Profile";
import ParentAccessGuard from "@/components/layout/ParentAccessGuard";

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/check-in" element={<DailyCheckIn />} />
        <Route path="/mood-record" element={<DailyCheckIn />} />
        <Route path="/mood-insight" element={<MoodInsight />} />
        <Route path="/mood-history" element={<MoodHistory />} />
        <Route path="/insight" element={<SmartInsight />} />
        <Route path="/study" element={<StudyRecord />} />
        <Route path="/knowledge" element={<KnowledgeList />} />
        <Route path="/knowledge/new" element={<KnowledgeCreate />} />
        <Route path="/knowledge/:id" element={<KnowledgeDetail />} />
        <Route path="/actions" element={<ActionCenter />} />
        <Route path="/action/:id" element={<ActionDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/parent" element={<ParentEntry />} />
        <Route path="/parent/dashboard" element={<ParentAccessGuard><ParentDashboard /></ParentAccessGuard>} />
        <Route path="/parent/crisis" element={<ParentAccessGuard><ParentCrisis /></ParentAccessGuard>} />
        <Route path="/parent/communication" element={<ParentAccessGuard><ParentCommunication /></ParentAccessGuard>} />
        <Route path="/chat" element={<QingyuChat />} />
        <Route path="/weekly-report" element={<WeeklyReport />} />
      </Routes>
    </Router>
  );
}
