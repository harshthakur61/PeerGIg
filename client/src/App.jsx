import { Navigate, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import LandingPage from "./pages/LandingPage"
import AuthPage from "./pages/AuthPage"
import ExplorePage from "./pages/ExplorePage"
import GigDetailPage from "./pages/GigDetailPage"
import SessionRoom from "./pages/SessionRoom"
import TutorDashboard from "./pages/tutor/TutorDashboard"
import CreateGig from "./pages/tutor/CreateGig"
import ManageGigs from "./pages/tutor/ManageGigs"
import TutorBookings from "./pages/tutor/TutorBookings"
import TutorWallet from "./pages/tutor/TutorWallet"
import LearnerDashboard from "./pages/learner/LearnerDashboard"
import MyBookings from "./pages/learner/MyBookings"
import LearnerWallet from "./pages/learner/LearnerWallet"

export default function App() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/gig/:id" element={<GigDetailPage />} />
        <Route
          path="/session/:bookingId"
          element={
            <ProtectedRoute>
              <SessionRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/dashboard"
          element={
            <ProtectedRoute>
              <TutorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/gigs/create"
          element={
            <ProtectedRoute>
              <CreateGig />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/gigs/:id/edit"
          element={
            <ProtectedRoute>
              <CreateGig />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/gigs"
          element={
            <ProtectedRoute>
              <ManageGigs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/bookings"
          element={
            <ProtectedRoute>
              <TutorBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/wallet"
          element={
            <ProtectedRoute>
              <TutorWallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner/dashboard"
          element={
            <ProtectedRoute>
              <LearnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner/bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner/wallet"
          element={
            <ProtectedRoute>
              <LearnerWallet />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
