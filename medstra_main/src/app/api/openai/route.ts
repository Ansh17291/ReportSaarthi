import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { currentUser, User, clerkClient, auth } from "@clerk/nextjs/server";
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import nodemailer from "nodemailer";
import bs58 from "bs58"; // Import bs58 for decoding Base58 keys
import { createHash } from 'crypto'; // Import createHash instead of sha256
import { NextApiRequest } from "next";
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_PASS, // Your Gmail password or App Password
    },
  });
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.GMAIL_USER, // Sender address
    to, // List of recipients
    subject, // Subject line
    html: html, // HTML body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

let assistant: any;
let thread: any;

async function initializeAssistant() {
  if (!assistant) {
    assistant = await openai.beta.assistants.create({
      name: "Medical Examiner Assistant",
      instructions: `You are an AI medical examiner tasked with generating comprehensive HTML reports based on the conversation history between the AI and the user. The conversation will be provided in the following format:

      [{
          sender: 'AI' | "User",
          text: ""
      }]

      Your task is to create two HTML reports and a risk assessment score:

      1. **Patient Report**:
         - Include the patient's profile information such as height, weight, BMI, smoking status, and exercise frequency.
         - Summarize the key findings from the conversation, highlighting any health concerns or recommendations made during the assessment.
         - Provide lifestyle recommendations based on the conversation.
         - Include suggested follow-up actions.
         - Ensure the report is HIPAA compliant, FDA registered, and ISO certified.
         - Format the report for PDF download with appropriate styling.

      2. **Underwriting Report**:
         - Summarize the risk assessment based on the conversation.
         - Highlight key medical findings relevant to underwriting.
         - Discuss lifestyle risk factors identified during the assessment.
         - Include any insurance implications based on the patient's profile and conversation.
         - Provide a risk classification recommendation.
         - Ensure the report is HIPAA compliant, FDA registered, and ISO certified.
         - Format the report for PDF download with appropriate styling.

      3. **Risk Assessment Score**:
         - Provide a risk assessment score based on the medical examination results, out of 100 (high being good, low being bad).

      Ensure that the reports are well-structured, easy to read, and formatted in HTML. Use appropriate HTML tags for headings, paragraphs, and lists to enhance readability. 

      Maintain a professional tone throughout the reports, and ensure that all information complies with HIPAA regulations. 

      The output should be a JSON object containing three keys: "patientReport", "underwritingReport", and "riskAssessmentScore", each containing the respective content.`,
      tools: [],
      model: "gpt-4-turbo-preview",
    });
    thread = await openai.beta.threads.create();
  }
  return { assistant, thread };
}

