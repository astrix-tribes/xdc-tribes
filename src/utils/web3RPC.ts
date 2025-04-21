import { ethers } from "ethers";
import { SafeEventEmitterProvider } from "@web3auth/base";

export default class EthereumRpc {
  private provider: SafeEventEmitterProvider;

  constructor(provider: SafeEventEmitterProvider) {
    this.provider = provider;
  }

  async getChainId(): Promise<string> {
    try {
      const ethersProvider = new ethers.BrowserProvider(this.provider);
      const networkDetails = await ethersProvider.getNetwork();
      return networkDetails.chainId.toString();
    } catch (error) {
      console.error("Error getting chain ID:", error);
      throw error;
    }
  }

  async getAccounts(): Promise<string> {
    try {
      const ethersProvider = new ethers.BrowserProvider(this.provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      return address;
    } catch (error) {
      console.error("Error getting accounts:", error);
      throw error;
    }
  }

  async getBalance(): Promise<string> {
    try {
      const ethersProvider = new ethers.BrowserProvider(this.provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const balance = await ethersProvider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  }

  async sendTransaction(to: string, amount: string): Promise<any> {
    try {
      const ethersProvider = new ethers.BrowserProvider(this.provider);
      const signer = await ethersProvider.getSigner();
      const transaction = {
        to,
        value: ethers.parseEther(amount),
        gasLimit: 100000,
      };
      const receipt = await signer.sendTransaction(transaction);
      return receipt;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    try {
      const ethersProvider = new ethers.BrowserProvider(this.provider);
      const signer = await ethersProvider.getSigner();
      const signedMessage = await signer.signMessage(message);
      return signedMessage;
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  }

  async getPrivateKey(): Promise<string> {
    try {
      const privateKey = await this.provider.request({
        method: "eth_private_key",
      }) as string;
      return privateKey;
    } catch (error) {
      console.error("Error getting private key:", error);
      throw error;
    }
  }
} 