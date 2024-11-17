import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Navbar } from "../components/navbar";

export function TransferMoney() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fromAccount, setFromAccount] = useState("checking");
  const [toAccount, setToAccount] = useState("savings");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isExternalTransfer, setIsExternalTransfer] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFirstName(userData.firstName || "User");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserName();
  }, []);

  const handleTransfer = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid transfer amount.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to perform a transfer.");
        return;
      }

      const transferAmount = parseFloat(amount);
      const actualRecipientEmail = isExternalTransfer ? recipientEmail : user.email;

      if (!isExternalTransfer && fromAccount === toAccount) {
        setError("You cannot transfer money to the same account.");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setError("User data not found.");
        return;
      }

      const userData = userDoc.data();

      const senderBalance = fromAccount === "checking" ? userData.checkingBalance : userData.savingsBalance;
      if (transferAmount > senderBalance) {
        setError(`Insufficient funds in ${fromAccount} account.`);
        return;
      }

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", actualRecipientEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Recipient not found.");
        return;
      }

      const recipientDoc = querySnapshot.docs[0];
      const recipientData = recipientDoc.data();
      const recipientId = recipientDoc.id;

      const senderUpdate = {
        [`${fromAccount}Balance`]: senderBalance - transferAmount
      };

      const recipientAccountType = isExternalTransfer ? toAccount : toAccount;
      const recipientUpdate = {
        [`${recipientAccountType}Balance`]: recipientData[`${recipientAccountType}Balance`] + transferAmount
      };

      const transactionData = {
        amount: transferAmount,
        description,
        date: serverTimestamp(),
        type: isExternalTransfer ? "external_transfer" : "internal_transfer",
        senderId: user.uid,
        receiverId: recipientId,
        senderAccount: fromAccount,
        receiverAccount: recipientAccountType,
        senderEmail: user.email,
        receiverEmail: actualRecipientEmail
      };

      const batch = writeBatch(db);
      batch.update(doc(db, "users", user.uid), senderUpdate);
      batch.update(doc(db, "users", recipientId), recipientUpdate);
      batch.set(doc(collection(db, "transactions")), transactionData);

      await batch.commit();

      setSuccessMessage("Transfer completed successfully.");
      setAmount("");
      setDescription("");
      setRecipientEmail("");
    } catch (err) {
      setError("Error processing transfer: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar firstName={firstName} isHomepage={false} />

      <div className="flex justify-center items-center flex-grow">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Transfer Money</h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

          <div className="mb-4">
            <label className="block text-gray-700">Amount</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to transfer"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setDescription(e.target.value);
                }
              }}
              placeholder="Enter a description for the transfer"
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="externalTransfer"
              checked={isExternalTransfer}
              onChange={() => setIsExternalTransfer(!isExternalTransfer)}
              className="mr-2"
            />
            <label htmlFor="externalTransfer" className="text-gray-700">External Transfer</label>
          </div>

          {isExternalTransfer && (
            <div className="mb-4">
              <label className="block text-gray-700">Recipient's Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient's email"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700">From Account</label>
            <select
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">To Account</label>
            <select
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleTransfer}
              className="bg-[#5A7DA5] text-white p-2 w-full rounded hover:bg-[#3F5B74]"
            >
              Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