const sendInsuranceEmail = async (userData: User, reports: any) => {
  const insuranceEmailHtml = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .report { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
          h1 { color: #2563eb; }
          h2 { color: #1e40af; }
          .client-info { 
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .score-container { 
            text-align: center;
            padding: 20px;
            margin: 20px 0;
            background-color: #f8fafc;
            border-radius: 8px;
          }
          .score {
            font-size: 48px;
            font-weight: bold;
          }
          .score-high { color: #22c55e; }
          .score-medium { color: #eab308; }
          .score-low { color: #ef4444; }
        </style>
      </head>
      <body>
        <h1>New Medical Assessment Report</h1>
        
        <div class="client-info">
          <h2>Client Information</h2>
          <p><strong>Name:</strong> ${userData.firstName} ${userData.lastName}</p>
          <p><strong>Email:</strong> ${userData.emailAddresses[0]?.emailAddress}</p>
          <p><strong>User ID:</strong> ${userData.id}</p>
          <p><strong>Assessment Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="score-container">
          <h2>Risk Assessment Score</h2>
          <div class="score ${reports.riskAssessmentScore >= 80 ? 'score-high' : reports.riskAssessmentScore >= 60 ? 'score-medium' : 'score-low'}">
            ${reports.riskAssessmentScore}/100
          </div>
          <p>Based on medical examination results</p>
        </div>

        <div class="report">
          <h2>Patient Report</h2>
          ${reports.patientReport}
        </div>
        <div class="report">
          <h2>Underwriting Report</h2>
          ${reports.underwritingReport}
        </div>
      </body>
    </html>
  `;

  try {
    await sendEmail(
      process.env.INSURANCE_COMPANY_EMAIL || "",
      `New Medical Assessment - ${userData.firstName} ${userData.lastName}`,
      insuranceEmailHtml
    );
    console.log('Insurance company email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending insurance company email:', error);
    return false;
  }
};

// Initialize Solana connection to Devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Function to request airdrop
const requestAirdrop = async (publicKey: PublicKey) => {
  const airdropSignature = await connection.requestAirdrop(publicKey, 1e9); // Request 1 SOL
  await connection.confirmTransaction(airdropSignature);
};

// Function to import wallet from private key
const importWalletFromPrivateKey = (privateKey: string): Keypair => {
  let secretKey: Uint8Array;

  if (/^[1-9A-HJ-NP-Za-km-z]{88}$/.test(privateKey)) {
    // Base58 encoded private key
    secretKey = bs58.decode(privateKey);
  } else if (/^[0-9a-fA-F]{128}$/.test(privateKey)) {
    // Hex encoded private key
    secretKey = new Uint8Array(Buffer.from(privateKey, 'hex'));
  } else if (/^[A-Za-z0-9+/]{88}={0,2}$/.test(privateKey)) {
    // Base64 encoded private key
    secretKey = new Uint8Array(Buffer.from(privateKey, 'base64'));
  } else {
    throw new Error('Invalid private key format');
  }

  return Keypair.fromSecretKey(secretKey);
};

const MAX_CHUNK_SIZE = 500; // Set the maximum size for each chunk to 500 bytes
const MAX_TRANSACTION_SIZE = 1232; // Define the maximum size for a transaction

// Function to store report data on Solana
const storeReportOnSolana = async (reportData: any, user: User, client: any) => {
  let privateKeyHex: string | null = null;

  try {
    privateKeyHex = user.privateMetadata.privateKey as string;
  } catch (error) {
    console.error("Error getting private key:", error);
  }

  let reportKeypair: Keypair;

  if (privateKeyHex) {
    reportKeypair = importWalletFromPrivateKey(privateKeyHex as string);
  } else {
    reportKeypair = Keypair.generate();
    const privateKeyy = reportKeypair.secretKey;
    const privateKeyHexx = Array.from(privateKeyy)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

    await client.users.updateUserMetadata(user.id, {
      privateMetadata: {
        publicKey: reportKeypair.publicKey.toString(),
        privateKey: privateKeyHexx,
      },
    });
  }

  // Check balance and request airdrop if necessary
  const balance = await connection.getBalance(reportKeypair.publicKey);
  if (balance < 1e8) {
    await requestAirdrop(reportKeypair.publicKey);
  }

  // Log the report data before storing
  console.log("Report data to store:", reportData);

  // Convert report data to a string and encode it
  const reportString = JSON.stringify(reportData);
  const reportBuffer = Buffer.from(reportString);

  // Split the buffer into chunks if it exceeds the maximum size
  const chunks = [];
  for (let i = 0; i < reportBuffer.length; i += MAX_CHUNK_SIZE) {
    chunks.push(reportBuffer.slice(i, i + MAX_CHUNK_SIZE));
  }

  // Store each chunk in a separate transaction
  const userReports: string[] = [];
  for (const chunk of chunks) {
    await storeChunkOnSolana(chunk, reportKeypair, userReports);
  }

  // Store the sub-account public keys in user's metadata
  await client.users.updateUserMetadata(user.id, {
    privateMetadata: {
      publicKey: reportKeypair.publicKey.toString(),
      privateKey: privateKeyHex,
      reports: userReports,
    },
  });

  return userReports; // Return the list of public keys for the stored chunks
};

// Helper function to store a chunk on Solana
const storeChunkOnSolana = async (chunk: Buffer, reportKeypair: Keypair, userReports: string[]) => {
  const subAccountKeypair = Keypair.generate();

  // Create a transaction to store the report chunk in the sub-account
  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: reportKeypair.publicKey,
      newAccountPubkey: subAccountKeypair.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(chunk.length),
      space: chunk.length,
      programId: SystemProgram.programId,
    }),
    new TransactionInstruction({
      keys: [
        { pubkey: subAccountKeypair.publicKey, isSigner: true, isWritable: true },
      ],
      programId: SystemProgram.programId,
      data: chunk,
    })
  );

  // Sign and send the transaction
  transaction.feePayer = reportKeypair.publicKey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  // Sign with both keypairs
  transaction.sign(reportKeypair, subAccountKeypair);

  try {
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature);
    
    console.log('Chunk stored on Solana with sub-account:', subAccountKeypair.publicKey.toString());
    userReports.push(subAccountKeypair.publicKey.toString());
  } catch (error) {
    console.error('Error storing chunk:', error);
    throw error;
  }
};

// Function to derive a sub-account public key
const deriveSubAccountKey = (basePublicKey: PublicKey, uniqueIdentifier: string): PublicKey => {
  // Create a hash of the base public key and the unique identifier
  const hash = createHash('sha256')
    .update(Buffer.concat([basePublicKey.toBuffer(), Buffer.from(uniqueIdentifier)]))
    .digest();
    
  // Use the first 32 bytes of the hash to create a new public key
  return new PublicKey(hash);
};

const PINATA_API_KEY = 'dd08600661c1bdf2ea20';
const PINATA_API_SECRET = 'cd3437a2cc2fc94f143a07033b73355028e0e58f73a9a82b6ba36380c9d390d2';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmODBlMWY4Yy1mODQxLTRkMmYtODUwNC0yYjA2MzYwNzUxMDYiLCJlbWFpbCI6ImxlYm9uMTM3N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZGQwODYwMDY2MWMxYmRmMmVhMjAiLCJzY29wZWRLZXlTZWNyZXQiOiJjZDM0MzdhMmNjMmZjOTRmMTQzYTA3MDMzYjczMzU1MDI4ZTBlNThmNzNhOWE4MmI2YmEzNjM4MGM5ZDM5MGQyIiwiZXhwIjoxNzcxODEzNTQxfQ.8kI7d-nbk9YazzjvhGm14coGQtC9xtBvR5Bl4rcvDyc';

const uploadToPinata = async (reportData: any) => {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

  const data = JSON.stringify(reportData);

  const options = {
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
      Authorization: `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios.post(url, data, options);
    console.log('Successfully uploaded to Pinata:', response.data);
    return response.data; // Return the IPFS hash or any relevant data
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
};

// Function to store report data on Pinata
const storeReportOnPinata = async (reportData: any, user: User, client: any) => {
  try {
    const pinataResponse = await uploadToPinata(reportData);
    console.log('Pinata response:', pinataResponse);

    // Get existing reports from metadata or initialize empty array
    let reports: string[] = [];

    try {
      reports = user.privateMetadata.reports as string[];
    } catch (error) {
      console.error("Error getting existing reports:", error);
    }

    // Ensure reports is an array
    if (!Array.isArray(reports)) {
      reports = [];
    }

    // Add new report
    reports.push(pinataResponse.IpfsHash);

    // Update user metadata with new reports array
    await client.users.updateUserMetadata(user.id, {
      privateMetadata: {
        ...user.privateMetadata,
        reports,
      },
    });

    return pinataResponse;
  } catch (error) {
    console.error('Failed to store report on Pinata:', error);
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    const { conversation, userId } = await request.json(); // Expecting conversation data in the request body

    const client = await clerkClient();

    const user = await client.users.getUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }
  

    // Validate the conversation format
    if (!Array.isArray(conversation) || conversation.length === 0) {
      return NextResponse.json(
        { error: "Invalid conversation format" },
        { status: 400 }
      );
    }

    const { assistant, thread } = await initializeAssistant();

    // Prepare the conversation for the OpenAI API
    const formattedConversation = conversation.map(({ sender, text }) => ({
      role: sender === "AI" ? "assistant" : "user", // Adjust role for OpenAI API
      content: text,
    }));

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: JSON.stringify(formattedConversation), // Send the formatted conversation
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const lastMessage = messages.data.filter(
        (msg) => msg.role === "assistant"
      )[0];

      if (lastMessage && lastMessage.content[0].type === "text") {
        try {
          const content = lastMessage.content[0].text.value;

          // Remove the "```json" and "```" from the content
          const cleanedContent = content.replaceAll("```json", "").replaceAll("```", "");

          // Parse the cleaned content as JSON
          const reports = JSON.parse(cleanedContent);

          if (reports.patientReport && reports.underwritingReport) {
            // Store reports on Pinata
            await storeReportOnPinata(reports, user!, client!);

            // Format email HTML for user
            const emailHtml = `
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .report { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
                    h1 { color: #2563eb; }
                    h2 { color: #1e40af; }
                  </style>
                </head>
                <body>
                  <h1>Your Medical Assessment Reports</h1>
                  <p>Your reports have been securely stored on the Pinata IPFS. You can access them using the following IPFS hash:</p>
                  <p><strong>${reports.ipfsHash}</strong></p>
                  <div class="report">
                    <h2>Patient Report</h2>
                    ${reports.patientReport}
                  </div>
                  <div class="report">
                    <h2>Underwriting Report</h2>
                    ${reports.underwritingReport}
                  </div>
                </body>
              </html>
            `;

            // Send emails to both user and insurance company
            try {
              await sendEmail(
                user?.emailAddresses[0]?.emailAddress || "",
                "Your Medical Assessment Reports - Medstra",
                emailHtml
              );

              await sendInsuranceEmail(user!, reports);

              return NextResponse.json({
                reply: reports,
                emailSent: true,
              });
            } catch (emailError) {
              console.error("Error sending emails:", emailError);
            }
          }
        } catch (error) {
          console.error("Error parsing reports:", error);
        }

        return NextResponse.json({ reply: lastMessage.content[0].text.value });
      }
    }

    return NextResponse.json(
      { error: "Failed to generate reports" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error in OpenAI Assistant API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
