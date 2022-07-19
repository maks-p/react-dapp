import "./App.css";
import { useState } from "react";
import { ethers } from "ethers";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import Token from "./artifacts/contracts/Token.sol/Token.json";
import NDToken from "./artifacts/contracts/NDToken.sol/NDToken.json";

// Update with the contract address logged out to the CLI when it was deployed
const greeterAddress = "0x75F9745e27911ad0821388e730e8032e3F82cCD4";
const tokenAddress = "0xdAbc736F6d50bb0c2593c1d1e86a30AD0B910990";
const ndTokenAddress = "0xCeCF9272673bff04AE329Fe9c21DF81A149B73f2";

function App() {
  // store greeting in local state
  const [greeting, setGreetingValue] = useState<string>();
  const [onChainGreeting, setOnChainGreeting] = useState<string>();
  const [userAccount, setUserAccount] = useState<string>();
  const [amount, setAmount] = useState<number>();
  const [balance, setBalance] = useState<number>();

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  // call the smart contract, read the current greeting value
  async function fetchGreeting() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        greeterAddress,
        Greeter.abi,
        provider
      );
      try {
        const data = await contract.greet();
        console.log("data: ", data);
        setOnChainGreeting(data);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        ndTokenAddress,
        NDToken.abi,
        provider
      );
      const balance = await contract.balanceOf(account);
      console.log("Balance: ", balance.toString());
      setBalance(balance);
    }
  }

  // call the smart contract, send an update
  async function setGreeting() {
    if (!greeting) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
      const transaction = await contract.setGreeting(greeting);
      await transaction.wait();
      fetchGreeting();
    }
  }

  async function sendCoins() {
    if (typeof window.ethereum !== "undefined" && amount) {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ndTokenAddress, NDToken.abi, signer);
      const transaction = await contract.transfer(
        userAccount,
        ethers.utils.parseUnits(amount.toString(), 18)
      );
      await transaction.wait();
      console.log(`${amount} Coins successfully sent to ${userAccount}`);
      getBalance();
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>{onChainGreeting}</h2>
        <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>
        <input
          onChange={(e) => setGreetingValue(e.target.value)}
          placeholder="Set greeting"
        />
        <br />
        <h3>Interacting with NDToken ERC-20:</h3>
        {balance && <p>Balance: {(balance / 10 ** 18).toFixed()}</p>}
        <button onClick={getBalance}>Get Balance</button>
        <button onClick={sendCoins}>Send Coins</button>
        <input
          onChange={(e) => setUserAccount(e.target.value)}
          placeholder="Account ID"
        />
        <input
          onChange={(e) => setAmount(e.target.value as unknown as number)}
          placeholder="Amount"
        />
      </header>
    </div>
  );
}

export default App;
