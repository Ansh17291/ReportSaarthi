import { JSX, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import protobuf from "protobufjs";
import { Room, RoomEvent, VideoPresets } from "livekit-client";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";

const jsonDescriptor = {
  options: {
    syntax: "proto3",
  },
  nested: {
    pipecat: {
      nested: {
        TextFrame: {
          fields: {
            id: {
              type: "uint64",
              id: 1,
            },
            name: {
              type: "string",
              id: 2,
            },
            text: {
              type: "string",
              id: 3,
            },
          },
        },
        AudioRawFrame: {
          fields: {
            id: {
              type: "uint64",
              id: 1,
            },
            name: {
              type: "string",
              id: 2,
            },
            audio: {
              type: "bytes",
              id: 3,
            },
            sampleRate: {
              type: "uint32",
              id: 4,
            },
            numChannels: {
              type: "uint32",
              id: 5,
            },
          },
        },
        TranscriptionFrame: {
          fields: {
            id: {
              type: "uint64",
              id: 1,
            },
            name: {
              type: "string",
              id: 2,
            },
            text: {
              type: "string",
              id: 3,
            },
            userId: {
              type: "string",
              id: 4,
            },
            timestamp: {
              type: "string",
              id: 5,
            },
          },
        },
        Frame: {
          oneofs: {
            frame: {
              oneof: ["text", "audio", "transcription"],
            },
          },
          fields: {
            text: {
              type: "TextFrame",
              id: 1,
            },
            audio: {
              type: "AudioRawFrame",
              id: 2,
            },
            transcription: {
              type: "TranscriptionFrame",
              id: 3,
            },
          },
        },
      },
    },
  },
};

const API_CONFIG = {
  serverUrl: "https://api.heygen.com",
  liveKitUrl: "wss://medstra-z001bo9s.livekit.cloud",
  liveKitApiKey: "APIFb4ihRTGinuQ",
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export enum Language {
  Bulgarian = "bg",
  Chinese = "zh",
  Czech = "cs",
  Danish = "da",
  Dutch = "nl",
  English = "en",
  Finnish = "fi",
  French = "fr",
  German = "de",
  Greek = "el",
  Hindi = "hi",
  Hungarian = "hu",
  Indonesian = "id",
  Italian = "it",
  Japanese = "ja",
  Korean = "ko",
  Malay = "ms",
  Norwegian = "no",
  Polish = "pl",
  Portuguese = "pt",
  Romanian = "ro",
  Russian = "ru",
  Slovak = "sk",
  Spanish = "es",
  Swedish = "sv",
  Turkish = "tr",
  Ukrainian = "uk",
  Vietnamese = "vi",
}

export function convertFloat32ToS16PCM(float32Array: Float32Array) {
  const int16Array = new Int16Array(float32Array.length);

  for (let i = 0; i < float32Array.length; i++) {
    const clampedValue = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] =
      clampedValue < 0 ? clampedValue * 32768 : clampedValue * 32767;
  }
  return int16Array;
}

// export default function InteractiveAvatar({ preAssessmentData }: { preAssessmentData: {
//   height: string;
//   weight: string;
//   smoker: boolean;
//   exerciseFrequency: string;
// }  }) {
//   const [isLoadingSession, setIsLoadingSession] = useState(false);
//   const [stream, setStream] = useState<MediaStream>();
//   const [sessionInfo, setSessionInfo] = useState<any>(null);
//   const [room, setRoom] = useState<Room | null>(null);
//   const mediaStream = useRef<HTMLVideoElement>(null);
//   const webSocket = useRef<WebSocket | null>(null);
//   const [micStream, setMicStream] = useState<MediaStream | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   async function getSessionToken() {
//     const response = await fetch("/api/get-access-token", {
//       method: "POST",
//     });
//     const token = await response.text();
//     return token;
//   }

//   async function createSession(token: string) {
//     // Create new session
//     const response = await fetch(`${API_CONFIG.serverUrl}/v1/streaming.new`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         version: "v2",
//         avatar_name: "Ann_Doctor_Sitting_public", // Use the specified avatar name
//       }),
//     });

//     const data = await response.json();

//     const sessionInfo = data.data;

//     // Start streaming
//     await fetch(`${API_CONFIG.serverUrl}/v1/streaming.start`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         session_id: sessionInfo.session_id,
//       }),
//     });

//     return sessionInfo;
//   }

//   async function connectWebSocket(sessionId: string, token: string) {
//     const params = new URLSearchParams({
//       session_id: sessionId,
//       session_token: token,
//       silence_response: "false",
//       stt_language: "en",
//     });

//     const wsUrl = `wss://${new URL(API_CONFIG.serverUrl).hostname}/v1/ws/streaming.chat?${params}`;
//     webSocket.current = new WebSocket(wsUrl);

//     webSocket.current.addEventListener("message", async (event) => {
//       console.log("Received message:", event.data);

//       const data = JSON.parse(event.data);
//       if (data.type === "transcript") {
//         console.log("Received transcript:", data.text);

//         const response = await fetch("/api/openai", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             prompt: data.text,
//             preAssessmentData
//           }),
//         });

//         const { reply } = await response.json();
//         console.log("OpenAI response:", reply);
//         await sendText(reply);
//       }
//     });
//   }

//   async function sendText(text: string) {
//     if (!sessionInfo) return;

//     await fetch(`${API_CONFIG.serverUrl}/v1/streaming.task`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${sessionInfo.token}`,
//       },
//       body: JSON.stringify({
//         session_id: sessionInfo.session_id,
//         text,
//         task_type: "talk",
//       }),
//     });
//   }

//   async function requestMicrophoneAccess() {
//     try {
//       console.log('Requesting microphone access...');
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       console.log('Microphone access granted');
//       setMicStream(stream);
//       return stream;
//     } catch (error) {
//       console.error('Error accessing microphone:', error);
//       throw error;
//     }
//   }

//   async function startSession() {
//     setIsLoadingSession(true);
//     try {
//       // Request microphone access first
//       await requestMicrophoneAccess();

//       const token = await getSessionToken();
//       const session = await createSession(token);
//       setSessionInfo(session);
//       setToken(token);

//       const newRoom = new Room({
//         // Enable audio processing for speech recognition
//         audioCaptureDefaults: {
//           autoGainControl: true,
//           echoCancellation: true,
//           noiseSuppression: true,
//         }
//       });

//       await newRoom.connect(session.url, session.access_token);
//       setRoom(newRoom);

//       // Publish the microphone track to the room
//       if (micStream) {
//         await newRoom.localParticipant.publishTrack(micStream.getAudioTracks()[0]);
//       }

//       newRoom.on(RoomEvent.TrackSubscribed, (track) => {
//         if (track.kind === "video" || track.kind === "audio") {
//           const mediaStream = new MediaStream([track.mediaStreamTrack]);
//           setStream(mediaStream);
//         }
//       });

//       await connectWebSocket(session.session_id, token);

//     } catch (error) {
//       console.error("Error starting session:", error);
//     } finally {
//       setIsLoadingSession(false);
//     }
//   }

//   async function endSession() {
//     if (sessionInfo) {
//       await fetch(`${API_CONFIG.serverUrl}/v1/streaming.stop`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           session_id: sessionInfo.session_id,
//         }),
//       });

//       if (webSocket.current) {
//         webSocket.current.close();
//       }
//       if (room) {
//         room.disconnect();
//       }
//       setStream(undefined);
//       setSessionInfo(null);
//     }
//   }

//   useEffect(() => {
//     if (stream && mediaStream.current) {
//       mediaStream.current.srcObject = stream;
//       mediaStream.current.play();
//     }
//   }, [stream]);

//   return (
//     <Card className="overflow-hidden">
//       <div className="flex flex-col">
//         <div className="relative aspect-video bg-muted">
//           {stream && (
//             <video
//               ref={mediaStream}
//               autoPlay
//               playsInline
//               className="w-full h-full object-cover"
//             />
//           )}
//           {isLoadingSession && (
//             <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
//               <motion.div
//                 className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//               />
//             </div>
//           )}
//         </div>

//         <div className="grid grid-cols-1 gap-4 p-4">
//           <div className="flex gap-2">
//             {!sessionInfo ? (
//               <Button onClick={startSession} className="w-full">
//                 Start Session
//               </Button>
//             ) : (
//               <Button onClick={endSession} variant="destructive" className="w-full">
//                 End Session
//               </Button>
//             )}
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }

