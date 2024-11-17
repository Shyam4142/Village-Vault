import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ssn, setSsn] = useState("");
  const [dob, setDob] = useState("");

  const navigate = useNavigate();

  const formatSSN = (value) => {
    return value
      .replace(/\D/g, '') 
      .replace(/^(\d{3})(\d{2})(\d{4})$/, '$1-$2-$3') 
      .slice(0, 11); 
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        ssn,
        dob,
        email,
        checkingBalance: 100, 
        savingsBalance: 100, 
      });

      navigate("/homepage"); 
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#7399C6]"> 
      <div className="card shadow-lg p-6 rounded-lg w-full max-w-sm bg-white">
        <h1 className="text-2xl font-semibold text-center mb-6">Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              id="firstName"
              placeholder="Enter your first name"
              onChange={(e) => setFirstName(e.target.value)}
              required
              maxLength={20} 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              id="lastName"
              placeholder="Enter your last name"
              onChange={(e) => setLastName(e.target.value)}
              required
              maxLength={20} 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="ssn" className="block text-sm font-medium text-gray-700">SSN</label>
            <input
              type="text"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              id="ssn"
              placeholder="###-##-####"
              value={ssn}
              onChange={(e) => setSsn(formatSSN(e.target.value))}
              required
              maxLength={11} 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              id="dob"
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              id="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={40} 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
            Register
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 hover:text-blue-700">Login here</Link>
        </p>
      </div>
    </div>
  );
}


