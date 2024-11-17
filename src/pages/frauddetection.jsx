import { useState, useEffect } from "react";
import { Navbar } from "../components/navbar";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export function FraudDetection() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [authTimes, setAuthTimes] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFirstName(userData.firstName);
          setEmail(userData.email);
          setAuthTimes(userData.authenticationTimes.sort((a, b) => new Date(b) - new Date(a)));
        }
      }
    };

    fetchUserData();
  }, []);

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar firstName={firstName} isHomepage={false} />
      <div className="max-w-4xl mx-auto pt-20 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Authentication History</h2>
          <div className="mb-4">
            <p className="text-lg font-medium">Email: {email}</p>
          </div>
          <div className="space-y-2">
            {authTimes.map((time, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                <span className="text-gray-600">Authentication #{authTimes.length - index}</span>
                <span className="font-medium">{formatDateTime(time)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}