import { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import VillageBankLogo from "../assets/villagebank.jpeg";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", userCredential.user.uid);

      await updateDoc(userRef, {
        authenticationTimes: arrayUnion(new Date().toISOString())
      });

      navigate("/homepage");
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#7399C6]">
      <div className="card shadow-lg p-6 rounded-lg w-full max-w-sm bg-white">
        <div className="mb-6 flex justify-center">
          <img
            src={VillageBankLogo}
            alt="Village Bank Logo"
            className="h-29 w-auto object-contain"
          />
        </div>

        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4 relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <div className="absolute left-3 top-9 text-gray-400">
              <FaEnvelope />
            </div>
            <input
              type="email"
              className="mt-1 p-2 pl-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              id="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={40}
            />
          </div>
          <div className="mb-4 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="absolute left-3 top-9 text-gray-400">
              <FaLock />
            </div>
            <input
              type="password"
              className="mt-1 p-2 pl-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              id="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={20}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#7399C6] text-white p-2 rounded hover:bg-[#5A7DA5]"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:text-blue-700">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}