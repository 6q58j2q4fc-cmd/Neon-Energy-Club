/**
 * Blockchain NFT Minting Service for NEON Genesis Collection
 * Uses Polygon (MATIC) network for low-cost, fast NFT minting
 * 
 * This service handles:
 * - NFT contract deployment
 * - Minting NFTs on-chain
 * - Transaction tracking
 * - OpenSea metadata compatibility
 */

import { ethers } from "ethers";
import { getDb } from "./db";
import { neonNfts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Polygon network configuration
const POLYGON_MAINNET_RPC = "https://polygon-rpc.com";
const POLYGON_MUMBAI_RPC = "https://rpc-mumbai.maticvigil.com";

// Use Mumbai testnet for development, mainnet for production
const isProduction = process.env.NODE_ENV === "production";
const RPC_URL = isProduction ? POLYGON_MAINNET_RPC : POLYGON_MUMBAI_RPC;
const CHAIN_ID = isProduction ? 137 : 80001;
const NETWORK_NAME = isProduction ? "Polygon Mainnet" : "Polygon Mumbai Testnet";

// OpenSea-compatible metadata base URL
const METADATA_BASE_URL = process.env.NFT_METADATA_URL || "https://neonenergy.com/api/nft/metadata";

// ERC-721 contract ABI (minimal for minting)
const NFT_CONTRACT_ABI = [
  "function mint(address to, uint256 tokenId, string memory tokenURI) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function totalSupply() public view returns (uint256)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

// Contract bytecode for deploying new NFT contract
// This is a simplified ERC-721 implementation
const NFT_CONTRACT_BYTECODE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NEONGenesisNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _totalSupply;
    
    constructor() ERC721("NEON Genesis", "NEONG") Ownable(msg.sender) {}
    
    function mint(address to, uint256 tokenId, string memory uri) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _totalSupply++;
    }
    
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
`;

/**
 * Get blockchain provider
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
}

/**
 * Get wallet for signing transactions
 * Requires BLOCKCHAIN_PRIVATE_KEY environment variable
 */
export function getWallet(): ethers.Wallet | null {
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
  if (!privateKey) {
    console.warn("[Blockchain] No private key configured - minting disabled");
    return null;
  }
  
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Get NFT contract instance
 * Requires NFT_CONTRACT_ADDRESS environment variable
 */
export function getContract(): ethers.Contract | null {
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.warn("[Blockchain] No contract address configured");
    return null;
  }
  
  const wallet = getWallet();
  if (!wallet) return null;
  
  return new ethers.Contract(contractAddress, NFT_CONTRACT_ABI, wallet);
}

/**
 * Generate OpenSea-compatible metadata for an NFT
 */
export function generateNftMetadata(nft: {
  tokenId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  rarity: string;
  rarityRank: number;
  estimatedValue: string | null;
  ownerName: string | null;
}): object {
  return {
    name: nft.name,
    description: nft.description || `NEON Genesis NFT #${nft.tokenId}`,
    image: nft.imageUrl || `https://neonenergy.com/nft-placeholder.png`,
    external_url: `https://neonenergy.com/nft/${nft.tokenId}`,
    attributes: [
      {
        trait_type: "Rarity",
        value: nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1),
      },
      {
        trait_type: "Rarity Rank",
        value: nft.rarityRank,
        display_type: "number",
      },
      {
        trait_type: "Collection",
        value: "NEON Genesis",
      },
      {
        trait_type: "Edition",
        value: getRarityEdition(nft.rarity),
      },
    ],
    // OpenSea-specific
    seller_fee_basis_points: 250, // 2.5% royalty
    fee_recipient: process.env.ROYALTY_WALLET || "0x0000000000000000000000000000000000000000",
  };
}

/**
 * Get edition name based on rarity
 */
function getRarityEdition(rarity: string): string {
  const editions: Record<string, string> = {
    legendary: "Genesis Edition",
    epic: "Pioneer Edition",
    rare: "Founder Edition",
    uncommon: "Early Adopter Edition",
    common: "Supporter Edition",
  };
  return editions[rarity] || "Supporter Edition";
}

/**
 * Mint an NFT on the blockchain
 * Returns transaction hash on success
 */
