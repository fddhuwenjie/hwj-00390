import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import PetDetail from '@/pages/PetDetail';
import PublishPet from '@/pages/PublishPet';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import StoryDetail from '@/pages/StoryDetail';
import Stories from '@/pages/Stories';

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
        <Route path="/profile/stories" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/story/:id" element={<StoryDetail />} />
        <Route path="/stories" element={<Stories />} />
      </Route>
    </Routes>
  );
}
