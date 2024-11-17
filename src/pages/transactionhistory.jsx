import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, getDocs, doc, getDoc } from "firebase/firestore";
import { FaHistory } from 'react-icons/fa';
import { Navbar } from "../components/navbar";

export function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!auth.currentUser?.email) {
        console.log('No user email found');
        navigate("/login");
        return;
      }

      try {
        const transactionsRef = collection(db, "transactions");
        const querySnapshot = await getDocs(query(transactionsRef));
        
        const userTransactions = [];
        const userEmail = auth.currentUser.email;

        const processAccountType = (type) => {
          return type === 'checking' ? "Checking" : type === 'savings' ? "Savings" : "Unknown";
        };

        querySnapshot.forEach((doc) => {
          const transaction = doc.data();
          
          const processedTransaction = {
            ...transaction,
            id: doc.id,
            senderAccount: processAccountType(transaction.senderAccount),
            receiverAccount: processAccountType(transaction.receiverAccount),
          };
          
          if (transaction.senderEmail === userEmail) {
            userTransactions.push({
              ...processedTransaction,
              type: 'sent',
              formattedAmount: -transaction.amount
            });
          } else if (transaction.receiverEmail === userEmail) {
            userTransactions.push({
              ...processedTransaction,
              type: 'received',
              formattedAmount: transaction.amount
            });
          }
        });

        userTransactions.sort((a, b) => 
          (b.date?.toDate?.() || 0) - (a.date?.toDate?.() || 0)
        );

        setTransactions(userTransactions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    };

    const fetchUserName = async (userId) => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setFirstName(userDoc.data().firstName || "User");
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        await Promise.all([fetchUserName(user.uid), fetchTransactions()]);
      } else {
        console.log('No user authenticated, redirecting to login');
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const formatDate = (date) => {
    if (!date?.toDate) return 'Invalid date';
    return date.toDate().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar firstName={firstName} isHomepage={false} />

      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <FaHistory className="text-[#7399C6] text-2xl mr-2" />
          <h1 className="text-2xl font-semibold">Transfer History</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No transactions found.</p>
              <p className="text-sm mt-2">Any sent or received payments will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-1">
                      <div className="font-semibold flex items-center">
                        {transaction.type === 'sent' ? 'Payment Sent' : 'Payment Received'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.description || 'No description'}
                      </div>
                    </div>

                    <div className="flex-1 text-sm text-gray-500 flex flex-col space-y-2">
                      <div className="border-b pb-2">
                        <p className="font-medium mb-1">Sender:</p>
                        <p>{transaction.senderEmail}</p>
                        <p>{transaction.senderAccount} Account</p>
                      </div>
                      
                      <div className="pt-1">
                        <p className="font-medium mb-1">Receiver:</p>
                        <p>{transaction.receiverEmail}</p>
                        <p>{transaction.receiverAccount} Account</p>
                      </div>
                    </div>

                    <div className="flex items-start justify-end">
                      <span className={`font-bold ${
                        transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'sent' ? '-' : '+'}$
                        {Math.abs(transaction.formattedAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
