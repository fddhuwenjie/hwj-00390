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
      </Route>
    </Routes>
  );
}
