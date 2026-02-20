import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

const fetchReportsFromPinata = async (ipfsHash: string) => {
  const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

  try {
    const response = await axios.get(url);
    return response.data; // Return the fetched data
  } catch (error) {
    console.error('Error fetching from Pinata:', error);
    throw error;
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const client = await clerkClient(); 
    const user = await client.users.getUser(userId as string);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reports: any[] = [];
    const userReports = user.privateMetadata.reports || [];

    for (const report of userReports as string[]) {
      try {
        const reportData = await fetchReportsFromPinata(report);
        reports.push(reportData);
      } catch (error) {
        console.error(`Failed to fetch report with IPFS hash ${report}:`, error);
      }
    }

    return NextResponse.json({
      reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
} 