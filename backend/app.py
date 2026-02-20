import os
import joblib
import pandas as pd
import numpy as np
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging
import pdfplumber
import io
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Paths to models
BASE_DIR = r'd:\Ansh_Work\Projects\shahanchor'
HEART_MODEL_PATH = os.path.join(BASE_DIR, 'Heart_model.joblib')
BRAIN_MODEL_PATH = os.path.join(BASE_DIR, 'logistic_regression_model.joblib')
KIDNEY_MODEL_PATH = os.path.join(BASE_DIR, 'kidney_model.pkl')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'tfidf_vectorizer.joblib')

# Global variables for models
heart_model = None
brain_model = None
kidney_model = None
tfidf_vectorizer = None

def load_models():
    global heart_model, brain_model, tfidf_vectorizer
    try:
        if os.path.exists(HEART_MODEL_PATH):
            heart_model = joblib.load(HEART_MODEL_PATH)
            logger.info("Heart model loaded successfully.")
        
        if os.path.exists(BRAIN_MODEL_PATH):
            brain_model = joblib.load(BRAIN_MODEL_PATH)
            logger.info("Brain logistic regression model loaded successfully.")

        if os.path.exists(KIDNEY_MODEL_PATH):
            kidney_model = joblib.load(KIDNEY_MODEL_PATH)
            logger.info("Kidney model loaded successfully.")
            
        if os.path.exists(VECTORIZER_PATH):
            tfidf_vectorizer = joblib.load(VECTORIZER_PATH)
            logger.info("TF-IDF Vectorizer loaded successfully.")
            
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")

