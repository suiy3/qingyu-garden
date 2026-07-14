import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import MoodRecord from "@/pages/MoodRecord";
import MoodInsight from "@/pages/MoodInsight";
import SmartInsight from "@/pages/SmartInsight";
import StudyRecord from "@/pages/StudyRecord";
import KnowledgeList from "@/pages/KnowledgeList";
import KnowledgeDetail from "@/pages/KnowledgeDetail";
import ActionCenter from "@/pages/ActionCenter";
import ActionDetail from "@/pages/ActionDetail";
import ParentAuth from "@/pages/ParentAuth";
import ParentDashboard from "@/pages/ParentDashboard";
import ParentCrisis from "@/pages/ParentCrisis";
import ParentCommunication from "@/pages/ParentCommunication";
import QingyuChat from "@/pages/QingyuChat";
import WeeklyReport from "@/pages/WeeklyReport";
import Profile from "@/pages/Profile";
import SmartActionTrigger from "@/components/actions/SmartActionTrigger";

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <SmartActionTrigger />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mood-record" element={<MoodRecord />} />
        <Route path="/mood-insight" element={<MoodInsight />} />
        <Route path="/insight" element={<SmartInsight />} />
        <Route path="/study" element={<StudyRecord />} />
        <Route path="/knowledge" element={<KnowledgeList />} />
        <Route path="/knowledge/:id" element={<KnowledgeDetail />} />
        <Route path="/actions" element={<ActionCenter />} />
        <Route path="/action/:id" element={<ActionDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/parent" element={<ParentAuth />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="/parent/crisis" element={<ParentCrisis />} />
        <Route path="/parent/communication" element={<ParentCommunication />} />
        <Route path="/chat" element={<QingyuChat />} />
        <Route path="/weekly-report" element={<WeeklyReport />} />
      </Routes>
    </Router>
  );
}
