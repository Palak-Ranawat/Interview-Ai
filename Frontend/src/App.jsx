import { RouterProvider } from 'react-router-dom';
import { router } from './app.route.jsx';
import { AuthProvider } from './features/auth/auth.context.jsx';
import { InterviewProvider } from './features/interview/interview.context.jsx';
import ThreeDBackground from './components/ThreeDBackground.jsx';

function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <div className="relative min-h-screen bg-[#0B0B0D] text-[#F8FAFC]">
          {/* Premium Immersive 3D Animated Background */}
          <ThreeDBackground />

          {/* Interactive Application Routes (Positioned safely above 3D scene) */}
          <div className="relative z-10">
            <RouterProvider router={router} />
          </div>
        </div>
      </InterviewProvider>
    </AuthProvider>
  );
}

export default App;
