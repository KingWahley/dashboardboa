import { firebaseConfig } from './firebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load balance from localStorage or set default
let balance = parseInt(localStorage.getItem("balance")) || 84000000;
const balanceEl = document.getElementById("balance");
const transactionList = document.getElementById("transactionList");
balanceEl.textContent = balance;

// Handle transfer
document.getElementById("transferForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const amount = parseInt(document.getElementById("amount").value);
  const recipient = document.getElementById("recipient").value.trim();

  if (amount > balance) {
    alert("Not enough balance!");
    return;
  }

  // Deduct from balance
  balance -= amount;
  balanceEl.textContent = balance;

  // Save balance to localStorage so it persists after refresh
  localStorage.setItem("balance", balance);

  // Save transaction to Firestore
  try {
    await addDoc(collection(db, "transactions"), {
      recipient,
      amount,
      status: "Pending Withdrawal",
      timestamp: new Date()
    });
    document.getElementById("transferForm").reset();
  } catch (error) {
    console.error("Error adding transaction:", error);
  }
});

// Real-time transaction updates
const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
  transactionList.innerHTML = ""; // Clear previous transactions

  snapshot.forEach((doc) => {
    const data = doc.data();

    // Create main container div
    const div = document.createElement("div");
    div.className = "flex flex-col border-b pb-2";

    // Top row: recipient & amount
    const topRow = document.createElement("div");
    topRow.className = "flex justify-between";

    const recipientSpan = document.createElement("span");
    recipientSpan.innerHTML = `debit to <span class="px-10">${data.recipient}</span>`;

    const amountSpan = document.createElement("span");
    amountSpan.className = "text-red-500";
    amountSpan.textContent = `- $${data.amount}`;

    topRow.appendChild(recipientSpan);
    topRow.appendChild(amountSpan);

    // Bottom row: date & description
    const bottomRow = document.createElement("div");
    bottomRow.className = "flex justify-between text-gray-500 text-xs";

    const dateSpan = document.createElement("span");
    const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
    dateSpan.textContent = timestamp.toISOString().split("T")[0];

    const descSpan = document.createElement("span");
    descSpan.textContent = `Description: ${data.description || data.status || ""}`;

    bottomRow.appendChild(dateSpan);
    bottomRow.appendChild(descSpan);

    // Append rows to main div
    div.appendChild(topRow);
    div.appendChild(bottomRow);

    // Append main div to transaction list
    transactionList.appendChild(div);
  });
});



// Elements
const transaction = document.getElementById('transaction');
const transactionForm = document.getElementById('transactionForm');

// Open functions
window.openTransaction = function() {
  transaction.classList.remove('hidden');
}

window.openTransactionForm = function() {
  transactionForm.classList.remove('hidden');
}

// Close functions
window.closeTransaction = function() {
  transaction.classList.add('hidden');
}

window.closeTransactionForm = function() {
  transactionForm.classList.add('hidden');
}

// Optional: close when clicking outside the modal/form
transaction.addEventListener('click', (e) => {
  if (e.target === transaction) {
    window.closeTransaction();
  }
});

transactionForm.addEventListener('click', (e) => {
  if (e.target === transactionForm) {
    window.closeTransactionForm();
  }
});
