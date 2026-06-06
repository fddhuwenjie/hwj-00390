import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import PetDetail from '@/pages/PetDetail';
import PublishPet from '@/pages/PublishPet';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import StoryDetail from '@/pages/StoryDetail';
import Stories from '@/pages/Stories';
import LostPets from '@/pages/LostPets';
import RegisterLostPet from '@/pages/RegisterLostPet';
import LostPetDetail from '@/pages/LostPetDetail';
import Community from '@/pages/Community';
import PostDetail from '@/pages/PostDetail';
import Boarding from '@/pages/Boarding';
import PublishBoarding from '@/pages/PublishBoarding';
import RegisterCaregiver from '@/pages/RegisterCaregiver';
import BoardingMatch from '@/pages/BoardingMatch';
import BoardingOrderDetail from '@/pages/BoardingOrderDetail';
import TrainingCenter from '@/pages/TrainingCenter';
import PetTracking from '@/pages/PetTracking';
import BoardingAgreementPage from '@/pages/BoardingAgreementPage';
import AdminBoardingDashboard from '@/pages/AdminBoardingDashboard';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pet/:id" element={<PetDetail />} />
        <Route path="/publish" element={<PublishPet />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/favorites" element={<Profile />} />
        <Route path="/profile/history" element={<Profile />} />
        <Route path="/profile/mypets" element={<Profile />} />
        <Route path="/profile/applications" element={<Profile />} />
        <Route path="/profile/followups" element={<Profile />} />
        <Route path="/profile/stories" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/story/:id" element={<StoryDetail />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/lost" element={<LostPets />} />
        <Route path="/lost/register" element={<RegisterLostPet />} />
        <Route path="/lost/:id" element={<LostPetDetail />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:id" element={<PostDetail />} />
        <Route path="/boarding" element={<Boarding />} />
        <Route path="/boarding/publish" element={<PublishBoarding />} />
        <Route path="/boarding/caregiver/register" element={<RegisterCaregiver />} />
        <Route path="/boarding/match/:id" element={<BoardingMatch />} />
        <Route path="/boarding/orders/:id" element={<BoardingOrderDetail />} />
        <Route path="/boarding/training" element={<TrainingCenter />} />
        <Route path="/boarding/orders/:id/tracking" element={<PetTracking />} />
        <Route path="/boarding/orders/:id/agreement" element={<BoardingAgreementPage />} />
        <Route path="/admin/boarding-dashboard" element={<AdminBoardingDashboard />} />
      </Route>
    </Routes>
  );
}
