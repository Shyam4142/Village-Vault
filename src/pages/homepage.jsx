import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { FaMoneyBillWave, FaPiggyBank, FaCreditCard, FaHistory, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import { Navbar } from "../components/navbar";

export function HomePage() {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [checkingBalance, setCheckingBalance] = useState(0);
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await Promise.all([fetchUserData(user), fetchRecentTransactions()]);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserData = async (user) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFirstName(userData.firstName);
        setCheckingBalance(userData.checkingBalance || 0);
        setSavingsBalance(userData.savingsBalance || 0);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const transactionsRef = collection(db, "transactions");
      const transactionsQuery = query(transactionsRef, orderBy("date", "desc"), limit(3));
      const querySnapshot = await getDocs(transactionsQuery);

      const userEmail = auth.currentUser.email;
      const recentTransactionsList = [];

      querySnapshot.forEach((doc) => {
        const transaction = doc.data();
        const isRelevant = transaction.senderEmail === userEmail || transaction.receiverEmail === userEmail;

        if (isRelevant) {
          const isOutgoing = transaction.senderEmail === userEmail;

          recentTransactionsList.push({
            id: doc.id,
            description: transaction.description || 'No description',
            date: transaction.date,
            amount: transaction.amount,
            type: isOutgoing ? 'sent' : 'received',
            formattedAmount: isOutgoing ? -transaction.amount : transaction.amount,
            paymentType: isOutgoing ? 'Payment Sent' : 'Payment Received'
          });
        }
      });

      setRecentTransactions(recentTransactionsList);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (transaction) => {
    return `${transaction.type === 'sent' ? '-' : '+'}$${Math.abs(transaction.formattedAmount).toFixed(2)}`;
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar firstName={firstName} isHomepage={true} />
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h5 className="text-xl font-semibold flex items-center">
              <FaMoneyBillWave className="mr-2 text-[#7399C6]" /> Checking Account
            </h5>
            <h2 className="text-3xl font-bold">${checkingBalance.toFixed(2)}</h2>
            <small className="text-gray-500">Available Balance</small>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h5 className="text-xl font-semibold flex items-center">
              <FaPiggyBank className="mr-2 text-[#7399C6]" /> Savings Account
            </h5>
            <h2 className="text-3xl font-bold">${savingsBalance.toFixed(2)}</h2>
            <small className="text-gray-500">Available Balance</small>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-2xl font-semibold mb-4">Quick Actions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/transfermoney" className="bg-white p-6 rounded-lg shadow-md cursor-pointer text-center hover:bg-gray-100">
              <FaCreditCard className="text-[#7399C6] mb-4 text-3xl mx-auto" />
              <h5 className="text-xl font-semibold">Transfer Money</h5>
              <p className="text-gray-500">Send money between accounts or other users</p>
            </Link>
            <Link to="/transactionhistory" className="bg-white p-6 rounded-lg shadow-md cursor-pointer text-center hover:bg-gray-100">
              <FaHistory className="text-[#7399C6] mb-4 text-3xl mx-auto" />
              <h5 className="text-xl font-semibold">Transfer History</h5>
              <p className="text-gray-500">View your recent transfers</p>
            </Link>
            <Link to="/frauddetection" className="bg-white p-6 rounded-lg shadow-md cursor-pointer text-center hover:bg-gray-100">
              <FaShieldAlt className="text-[#7399C6] mb-4 text-3xl mx-auto" />
              <h5 className="text-xl font-semibold">Fraud Detection</h5>
              <p className="text-gray-500">Ensure your identity is secure</p>
            </Link>
          </div>
        </div>

        <div>
          <h5 className="text-2xl font-semibold mb-4">Recent Transfers</h5>
          <div className="bg-white rounded-lg shadow-md">
            <div className="list-group">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <div key={index} className="list-group-item flex justify-between items-center p-4 border-b last:border-b-0">
                    <div className="text-gray-500 text-sm flex-1 text-center"> 
                      <small>{formatDate(transaction.date)}</small>
                    </div>
                    <div className="text-sm flex-1 text-center"> 
                      <h6 className="font-semibold">{transaction.description}</h6>
                    </div>
                    <div className="text-sm flex-1 text-center"> 
                      <span className={transaction.type === 'sent' ? "text-red-600" : "text-green-600"}>
                        {formatAmount(transaction)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No recent transfers
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
