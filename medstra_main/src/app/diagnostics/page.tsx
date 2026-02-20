"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Heart, FileText, Phone, Upload, AlertTriangle, CheckCircle2, Wand2, Activity } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import Image from "next/image";
import Link from "next/link";

export default function DiagnosticsPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            if (file.type.startsWith("image/")) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
            setResult(null);
        }
    };

    const runAnalysis = async (category: string, externalFormData?: FormData) => {
        setLoading(true);

        const formData = externalFormData || new FormData();
        if (!externalFormData && selectedFile) {
            formData.append("file", selectedFile);
        }
        formData.append("category", category);

        try {
            const response = await fetch("http://localhost:8000/api/v1/analyze-medical", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Backend not responding. Please ensure the Flask server is running on port 8000.");
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async () => {
        window.open("http://localhost:8000/api/v1/download-report", "_blank");
    };

    const [heartData, setHeartData] = useState<Record<string, string>>({
        age: "", sex: "", cp: "", trestbps: "", chol: "", fbs: "",
        restecg: "", thalach: "", exang: "", oldpeak: "", slope: "", ca: "", thal: ""
    });


    const handleHeartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHeartData({ ...heartData, [e.target.name]: e.target.value });
    };

    const runAnalysisWithState = async (category: string) => {
        const formData = new FormData();
        if (category === 'HEART') {
            Object.entries(heartData).forEach(([key, val]) => {
                formData.append(key, val || "0");
            });
        } else {
            if (selectedFile) {
                formData.append('file', selectedFile);
            }
        }
        runAnalysis(category, formData);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <FadeIn>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Saarthi Medical AI Lab</h1>
                        <p className="text-muted-foreground mt-1">Multi-modal clinical diagnostic intelligence.</p>
                    </div>
                    <div className="flex gap-4">
                        {result && (
                            <Button onClick={() => {
                                setResult(null);
                                setSelectedFile(null);
                            }} variant="outline" className="gap-2">
                                <Activity className="h-4 w-4" /> Reset Analysis
                            </Button>
                        )}
                        <Link href="/assessment?type=emergency">
                            <Button variant="destructive" className="gap-2 animate-pulse h-12 px-6 shadow-lg shadow-red-500/20">
                                <Phone className="h-4 w-4" />
                                Emergency Doctor Call
                            </Button>
                        </Link>
                    </div>
                </div>
            </FadeIn>

            <Tabs defaultValue="heart" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px] h-12 bg-muted/50 p-1">
                    <TabsTrigger value="heart" className="gap-2">
                        <Heart className="h-4 w-4" /> Heart
                    </TabsTrigger>
                    <TabsTrigger value="mri" className="gap-2">
                        <Brain className="h-4 w-4" /> Neuro/MRI
                    </TabsTrigger>
                    <TabsTrigger value="respiratory" className="gap-2" disabled>
                        <Activity className="h-4 w-4" /> Respiratory
                    </TabsTrigger>
                    <TabsTrigger value="full" className="gap-2" disabled>
                        <FileText className="h-4 w-4" /> Full Body
                    </TabsTrigger>
                </TabsList>

                {/* Unified Analysis Tab Logic */}
                {["heart", "mri"].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-b from-primary/5 to-background">
                                <CardHeader>
                                    <CardTitle className="capitalize">{tab === 'mri' ? 'Neuro-Inference (NLP)' : 'Cardio-Diagnostic Model'}</CardTitle>
                                    <CardDescription>
                                        {tab === 'heart' ? 'Enter numerical clinical parameters from patient records.' :
                                            'Upload an MRI report (PDF) for model inference.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {tab === 'heart' ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: "Age (Years)", name: "age", type: "number", placeholder: "e.g. 45" },
                                                { label: "Sex (1=M, 0=F)", name: "sex", type: "number", placeholder: "1 or 0" },
                                                { label: "Chest Pain (0-3)", name: "cp", type: "number", placeholder: "Type 0-3" },
                                                { label: "Resting BPS", name: "trestbps", type: "number", placeholder: "mm Hg" },
                                                { label: "Cholesterol", name: "chol", type: "number", placeholder: "mg/dl" },
                                                { label: "Fasting BS (1/0)", name: "fbs", type: "number", placeholder: ">120?" },
                                                { label: "Rest ECG (0-2)", name: "restecg", type: "number", placeholder: "Outcome" },
                                                { label: "Max Heart Rate", name: "thalach", type: "number", placeholder: "BPM" },
                                                { label: "Exer Angina (1/0)", name: "exang", type: "number", placeholder: "Yes=1" },
                                                { label: "Oldpeak", name: "oldpeak", type: "number", placeholder: "ST Dep." },
                                                { label: "Peak ST Slope", name: "slope", type: "number", placeholder: "0-2" },
                                                { label: "Major Vessels", name: "ca", type: "number", placeholder: "0-3" },
                                                { label: "Thal (1-3)", name: "thal", type: "number", placeholder: "Stress" },
                                            ].map((field) => (
                                                <div key={field.name} className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-primary/70 tracking-wider">
                                                        {field.label}
                                                    </label>
                                                    <input
                                                        type={field.type}
                                                        name={field.name}
                                                        value={heartData[field.name]}
                                                        onChange={handleHeartInputChange}
                                                        className="w-full h-10 px-3 bg-white/50 border border-primary/20 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        placeholder={field.placeholder}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">

                                            <div className="border-2 border-dashed rounded-xl p-4 bg-white/30 text-center">
                                                <input
                                                    type="file"
                                                    id="neuro-pdf-upload"
                                                    className="hidden"
                                                    accept=".pdf"
                                                    onChange={handleFileChange}
                                                />
                                                <label htmlFor="neuro-pdf-upload" className="cursor-pointer">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <FileText className={`h-8 w-8 ${selectedFile ? 'text-primary' : 'text-muted-foreground'}`} />
                                                        <span className="text-xs font-medium">
                                                            {selectedFile ? selectedFile.name : "Select MRI PDF Report"}
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>

                                        </div>
                                    )}
                                    <Button
                                        className="w-full h-12 text-lg font-bold shadow-xl shadow-primary/20 mt-4 active:scale-[0.98] transition-transform"
                                        disabled={loading || (tab !== 'heart' && tab !== 'mri') || (tab === 'mri' && !selectedFile)}
                                        onClick={() => runAnalysisWithState(tab === 'mri' ? 'NEURO' : 'HEART')}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                                                Processing Model...
                                            </>
                                        ) : (
                                            `Run ${tab.toUpperCase()} Inference`
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                {!result ? (
                                    <Card className="h-full flex items-center justify-center text-center p-8 bg-muted/5 border-none">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-white rounded-full w-fit mx-auto shadow-sm">
                                                <Activity className="h-10 w-10 text-primary/40 animate-pulse" />
                                            </div>
                                            <p className="text-muted-foreground italic max-w-[200px] text-sm tracking-tight">Enter data to generate real-time model predictions.</p>
                                        </div>
                                    </Card>
                                ) : (
                                    <FadeIn className="space-y-6">
                                        {/* Confidence & Risk */}
                                        <Card className={`overflow-hidden border-2 shadow-xl ${result.risk_level?.toLowerCase().includes('high') ? 'border-red-500/50' :
                                            result.risk_level?.toLowerCase().includes('moderate') ? 'border-amber-500/50' : 'border-green-500/50'
                                            }`}>
                                            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/30">
                                                <CardTitle className="text-xl">Model Output</CardTitle>
                                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.risk_level?.toLowerCase().includes('high') ? 'bg-red-500 text-white' :
                                                    result.risk_level?.toLowerCase().includes('moderate') ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                                                    }`}>
                                                    {result.risk_level} Risk
                                                </span>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-4">
                                                <p className="text-lg font-bold text-slate-800 leading-tight">{result.statement}</p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Prediction Confidence</span>
                                                        <span className="text-3xl font-black text-primary">
                                                            {result.probability || "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border p-[2px]">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${result.risk_level?.toLowerCase().includes('high') ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                                                result.risk_level?.toLowerCase().includes('moderate') ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-green-400 to-green-600'
                                                                }`}
                                                            style={{
                                                                width: result.probability?.includes('%')
                                                                    ? result.probability
                                                                    : result.probability?.match(/\d+/)
                                                                        ? `${result.probability.match(/\d+/)[0]}%`
                                                                        : '75%'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Diagnostic Detail (JSON or Formatted) */}
                                        <Card className="border-none shadow-md bg-white">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-tighter text-slate-400">
                                                    <Activity className="h-3 w-3" />
                                                    Raw Inference Metrics
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 overflow-x-auto">
                                                    {typeof result.diagnostic === 'object' ? (
                                                        Object.entries(result.diagnostic).map(([k, v]) => (
                                                            <div key={k} className="flex justify-between border-b border-slate-200 py-1 last:border-0">
                                                                <span className="font-bold">{k}:</span>
                                                                <span>{typeof v === 'object' ? 'Structured Data' : String(v)}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p>{result.diagnostic}</p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Explanation */}
                                        <Card className="border-none shadow-md bg-white border-l-4 border-primary">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    Model Interpretation
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-slate-600 leading-relaxed italic">
                                                    {result.explanation}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Precautions */}
                                        <Card className="bg-primary/5 border-primary/20 shadow-inner">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-tighter">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Medical Precautions
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm text-slate-700 space-y-3 leading-relaxed">
                                                    {Array.isArray(result.precautions) ? (
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            {result.precautions.map((p: string, i: number) => <li key={i} className="text-xs">{p}</li>)}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs">{result.precautions}</p>
                                                    )}
                                                </div>
                                                <div className="mt-6 p-4 bg-slate-900 rounded-xl text-[9px] text-slate-400 border border-slate-800 font-mono flex items-start gap-2">
                                                    <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                                                    {result.disclaimer}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </FadeIn>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Consultation Section */}
            <FadeIn delay={0.4}>
                <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-primary to-primary/80 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <h2 className="text-3xl font-bold">Unsure about the results?</h2>
                        <p className="text-primary-foreground/90">
                            Speak with a certified neurologist or general physician immediately through a secure video consultation.
                            Our doctors have access to your AI scan results to provide better context.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="secondary" size="lg" className="rounded-full px-8">
                                Schedule Later
                            </Button>
                            <Link href="/assessment?type=video">
                                <Button size="lg" className="rounded-full px-8 bg-white text-primary hover:bg-white/90">
                                    Connect Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative w-full max-w-[300px] aspect-video rounded-2xl overflow-hidden bg-black/20 border-4 border-white/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Phone className="h-8 w-8 mx-auto mb-2 animate-bounce" />
                                <p className="text-xs font-bold uppercase tracking-widest">Live Call Waiting</p>
                            </div>
                        </div>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
