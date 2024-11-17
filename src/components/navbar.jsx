import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { FaSignOutAlt, FaHome } from "react-icons/fa";

export function Navbar({ firstName, isHomepage }) {
  const navigate = useNavigate();

  const handleSignOut = () => signOut(auth);
  const handleHomeRedirect = () => navigate("/homepage");

  return (
    <nav className="bg-[#7399C6] p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-white text-xl font-bold">Village Vault</span>
        <div className="flex items-center space-x-4">
          <span className="text-white">Welcome, {firstName || "User"}</span>
          {isHomepage ? (
            <button onClick={handleSignOut} className="text-white hover:bg-[#5A7DA5] px-4 py-2 rounded-lg flex items-center">
              <FaSignOutAlt className="mr-2" /> Sign Out
            </button>
          ) : (
            <button onClick={handleHomeRedirect} className="text-white hover:bg-[#5A7DA5] px-4 py-2 rounded-lg flex items-center">
              <FaHome className="mr-2" /> Home
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}