import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "shared_calls.json");

function readCalls() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading calls:", error);
        return [];
    }
}

function saveCalls(calls: any[]) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(calls, null, 2));
    } catch (error) {
        console.error("Error saving calls:", error);
    }
}

export async function GET() {
    const calls = readCalls();
    return NextResponse.json(calls);
}

export async function POST(request: Request) {
    try {
        const callData = await request.json();
        const calls = readCalls();

        // Add new call with timestamp
        const newCall = {
            ...callData,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            status: "active",
        };

        calls.push(newCall);
        saveCalls(calls);

        return NextResponse.json(newCall);
    } catch (error) {
        return NextResponse.json({ error: "Failed to save call" }, { status: 500 });
    }
}