export default function InteractiveAvatar({
  preAssessmentData,
}: {
  preAssessmentData: {
    height: number;
    weight: number;
    smoker: boolean;
    exerciseFrequency: string;
    type: string;
    language: Language;
    medicalReportText?: string;
  };
}) {
  console.log(preAssessmentData);
  
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);
  const mediaStream = useRef<HTMLVideoElement>(null);
  const [acceptMessages, setAcceptMessages] = useState(true);
  const [message, setMessage] = useState<string>("");
  const { user } = useUser();

  // Update the type definition for messageStream
  type Message = {
    sender: string;
    text: string | JSX.Element; // Allow text to be either a string or a JSX element
  };

  const [messageStream, setMessageStream] = useState<Message[]>([]);

  async function fetchAccessToken() {
    const response = await fetch("/api/get-access-token", { method: "POST" });
    const token = await response.text();
    return token;
  }

  async function startSession() {
    setIsLoadingSession(true);
    let currentMessage = ""; // Store the current message being built
    let currentTaskId = ""; // Track the current task ID

    let messages = [];

    try {
      const token = await fetchAccessToken();
      const newAvatar = new StreamingAvatar({ token });

      newAvatar.on(StreamingEvents.STREAM_READY, (event) => {
        setStream(event.detail);
      });

      // Collect partial messages while avatar is talking
      newAvatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        const { message, task_id } = event.detail;

        // If this is a new task, reset the current message
        if (task_id !== currentTaskId) {
          currentMessage = "";
          currentTaskId = task_id;
          // Add a new message entry for the AI
          setMessageStream((prev) => [...prev, { sender: "AI", text: "" }]);
        }

        // Append the new partial message
        currentMessage += message;

        // Update the last AI message with the current accumulated text
        setMessageStream((prev) => {
          const newStream = [...prev];
          if (newStream.length > 0) {
            const lastMessage = newStream[newStream.length - 1];
            if (lastMessage.sender === "AI") {
              lastMessage.text = currentMessage;
            }
          }
          return newStream;
        });
      });

      // Process the complete message when avatar stops talking
      newAvatar.on(StreamingEvents.AVATAR_STOP_TALKING, async () => {
        console.log("Complete message:", currentMessage);

        messages.push({
          sender: "AI",
          text: currentMessage,
        });

        // Check if the message contains the report generation tag
        if (
          currentMessage.toLowerCase().includes("generating") ||
          currentMessage.toLowerCase().includes("generating reports") ||
          currentMessage.toLowerCase().includes("patient report") ||
          currentMessage.toLowerCase().includes("underwriting report") ||
          currentMessage.toLowerCase().includes("generate") ||
          currentMessage.toLowerCase().includes("report") ||
          currentMessage.toLowerCase().includes("reports") ||
          currentMessage.toLowerCase().includes("generate report")
        ) {
          // Process report generation here

          // Send request to openai
          const response = await fetch("/api/openai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversation: messages,
              userId: user?.id,
            }),
          });

          const { reply } = await response.json();

          console.log("OpenAI response:", reply);

          await newAvatar.speak({
            text: "Your report has been added to the reports section under your profile, as well as it has been sent to your email and your insurance provider. Thank you for using Medstra!",
            taskType: TaskType.REPEAT,
            taskMode: TaskMode.SYNC,
          });
        }

        // Reset the message buffer
        currentMessage = "";
        currentTaskId = "";

        await newAvatar.startVoiceChat({
          useSilencePrompt: true, // Enable silence prompts
        });

        await newAvatar.startListening();
      });

      // Handle when the user ends their message
      newAvatar.on(StreamingEvents.USER_END_MESSAGE, async () => {
        console.log("User ended message");

        // Close voice chat when the user ends their message
        await newAvatar.closeVoiceChat();

        await newAvatar.stopListening();
      });

      newAvatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log("User talking message", event.detail.message);

        messages.push({
          sender: "User",
          text: event.detail.message,
        });

        setMessageStream((prev) => [...prev, { sender: "User", text: event.detail.message }]);
      });

      // Handle when the user starts speaking
      newAvatar.on(StreamingEvents.USER_START, async () => {
        console.log("User started speaking");
      });

      newAvatar.on(StreamingEvents.STREAM_DISCONNECTED, endSession);
      setAvatar(newAvatar);

      await newAvatar.createStartAvatar({
        quality: AvatarQuality.High,
        voice: {
          rate: 1.5,
          emotion: VoiceEmotion.FRIENDLY,
        },
        disableIdleTimeout: true,
        avatarName: "Ann_Doctor_Sitting_public",
        knowledgeBase: `You are a female AI medical examiner, your name is Medstra, you have to conduct specialized health assessments. Your approach varies based on the assessment type: ${
          preAssessmentData.type
        }.
        You are currently in ${preAssessmentData.language} language.

Assessment Types and Protocols:

CARDIOVASCULAR HEALTH:
- Focus on heart health and circulation
- Blood pressure and pulse discussion
- Physical activity tolerance
- Chest pain or discomfort history
- Family history of heart conditions
- Lifestyle factors affecting heart health
- Medications related to heart health
- Stress levels and their cardiac impact

NEUROLOGICAL SCREENING:
- Cognitive function assessment
- Memory and concentration
- Balance and coordination discussion
- Headaches and migraines
- Sleep patterns and quality
- Stress and mental health
- Neurological symptoms
- Family history of neurological conditions

RESPIRATORY FUNCTION:
- Breathing patterns and difficulties
- Exercise tolerance
- Coughing and wheezing
- Smoking history and exposure
- Environmental factors
- Sleep breathing issues
- Respiratory medication review
- Impact on daily activities

FULL HEALTH SCREENING:
- Comprehensive review of all systems
- Detailed family history
- Lifestyle assessment
- Mental health evaluation
- Preventive care discussion
- Current medications review
- Risk factor analysis
- Future health planning

Patient Profile:
- Height: ${preAssessmentData.height}cm
- Weight: ${preAssessmentData.weight}kg
- BMI: ${(
          preAssessmentData.weight / Math.pow(preAssessmentData.height / 100, 2)
        ).toFixed(1)}
- Smoking Status: ${preAssessmentData.smoker ? "Smoker" : "Non-smoker"}
- Exercise Frequency: ${preAssessmentData.exerciseFrequency}

${preAssessmentData.medicalReportText ? `
Medical History:
${preAssessmentData.medicalReportText}
` : ''}

Communication Guidelines:
- Keep responses concise and conversational
- Use clear, non-technical language
- Show empathy while maintaining professionalism
- Focus questions based on assessment type
- Respect time limits for each assessment type
- Provide clear explanations for medical terms
- Address immediate concerns within scope
- Stay focused on relevant systems for specific assessments
${preAssessmentData.medicalReportText ? `- Reference and incorporate information from the provided medical report when relevant` : ''}

Report Generation:
When assessment is complete, generate two reports:

1. Patient Report:
- Summary of findings
- Key health indicators
- Specific recommendations
- Follow-up suggestions
- Lifestyle modifications
${preAssessmentData.medicalReportText ? `- Comparison with previous medical reports` : ''}

2. Underwriting Report:
- Risk assessment summary
- Key medical findings
- Insurance-relevant factors
- HIPAA-compliant documentation
- Risk classification recommendation
${preAssessmentData.medicalReportText ? `- Historical medical context from provided reports` : ''}

Important Instructions:
- Maintain HIPAA compliance throughout
- Stay within designated time limits
- Focus on insurance-relevant factors
- Document all responses systematically
${preAssessmentData.medicalReportText ? `- Consider historical medical data in your assessment` : ''}
- When you determine it's time to generate reports, end your last spoken message with a \b tag
- Do not mention the \b tag in speech - it's only used as a signal

Initial Greeting:
${preAssessmentData.medicalReportText ? 
  `Start with a professional greeting, acknowledge that you've reviewed their medical history, introduce the specific type of assessment, and explain the expected duration and process.` :
  `Start with a professional greeting, introduce the specific type of assessment, and explain the expected duration and process.`}`,
        language: preAssessmentData.language,
      });

      console.log(`You are a female AI medical examiner, your name is Medstra, you have to conduct specialized health assessments. Your approach varies based on the assessment type: ${
          preAssessmentData.type
        }.
        You are currently in ${preAssessmentData.language} language.

Assessment Types and Protocols:

CARDIOVASCULAR HEALTH:
- Focus on heart health and circulation
- Blood pressure and pulse discussion
- Physical activity tolerance
- Chest pain or discomfort history
- Family history of heart conditions
- Lifestyle factors affecting heart health
- Medications related to heart health
- Stress levels and their cardiac impact

NEUROLOGICAL SCREENING:
- Cognitive function assessment
- Memory and concentration
- Balance and coordination discussion
- Headaches and migraines
- Sleep patterns and quality
- Stress and mental health
- Neurological symptoms
- Family history of neurological conditions

RESPIRATORY FUNCTION:
- Breathing patterns and difficulties
- Exercise tolerance
- Coughing and wheezing
- Smoking history and exposure
- Environmental factors
- Sleep breathing issues
- Respiratory medication review
- Impact on daily activities

FULL HEALTH SCREENING:
- Comprehensive review of all systems
- Detailed family history
- Lifestyle assessment
- Mental health evaluation
- Preventive care discussion
- Current medications review
- Risk factor analysis
- Future health planning

Patient Profile:
- Height: ${preAssessmentData.height}cm
- Weight: ${preAssessmentData.weight}kg
- BMI: ${(
          preAssessmentData.weight / Math.pow(preAssessmentData.height / 100, 2)
        ).toFixed(1)}
- Smoking Status: ${preAssessmentData.smoker ? "Smoker" : "Non-smoker"}
- Exercise Frequency: ${preAssessmentData.exerciseFrequency}

${preAssessmentData.medicalReportText ? `
Medical History:
${preAssessmentData.medicalReportText}
` : ''}

Communication Guidelines:
- Keep responses concise and conversational
- Use clear, non-technical language
- Show empathy while maintaining professionalism
- Focus questions based on assessment type
- Respect time limits for each assessment type
- Provide clear explanations for medical terms
- Address immediate concerns within scope
- Stay focused on relevant systems for specific assessments
${preAssessmentData.medicalReportText ? `- Reference and incorporate information from the provided medical report when relevant` : ''}

Report Generation:
When assessment is complete, generate two reports:

1. Patient Report:
- Summary of findings
- Key health indicators
- Specific recommendations
- Follow-up suggestions
- Lifestyle modifications
${preAssessmentData.medicalReportText ? `- Comparison with previous medical reports` : ''}

2. Underwriting Report:
- Risk assessment summary
- Key medical findings
- Insurance-relevant factors
- HIPAA-compliant documentation
- Risk classification recommendation
${preAssessmentData.medicalReportText ? `- Historical medical context from provided reports` : ''}

Important Instructions:
- Maintain HIPAA compliance throughout
- Stay within designated time limits
- Focus on insurance-relevant factors
- Document all responses systematically
${preAssessmentData.medicalReportText ? `- Consider historical medical data in your assessment` : ''}
- When you determine it's time to generate reports, end your last spoken message with a \b tag
- Do not mention the \b tag in speech - it's only used as a signal

Initial Greeting:
${preAssessmentData.medicalReportText ? 
  `Start with a professional greeting, acknowledge that you've reviewed their medical history, introduce the specific type of assessment, and explain the expected duration and process.` :
  `Start with a professional greeting, introduce the specific type of assessment, and explain the expected duration and process.`}`);

      await newAvatar.startVoiceChat({
        useSilencePrompt: true, // Start voice chat with silence prompts
      });

      // Initial greeting
      await newAvatar.speak({
        text: "Hello! Introduce yourself as Medstra, I'm here to conduct your health assessment. How are you feeling today?",
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function handleSpeak(message: string) {
    if (!avatar || !message) return;

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message }),
    });

    const { reply } = await response.json();

    await avatar.speak({ text: reply });

    setMessage("");

    setAcceptMessages(true);
  }

  async function endSession() {
    if (avatar) {
      await avatar.closeVoiceChat();
      await avatar.stopAvatar();
      setStream(undefined);
      setAvatar(null);
    }
  }

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.play();
    }
  }, [stream]);

  const handleSendMessage = async () => {
    if (!message) return;
    setMessage("");
    // Add user message to the chat
    setMessageStream((prev) => [...prev, { sender: "User", text: message }]);

    // Send the message to the AI
    await avatar?.speak({
      text: message,
      taskType: TaskType.TALK,
      taskMode: TaskMode.SYNC,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !avatar) return;

    // Convert image to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result as string;

      // Send image to OpenAI for analysis
      const response = await fetch("/api/openai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const { analysis } = await response.json();

      // Add the image analysis to chat
      setMessageStream((prev) => [
        ...prev,
        { sender: "User", text: "Uploaded an image" },

        {
          sender: "User",
          text: (
            <div>
              <img
                src={base64Image}
                alt="Uploaded"
                style={{ width: "100px", height: "auto" }}
              />
            </div>
          ),
        },
      ]);

      // Send the analysis to avatar
      await avatar.speak({
        text: `IMPORTANT: The user uploaded an image. Please analyze the image in detail it is an medical emergency related image. ${analysis}`,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });
    };
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !avatar) return;

    // Show loading message
    setMessageStream((prev) => [
      ...prev,
      { sender: "System", text: "Processing medical report..." },
    ]);

    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Extract text from document
      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      const { text, metadata } = await response.json();

      // Add the document text to chat
      setMessageStream((prev) => [
        ...prev,
        { sender: "User", text: `Uploaded medical report: ${file.name}` },
      ]);

      // Store the current knowledge base
      const currentKnowledgeBase = avatar.knowledgeBase;

      // Create updated knowledge base with the new medical report
      const updatedKnowledgeBase = `${currentKnowledgeBase}

Additional Medical Report (${metadata.fileName}):
${text}`;

      // Update the avatar's knowledge base property
      avatar.knowledgeBase = updatedKnowledgeBase;

      // Restart avatar with updated knowledge base
      await avatar.createStartAvatar({
        quality: AvatarQuality.High,
        voice: {
          rate: 1.5,
          emotion: VoiceEmotion.FRIENDLY,
        },
        disableIdleTimeout: true,
        avatarName: "Ann_Doctor_Sitting_public",
        knowledgeBase: updatedKnowledgeBase,
        language: preAssessmentData.language,
      });

      // Inform user that the report has been processed
      await avatar.speak({
        text: `I've processed the medical report "${metadata.fileName}" and incorporated it into our assessment. The report contains important information about your medical history. Would you like me to summarize the key findings?`,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });

    } catch (error) {
      console.error("Error processing document:", error);
      setMessageStream((prev) => [
        ...prev,
        { sender: "System", text: "Error processing medical report. Please try again." },
      ]);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col">
        <div className="relative aspect-video bg-muted">
          {stream && (
            <video
              ref={mediaStream}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          {isLoadingSession && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <motion.div
                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 p-4">
          <div className="flex gap-2">
            {!avatar ? (
              <Button onClick={startSession} className="w-full">
                Start Session
              </Button>
            ) : (
              <Button
                onClick={endSession}
                variant="destructive"
                className="w-full"
              >
                End Session
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 border-t border-gray-300">
          <h3 className="text-lg font-semibold">Chat</h3>
          <div className="overflow-y-auto max-h-60 border rounded-lg p-2">
            {messageStream.map((msg, index) => (
              <div
                key={index}
                className={`text-sm ${
                  msg.sender === "AI" ? "text-gray-700" : 
                  msg.sender === "System" ? "text-orange-600" :
                  "text-blue-600"
                }`}
              >
                <strong>{msg.sender}: </strong>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleDocumentUpload}
              className="hidden"
              id="document-upload"
            />
            <Button
              onClick={() => document.getElementById("image-upload")?.click()}
              variant="outline"
            >
              Upload Image
            </Button>
            <Button
              onClick={() => document.getElementById("document-upload")?.click()}
              variant="outline"
            >
              Upload Report
            </Button>
            <Button onClick={() => handleSendMessage()} disabled={!message}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export interface StreamingAvatarApiConfig {
  token: string;
  basePath?: string;
}

export enum AvatarQuality {
  Low = "low",
  Medium = "medium",
  High = "high",
}
export enum VoiceEmotion {
  EXCITED = "excited",
  SERIOUS = "serious",
  FRIENDLY = "friendly",
  SOOTHING = "soothing",
  BROADCASTER = "broadcaster",
}
export interface ElevenLabsSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}
export interface StartAvatarRequest {
  quality?: AvatarQuality;
  avatarName: string;
  voice?: {
    voiceId?: string;
    rate?: number;
    emotion?: VoiceEmotion;
    elevenlabsSettings?: ElevenLabsSettings;
  };
  knowledgeId?: string;
  language?: string;
  knowledgeBase?: string;
  disableIdleTimeout?: boolean;
}

export interface StartAvatarResponse {
  session_id: string;
  access_token: string;
  url: string;
  is_paid: boolean;
  session_duration_limit: number;
}

export enum TaskType {
  TALK = "talk",
  REPEAT = "repeat",
}
export enum TaskMode {
  SYNC = "sync",
  ASYNC = "async",
}
export interface SpeakRequest {
  text: string;
  task_type?: TaskType; // should use camelCase
  taskType?: TaskType;
  taskMode?: TaskMode;
}

export interface CommonRequest {
  [key: string]: any;
}

// event types --------------------------------
export enum StreamingEvents {
  AVATAR_START_TALKING = "avatar_start_talking",
  AVATAR_STOP_TALKING = "avatar_stop_talking",
  AVATAR_TALKING_MESSAGE = "avatar_talking_message",
  AVATAR_END_MESSAGE = "avatar_end_message",
  USER_TALKING_MESSAGE = "user_talking_message",
  USER_END_MESSAGE = "user_end_message",
  USER_START = "user_start",
  USER_STOP = "user_stop",
  USER_SILENCE = "user_silence",
  STREAM_READY = "stream_ready",
  STREAM_DISCONNECTED = "stream_disconnected",
}
export type EventHandler = (...args: any[]) => void;
export interface EventData {
  [key: string]: unknown;
  task_id: string;
}

export interface StreamingStartTalkingEvent extends EventData {
  type: StreamingEvents.AVATAR_START_TALKING;
}

export interface StreamingStopTalkingEvent extends EventData {
  type: StreamingEvents.AVATAR_STOP_TALKING;
}

export interface StreamingTalkingMessageEvent extends EventData {
  type: StreamingEvents.AVATAR_TALKING_MESSAGE;
  message: string;
}

export interface StreamingTalkingEndEvent extends EventData {
  type: StreamingEvents.AVATAR_END_MESSAGE;
}

export interface UserTalkingMessageEvent extends EventData {
  type: StreamingEvents.USER_TALKING_MESSAGE;
  message: string;
}

export interface UserTalkingEndEvent extends EventData {
  type: StreamingEvents.USER_END_MESSAGE;
}

type StreamingEventTypes =
  | StreamingStartTalkingEvent
  | StreamingStopTalkingEvent
  | StreamingTalkingMessageEvent
  | StreamingTalkingEndEvent
  | UserTalkingMessageEvent
  | UserTalkingEndEvent;

interface WebsocketBaseEvent {
  [key: string]: unknown;
}
interface UserStartTalkingEvent extends WebsocketBaseEvent {
  event_type: StreamingEvents.USER_START;
}
interface UserStopTalkingEvent extends WebsocketBaseEvent {
  event_type: StreamingEvents.USER_STOP;
}
interface UserSilenceEvent extends WebsocketBaseEvent {
  event_type: StreamingEvents.USER_SILENCE;
  silence_times: number;
  count_down: number;
}

type StreamingWebSocketEventTypes =
  | UserStartTalkingEvent
  | UserStopTalkingEvent
  | UserSilenceEvent;

class APIError extends Error {
  public status: number;
  public responseText: string;

  constructor(message: string, status: number, responseText: string) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.responseText = responseText;
  }
}

class StreamingAvatar {
  public room: Room | null = null;
  public mediaStream: MediaStream | null = null;
  public knowledgeBase: string = '';

  private readonly token: string;
  private readonly basePath: string;
  private eventTarget = new EventTarget();
  private audioContext: AudioContext | null = null;
  private webSocket: globalThis.WebSocket | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private mediaStreamAudioSource: MediaStreamAudioSourceNode | null = null;
  private mediaDevicesStream: MediaStream | null = null;
  private audioRawFrame: protobuf.Type | undefined;
  private sessionId: string | null = null;
  private language: string | undefined;

  constructor({
    token,
    basePath = "https://api.heygen.com",
  }: StreamingAvatarApiConfig) {
    this.token = token;
    this.basePath = basePath;
  }

  public async createStartAvatar(
    requestData: StartAvatarRequest
  ): Promise<any> {
    const sessionInfo = await this.newSession(requestData);
    this.sessionId = sessionInfo.session_id;
    this.language = requestData.language;
    this.knowledgeBase = requestData.knowledgeBase || '';

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
      },
      audioCaptureDefaults: {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    this.room = room;
    this.mediaStream = null;

    room.on(RoomEvent.DataReceived, (roomMessage) => {
      let eventMsg: StreamingEventTypes | null = null;
      try {
        const messageString = new TextDecoder().decode(
          roomMessage as unknown as ArrayBuffer
        );
        eventMsg = JSON.parse(messageString) as StreamingEventTypes;
      } catch (e) {
        console.error(e);
      }
      if (!eventMsg) {
        return;
      }
      this.emit(eventMsg.type, eventMsg);
    });

    const mediaStream = new MediaStream();
    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === "video" || track.kind === "audio") {
        mediaStream.addTrack(track.mediaStreamTrack);

        const hasVideoTrack = mediaStream.getVideoTracks().length > 0;
        const hasAudioTrack = mediaStream.getAudioTracks().length > 0;
        if (hasVideoTrack && hasAudioTrack && !this.mediaStream) {
          this.mediaStream = mediaStream;
          this.emit(StreamingEvents.STREAM_READY, this.mediaStream);
        }
      }
    });
    room.on(RoomEvent.TrackUnsubscribed, (track) => {
      const mediaTrack = track.mediaStreamTrack;
      if (mediaTrack) {
        mediaStream.removeTrack(mediaTrack);
      }
    });

    room.on(RoomEvent.Disconnected, (reason) => {
      this.emit(StreamingEvents.STREAM_DISCONNECTED, reason);
    });

    try {
      await room.prepareConnection(sessionInfo.url, sessionInfo.access_token);
    } catch (error) {}

    await this.startSession();

    await room.connect(sessionInfo.url, sessionInfo.access_token);

    return sessionInfo;
  }

  public async startVoiceChat(
    requestData: { useSilencePrompt?: boolean } = {}
  ) {
    requestData.useSilencePrompt = requestData.useSilencePrompt || false;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return;
    }

    try {
      await this.loadAudioRawFrame();
      await this.connectWebSocket({
        useSilencePrompt: requestData.useSilencePrompt,
      });

      this.audioContext = new window.AudioContext({
        latencyHint: "interactive",
        sampleRate: 16000,
      });
      const devicesStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      this.mediaDevicesStream = devicesStream;

      this.mediaStreamAudioSource =
        this.audioContext?.createMediaStreamSource(devicesStream);
      this.scriptProcessor = this.audioContext?.createScriptProcessor(
        512,
        1,
        1
      );

      this.mediaStreamAudioSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext?.destination);

      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.webSocket) {
          return;
        }
        const audioData = event.inputBuffer.getChannelData(0);
        const pcmS16Array = convertFloat32ToS16PCM(audioData);
        const pcmByteArray = new Uint8Array(pcmS16Array.buffer);
        const frame = this.audioRawFrame?.create({
          audio: {
            audio: Array.from(pcmByteArray),
            sampleRate: 16000,
            numChannels: 1,
          },
        });
        const encodedFrame = new Uint8Array(
          this.audioRawFrame
            ?.encode(frame as unknown as protobuf.Message)
            .finish() as unknown as ArrayBuffer
        );
        this.webSocket?.send(encodedFrame);
      };

      // though room has been connected, but the stream may not be ready.
      await sleep(2000);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  public closeVoiceChat() {
    try {
      if (this.audioContext) {
        this.audioContext = null;
      }
      if (this.scriptProcessor) {
        this.scriptProcessor.disconnect();
        this.scriptProcessor = null;
      }
      if (this.mediaStreamAudioSource) {
        this.mediaStreamAudioSource.disconnect();
        this.mediaStreamAudioSource = null;
      }
      if (this.mediaDevicesStream) {
        this.mediaDevicesStream?.getTracks()?.forEach((track) => track.stop());
        this.mediaDevicesStream = null;
      }
      if (this.webSocket) {
        this.webSocket.close();
      }
    } catch (e) {}
  }

  public async newSession(
    requestData: StartAvatarRequest
  ): Promise<StartAvatarResponse> {
    return this.request("/v1/streaming.new", {
      avatar_name: requestData.avatarName,
      quality: requestData.quality,
      knowledge_base_id: requestData.knowledgeId,
      knowledge_base: requestData.knowledgeBase,
      voice: {
        voice_id: requestData.voice?.voiceId,
        rate: requestData.voice?.rate,
        emotion: requestData.voice?.emotion,
        elevenlabs_settings: requestData?.voice?.elevenlabsSettings,
      },
      language: requestData.language,
      version: "v2",
      video_encoding: "H264",
      source: "sdk",
      disable_idle_timeout: requestData.disableIdleTimeout,
    });
  }
  public async startSession(): Promise<any> {
    return this.request("/v1/streaming.start", {
      session_id: this.sessionId,
    });
  }
  public async speak(requestData: SpeakRequest): Promise<any> {
    requestData.taskType =
      requestData.taskType || requestData.task_type || TaskType.TALK;
    requestData.taskMode = requestData.taskMode || TaskMode.ASYNC;

    // try to use websocket first
    // only support talk task
    if (
      this.webSocket &&
      this.audioRawFrame &&
      requestData.task_type === TaskType.TALK &&
      requestData.taskMode !== TaskMode.SYNC
    ) {
      const frame = this.audioRawFrame?.create({
        text: {
          text: requestData.text,
        },
      });
      const encodedFrame = new Uint8Array(
        this.audioRawFrame?.encode(frame).finish()
      );
      this.webSocket?.send(encodedFrame);
      return;
    }
    return this.request("/v1/streaming.task", {
      text: requestData.text,
      session_id: this.sessionId,
      task_mode: requestData.taskMode,
      task_type: requestData.taskType,
    });
  }

  public async startListening(): Promise<any> {
    return this.request("/v1/streaming.start_listening", {
      session_id: this.sessionId,
    });
  }
  public async stopListening(): Promise<any> {
    return this.request("/v1/streaming.stop_listening", {
      session_id: this.sessionId,
    });
  }
  public async interrupt(): Promise<any> {
    return this.request("/v1/streaming.interrupt", {
      session_id: this.sessionId,
    });
  }

  public async stopAvatar(): Promise<any> {
    // clear some resources
    this.closeVoiceChat();
    return this.request("/v1/streaming.stop", {
      session_id: this.sessionId,
    });
  }

  public on(eventType: string, listener: EventHandler): this {
    this.eventTarget.addEventListener(eventType, listener);
    return this;
  }

  public off(eventType: string, listener: EventHandler): this {
    this.eventTarget.removeEventListener(eventType, listener);
    return this;
  }

  private async request(
    path: string,
    params: CommonRequest,
    config?: any
  ): Promise<any> {
    try {
      const response = await fetch(this.getRequestUrl(path), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new APIError(
          `API request failed with status ${response.status}`,
          response.status,
          errorText
        );
      }

      const jsonData = await response.json();
      return jsonData.data;
    } catch (error) {
      throw error;
    }
  }

  private emit(eventType: string, detail?: any) {
    const event = new CustomEvent(eventType, { detail });
    this.eventTarget.dispatchEvent(event);
  }
  private getRequestUrl(endpoint: string): string {
    return `${this.basePath}${endpoint}`;
  }
  private async connectWebSocket(requestData: { useSilencePrompt: boolean }) {
    let websocketUrl = `wss://${
      new URL(this.basePath).hostname
    }/v1/ws/streaming.chat?session_id=${this.sessionId}&session_token=${
      this.token
    }&silence_response=${requestData.useSilencePrompt}`;
    if (this.language) {
      websocketUrl += `&stt_language=${this.language}`;
    }
    this.webSocket = new WebSocket(websocketUrl);
    this.webSocket.addEventListener("message", (event) => {
      let eventData: StreamingWebSocketEventTypes | null = null;
      try {
        eventData = JSON.parse(event.data);
      } catch (e) {
        console.error(e);
        return;
      }
      this.emit(eventData?.event_type!, eventData);
    });
    this.webSocket.addEventListener("close", (event) => {
      this.webSocket = null;
    });
    return new Promise((resolve, reject) => {
      this.webSocket?.addEventListener("error", (event) => {
        this.webSocket = null;
        reject(event);
      });
      this.webSocket?.addEventListener("open", () => {
        resolve(true);
      });
    });
  }
  private async loadAudioRawFrame() {
    if (!this.audioRawFrame) {
      const root = protobuf.Root.fromJSON(jsonDescriptor);
      this.audioRawFrame = root?.lookupType("pipecat.Frame");
    }
  }
}