export async function mintNftOnChain(
  tokenId: number,
  recipientAddress: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }
  
  const contract = getContract();
  if (!contract) {
    return { success: false, error: "Blockchain not configured - missing contract address or private key" };
  }
  
  try {
    // Get NFT data from database
    const nftResult = await db.select().from(neonNfts)
      .where(eq(neonNfts.tokenId, tokenId))
      .limit(1);
    
    if (!nftResult[0]) {
      return { success: false, error: "NFT not found in database" };
    }
    
    const nft = nftResult[0];
    
    // Check if already minted
    if (nft.blockchainStatus === "minted" && nft.txHash) {
      return { success: true, txHash: nft.txHash };
    }
    
    // Generate metadata URI
    const metadataUri = `${METADATA_BASE_URL}/${tokenId}`;
    
    // Mint the NFT
    console.log(`[Blockchain] Minting NFT #${tokenId} to ${recipientAddress}...`);
    const tx = await contract.mint(recipientAddress, tokenId, metadataUri);
    
    // Wait for confirmation
    console.log(`[Blockchain] Waiting for transaction ${tx.hash}...`);
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      // Update database with blockchain info
      await db.update(neonNfts)
        .set({
          txHash: tx.hash,
          blockchainStatus: "minted",
          mintedAt: new Date().toISOString(),
        })
        .where(eq(neonNfts.tokenId, tokenId));
      
      console.log(`[Blockchain] NFT #${tokenId} minted successfully! TX: ${tx.hash}`);
      return { success: true, txHash: tx.hash };
    } else {
      return { success: false, error: "Transaction failed" };
    }
  } catch (error: any) {
    console.error(`[Blockchain] Minting failed:`, error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

/**
 * Check if an NFT is minted on-chain
 */
export async function checkNftOnChain(tokenId: number): Promise<{
  exists: boolean;
  owner?: string;
  tokenUri?: string;
}> {
  const contract = getContract();
  if (!contract) {
    return { exists: false };
  }
  
  try {
    const owner = await contract.ownerOf(tokenId);
    const tokenUri = await contract.tokenURI(tokenId);
    return { exists: true, owner, tokenUri };
  } catch {
    return { exists: false };
  }
}

/**
 * Get blockchain network info
 */
export function getNetworkInfo(): {
  network: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  openseaUrl: string;
} {
  return {
    network: NETWORK_NAME,
    chainId: CHAIN_ID,
    rpcUrl: RPC_URL,
    explorerUrl: isProduction
      ? "https://polygonscan.com"
      : "https://mumbai.polygonscan.com",
    openseaUrl: isProduction
      ? "https://opensea.io/assets/matic"
      : "https://testnets.opensea.io/assets/mumbai",
  };
}

/**
 * Get OpenSea URL for an NFT
 */
export function getOpenSeaUrl(tokenId: number): string {
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  if (!contractAddress) return "";
  
  const { openseaUrl } = getNetworkInfo();
  return `${openseaUrl}/${contractAddress}/${tokenId}`;
}

/**
 * Get PolygonScan URL for a transaction
 */
export function getExplorerUrl(txHash: string): string {
  const { explorerUrl } = getNetworkInfo();
  return `${explorerUrl}/tx/${txHash}`;
}

/**
 * Batch mint multiple NFTs
 */
export async function batchMintNfts(
  tokenIds: number[],
  recipientAddress: string
): Promise<{ successful: number[]; failed: { tokenId: number; error: string }[] }> {
  const successful: number[] = [];
  const failed: { tokenId: number; error: string }[] = [];
  
  for (const tokenId of tokenIds) {
    const result = await mintNftOnChain(tokenId, recipientAddress);
    if (result.success) {
      successful.push(tokenId);
    } else {
      failed.push({ tokenId, error: result.error || "Unknown error" });
    }
    
    // Small delay between mints to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return { successful, failed };
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  try {
    ethers.getAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get wallet balance (for checking if minting is possible)
 */
export async function getWalletBalance(): Promise<string> {
  const wallet = getWallet();
  if (!wallet) return "0";
  
  try {
    const balance = await wallet.provider?.getBalance(wallet.address);
    return ethers.formatEther(balance || 0);
  } catch {
    return "0";
  }
}