load_models()

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file object."""
    text = ""
    try:
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        return None
    return text

def extract_heart_features_heuristically(text):
    """
    Extract Heart features from text using Regex Patterns.
    This works without an OpenAI key by looking for specific medical labels.
    """
    text = text.lower()
    
    # Feature map with regex patterns
    patterns = {
        "age": [r"age:\s*(\d+)", r"(\d+)\s*years"],
        "sex": [r"sex:\s*(male|female|m|f)", r"gender:\s*(male|female|m|f)"],
        "cp": [r"chest pain type:\s*(\d)", r"cp type:\s*(\d)", r"asymptotic|typical|atypical"],
        "trestbps": [r"blood pressure:\s*(\d+)", r"bps:\s*(\d+)", r"bp:\s*(\d+)"],
        "chol": [r"cholesterol:\s*(\d+)", r"chol:\s*(\d+)"],
        "fbs": [r"fasting blood sugar:\s*(\d+)", r"fbs:\s*(\d+)"],
        "restecg": [r"rest ecg:\s*(\d)", r"ecg results:\s*(\d)"],
        "thalach": [r"max heart rate:\s*(\d+)", r"thalach:\s*(\d+)"],
        "exang": [r"exercise induced angina:\s*(\d)", r"exang:\s*(\d)"],
        "oldpeak": [r"oldpeak:\s*([\d\.]+)", r"st depression:\s*([\d\.]+)"],
        "slope": [r"st slope:\s*(\d)", r"slope:\s*(\d)"],
        "ca": [r"major vessels:\s*(\d)", r"ca:\s*(\d)"],
        "thal": [r"thal:\s*(\d)"]
    }
    
    extracted = {k: 0.0 for k in patterns.keys()}
    
    for feature, p_list in patterns.items():
        for p in p_list:
            match = re.search(p, text)
            if match:
                val = match.group(1) if match.groups() else match.group(0)
                if feature == "sex":
                    extracted[feature] = 1.0 if 'm' in val else 0.0
                elif feature == "cp":
                    if 'asymptotic' in val: extracted[feature] = 0.0
                    elif 'atypical' in val: extracted[feature] = 1.0
                    elif 'typical' in val: extracted[feature] = 2.0
                    else: 
                        try: extracted[feature] = float(val)
                        except: pass
                else:
                    try: extracted[feature] = float(val)
                    except: pass
                break
    
    # Defaults for typical male patient if data missing
    if extracted['age'] == 0: extracted['age'] = 50.0
    if extracted['trestbps'] == 0: extracted['trestbps'] = 120.0
    if extracted['chol'] == 0: extracted['chol'] = 200.0
    if extracted['thalach'] == 0: extracted['thalach'] = 150.0
    
    return extracted

def extract_kidney_features_heuristically(text):
    """
    Extract Kidney (CKD) features from text using Regex Patterns.
    """
    text = text.lower()
    
    patterns = {
        "age": [r"age:\s*(\d+)"],
        "bp": [r"blood pressure:\s*(\d+)", r"bp:\s*(\d+)"],
        "sg": [r"specific gravity:\s*([\d\.]+)"],
        "al": [r"albumin:\s*(\d+)"],
        "su": [r"sugar:\s*(\d+)"],
        "rbc": [r"red blood cells:\s*(normal|abnormal)"],
        "pc": [r"pus cell:\s*(normal|abnormal)"],
        "pcc": [r"pus cell clumps:\s*(present|notpresent)"],
        "ba": [r"bacteria:\s*(present|notpresent)"],
        "bgr": [r"blood glucose random:\s*(\d+)", r"blood sugar:\s*(\d+)"],
        "bu": [r"blood urea:\s*(\d+)"],
        "sc": [r"serum creatinine:\s*([\d\.]+)"],
        "sod": [r"sodium:\s*(\d+)"],
        "pot": [r"potassium:\s*([\d\.]+)"],
        "hemo": [r"hemoglobin:\s*([\d\.]+)"],
        "pcv": [r"packed cell volume:\s*(\d+)"],
        "wc": [r"white blood cell count:\s*(\d+)"],
        "rc": [r"red blood cell count:\s*([\d\.]+)"],
        "htn": [r"hypertension:\s*(yes|no)"],
        "dm": [r"diabetes mellitus:\s*(yes|no)"],
        "cad": [r"coronary artery disease:\s*(yes|no)"],
        "appet": [r"appetite:\s*(good|poor)"],
        "pe": [r"pedal edema:\s*(yes|no)"],
        "ane": [r"anemia:\s*(yes|no)"]
    }
    
    extracted = {}
    for feature, p_list in patterns.items():
        val = 0.0
        for p in p_list:
            match = re.search(p, text)
            if match:
                raw_val = match.group(1)
                if raw_val in ['normal', 'present', 'yes', 'good']: val = 1.0
                elif raw_val in ['abnormal', 'notpresent', 'no', 'poor']: val = 0.0
                else:
                    try: val = float(raw_val)
                    except: val = 0.0
                break
        extracted[feature] = val
        
    return extracted

def local_keyword_analysis(category, text):
    """
    Perform medical analysis using keyword-based scoring.
    No External API required.
    """
    text = text.lower()
    
    risk_keywords = {
        'KIDNEY': {
            'High': ['chronic kidney disease', 'renal failure', 'end stage renal disease', 'nephritis', 'uremia', 'severe albuminuria'],
            'Moderate': ['proteinuria', 'creatinine increase', 'reduced egfr', 'kidney stones', 'swelling', 'dark urine']
        },
        'FULL_BODY': {
            'High': ['malignant', 'tumor', 'organ failure', 'stroke', 'cardiac arrest', 'internal bleeding', 'severe infection'],
            'Moderate': ['inflammation', 'fever', 'hypertension', 'fatigue', 'localized pain', 'abnormal growth']
        }
    }
    
    cat_keys = risk_keywords.get(category, risk_keywords['FULL_BODY'])
    
    high_hits = [k for k in cat_keys['High'] if k in text]
    mod_hits = [k for k in cat_keys['Moderate'] if k in text]
    
    score = (len(high_hits) * 30) + (len(mod_hits) * 15)
    score = min(score + 10, 95) if (high_hits or mod_hits) else 5.0
    
    risk_level = "High" if score > 60 else "Moderate" if score > 30 else "Low"
    
    findings = {
        "High Risk Markers": high_hits if high_hits else "None detected",
        "Clinical Observations": mod_hits if mod_hits else "Standard observations",
        "Engine": "Local Heuristic Rules v1.0"
    }
    
    statement = f"{category.replace('_', ' ').capitalize()} Health Scan"
    explanation = f"Heuristic analysis detected {len(high_hits)} primary and {len(mod_hits)} secondary clinical markers. Overall profile suggests a {risk_level.lower()} risk based on the report content."
    
    precautions = [
        "Consult a specialist for a formal clinical diagnosis.",
        "Maintain current medical records for follow-up comparison.",
        "Seek immediate care if acute symptoms develop."
    ]
    if risk_level == "High":
        precautions.insert(0, "URGENT: Request a physical examination with a senior consultant.")

    return {
        "probability": f"{score:.1f}%",
        "risk_level": risk_level,
        "statement": statement,
        "explanation": explanation,
        "diagnostic": findings,
        "precautions": precautions,
        "disclaimer": "DISCLAIMER: This is a keyword-based heuristic analysis. No Generative AI or LLM was used. Results are strictly for informational support."
    }

@app.route('/api/v1/analyze-medical', methods=['POST'])
def analyze_medical():
    category = request.form.get('category', 'FULL').upper()
    logger.info(f"Received request for category: {category}")
    
    try:
        findings = ""
        # Handle PDF Upload
        if 'file' in request.files:
            file = request.files['file']
            if file.filename.endswith('.pdf'):
                findings = extract_text_from_pdf(file)
                if findings is None:
                    return jsonify({"error": "Failed to extract text from PDF."}), 400
            else:
                return jsonify({"error": "Only PDF files are supported for report uploads."}), 400
        else:
            findings = request.form.get('findings', '')

        if not findings or len(findings.strip()) < 5:
            return jsonify({"error": "Please provide a clinical PDF report or paste findings text."}), 400

        # Category Routing
        if category == 'HEART':
            if heart_model is None:
                return jsonify({"error": "Heart model not loaded on server."}), 500
            
            try:
                # Map unstructured text to model features using Heuristics
                input_data = extract_heart_features_heuristically(findings)
                
                features = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
                sample_df = pd.DataFrame([input_data])[features]
                
                prediction = int(heart_model.predict(sample_df)[0])
                
                if hasattr(heart_model, "predict_proba"):
                    probabilities = heart_model.predict_proba(sample_df)[0]
                    confidence = float(probabilities[1] if prediction == 1 else probabilities[0])
                else:
                    confidence = 0.95
                
                risk_level = "High" if (prediction == 1 and confidence > 0.7) else "Moderate" if (prediction == 1 or confidence < 0.3) else "Low"
                
                return jsonify({
                    "probability": f"{confidence*100:.1f}%",
                    "risk_level": risk_level,
                    "statement": "Cardiovascular Health Risk Assessment",
                    "explanation": f"Statistical model analyzed the extracted parameters. A {'positive' if prediction == 1 else 'negative'} indication was found correlation with the provided data.",
                    "diagnostic": {
                        "Classification": "Positive" if prediction == 1 else "Negative",
                        "Prediction Confidence": f"{confidence:.4f}",
                        "Analysis Type": "Statistical RandomForest (Local)"
                    },
                    "precautions": get_heart_precautions(risk_level, prediction),
                    "disclaimer": "DISCLAIMER: This is a local statistical prediction using Keyword Extraction. No external APIs used."
                })
            except Exception as e:
                logger.error(f"Heart model prediction error: {str(e)}")
                analysis = local_keyword_analysis('HEART', findings) # Note: local_keyword_analysis uses FULL_BODY patterns if HEART is missing
                return jsonify(analysis)

        elif category == 'NEURO' or category == 'MRI':
            if brain_model is None or tfidf_vectorizer is None:
                return jsonify({"error": "Neurological models not loaded on server."}), 500
            
            vectorized_text = tfidf_vectorizer.transform([findings])
            prediction = brain_model.predict(vectorized_text)[0]
            probabilities = brain_model.predict_proba(vectorized_text)[0]
            prob_index = 1 if len(probabilities) > 1 else 0
            risk_prob = float(probabilities[prob_index])
            
            risk_level = "High" if risk_prob > 0.7 else "Moderate" if risk_prob > 0.3 else "Low"
            
            return jsonify({
                "probability": f"{risk_prob*100:.1f}%",
                "risk_level": risk_level,
                "statement": "Neurological MRI Report Analysis",
                "explanation": "The NLP model identified keyword patterns indicative of a " + ("significant" if prediction else "low-probability") + " abnormal finding.",
                "diagnostic": {
                    "Detected Condition": "Abnormal Pattern" if prediction else "Normal Pattern",
                    "NLP Confidence": round(risk_prob, 4),
                    "Text Preview": findings[:100] + "..."
                },
                "precautions": get_neuro_precautions(risk_level, prediction),
                "disclaimer": "DISCLAIMER: Local NLP Analysis using TF-IDF. Not a medical diagnosis."
            })

        elif category == 'KIDNEY':
            if kidney_model is None:
                return jsonify({"error": "Kidney model not loaded on server."}), 500
            
            try:
                input_data = extract_kidney_features_heuristically(findings)
                # Feature list for CKD Model
                features = ['age', 'bp', 'sg', 'al', 'su', 'rbc', 'pc', 'pcc', 'ba', 'bgr', 'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wc', 'rc', 'htn', 'dm', 'cad', 'appet', 'pe', 'ane']
                sample_df = pd.DataFrame([input_data])[features]
                
                # Get prediction and probabilities
                prediction = int(kidney_model.predict(sample_df)[0])
                
                # Check if predict_proba is available
                if hasattr(kidney_model, "predict_proba"):
                    probabilities = kidney_model.predict_proba(sample_df)[0]
                    # Logic: In UCI CKD, 0 = ckd (Disease), 1 = notckd (Normal)
                    # We want 'confidence' to be probability of disease if disease is found, or prob of normal if normal.
                    if prediction == 0: # Disease Detected
                        confidence = float(probabilities[0])
                        detected_disease = True
                    else: # Healthy
                        confidence = float(probabilities[1])
                        detected_disease = False
                else:
                    # Fallback for models without predict_proba (like some SVMs or Regressions converted to classifiers)
                    confidence = 0.95 # Generic high confidence for categorical output
                    detected_disease = (prediction == 0)

                risk_level = "High" if (detected_disease and confidence > 0.7) else "Moderate" if (detected_disease or confidence < 0.4) else "Low"
                
                return jsonify({
                    "probability": f"{confidence*100:.1f}%",
                    "risk_level": risk_level,
                    "statement": "Renal Health Diagnostic Results",
                    "explanation": f"The statistical model analyzed kidney function markers extracted from the report. Results indicate a {risk_level.lower()} risk profile.",
                    "diagnostic": {
                        "Model Prediction": "Chronic Kidney Disease Markers Detected" if detected_disease else "Normal Renal Function Markers",
                        "Prediction Confidence": f"{confidence:.4f}",
                        "Analysis Type": "CKD Classifier (RandomForest/PKL)"
                    },
                    "precautions": get_kidney_precautions(risk_level, 1 if detected_disease else 0),
                    "disclaimer": "DISCLAIMER: AI-based screening only. This is not a formal medical diagnosis."
                })
            except Exception as e:
                logger.error(f"Kidney model prediction error: {str(e)}")
                # Fail gracefully to local keyword analysis
                analysis = local_keyword_analysis('KIDNEY', findings)
                analysis['statement'] = "Renal Keyword Analysis (Fallback)"
                return jsonify(analysis)

        elif category in ['FULL_BODY', 'FULL']:
            # Use local keyword engine for categories without specific models
            analysis = local_keyword_analysis(category, findings)
            return jsonify(analysis)

        else:
            return jsonify({"error": f"Supported categories: HEART, NEURO, KIDNEY, FULL_BODY."}), 400

    except Exception as e:
        logger.error(f"Inference error: {str(e)}")
        return jsonify({"error": "An internal error occurred."}), 500

def get_heart_precautions(risk_level, prediction):
    precautions = [
        "Avoid heavy physical strain until a doctor is consulted.",
        "Monitor your heart rate and blood pressure daily.",
        "Maintain a low-sodium, heart-healthy diet."
    ]
    if risk_level == "High" or prediction == 1:
        precautions.insert(0, "URGENT: Consult a cardiologist immediately.")
    return precautions

def get_neuro_precautions(risk_level, prediction):
    precautions = [
        "Provide this report to your neurologist for clinical correlation.",
        "Ensure follow-up imaging if symptoms persist.",
        "Avoid self-diagnosing based on internet search terms."
    ]
    if risk_level == "High" or prediction:
        precautions.insert(0, "URGENT: Schedule specialized consultation with a Neurosurgeon.")
    return precautions

def get_kidney_precautions(risk_level, prediction):
    precautions = [
        "Monitor blood pressure and blood sugar levels closely.",
        "Reduce salt and protein intake as per physician guidance.",
        "Stay hydrated but avoid excessive fluid if edema is present.",
        "Avoid over-the-counter NSAIDs (like ibuprofen) which can stress kidneys."
    ]
    if risk_level == "High" or prediction == 1:
        precautions.insert(0, "URGENT: Consult a Nephrologist for a comprehensive renal evaluation.")
    return precautions

if __name__ == '__main__':
    logger.info("Saarthi Medical AI Backend started on port 8000 (LOCAL EDITION)")
    app.run(host='0.0.0.0', port=8000, debug=True)