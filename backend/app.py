import os
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all origins and methods
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Paths to models
BASE_DIR = r'd:\Ansh_Work\Projects\shahanchor'
HEART_MODEL_PATH = os.path.join(BASE_DIR, 'Heart_model.joblib')
BRAIN_MODEL_PATH = os.path.join(BASE_DIR, 'logistic_regression_model.joblib')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'tfidf_vectorizer.joblib')

# Global variables for models
heart_model = None
brain_model = None
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
            
        if os.path.exists(VECTORIZER_PATH):
            tfidf_vectorizer = joblib.load(VECTORIZER_PATH)
            logger.info("TF-IDF Vectorizer loaded successfully.")
            
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")

load_models()

import pdfplumber
import io

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

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "models_loaded": {
            "heart_model": heart_model is not None,
            "brain_model": brain_model is not None,
            "vectorizer": tfidf_vectorizer is not None
        }
    })

@app.route('/api/v1/analyze-medical', methods=['POST'])
def analyze_medical():
    category = request.form.get('category', 'FULL').upper()
    logger.info(f"Received request for category: {category}")
    
    try:
        if category == 'HEART':
            if heart_model is None:
                return jsonify({"error": "Heart model not loaded on server."}), 500
                
            # Features required by Heart_model.joblib (RandomForest)
            features = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
            
            input_data = {}
            for f in features:
                val = request.form.get(f)
                if val is None:
                    logger.warning(f"Missing feature in request: {f}")
                    return jsonify({"error": f"Missing required feature: {field_to_label(f)}"}), 400
                try:
                    input_data[f] = float(val)
                except ValueError:
                    return jsonify({"error": f"Invalid numeric value for {field_to_label(f)}"}), 400
            
            # Convert to DataFrame for prediction
            sample_df = pd.DataFrame([input_data])
            
            # Get prediction and probabilities
            prediction = int(heart_model.predict(sample_df)[0])
            probabilities = heart_model.predict_proba(sample_df)[0]
            confidence = float(probabilities[1] if prediction == 1 else probabilities[0])
            
            risk_level = "High" if probabilities[1] > 0.7 else "Moderate" if probabilities[1] > 0.3 else "Low"
            
            return jsonify({
                "probability": f"{confidence*100:.1f}%",
                "risk_level": risk_level,
                "statement": "Cardiovascular Health Risk Assessment",
                "explanation": f"The model has analyzed your clinical parameters. A {'positive' if prediction == 1 else 'negative'} indication for heart disease was found with {confidence*100:.1f}% confidence.",
                "diagnostic": {
                    "Classification": "Positive" if prediction == 1 else "Negative",
                    "Risk Score": round(float(probabilities[1]), 4),
                    "Analyzed Features": input_data
                },
                "precautions": get_heart_precautions(risk_level, prediction),
                "disclaimer": "DISCLAIMER: This is an AI prediction based on the UCI Heart Disease dataset patterns. This is NOT a clinical diagnosis."
            })

        elif category == 'NEURO' or category == 'MRI':
            if brain_model is None or tfidf_vectorizer is None:
                return jsonify({"error": "Neurological models not loaded on server."}), 500
            
            findings = ""
            # Check if a file was uploaded
            if 'file' in request.files:
                file = request.files['file']
                if file.filename.endswith('.pdf'):
                    findings = extract_text_from_pdf(file)
                    if findings is None:
                        return jsonify({"error": "Failed to extract text from PDF."}), 400
                else:
                    return jsonify({"error": "Only PDF files are supported for Neuro category uploads."}), 400
            else:
                # Fallback to text input
                findings = request.form.get('findings', '')
                
            if not findings or len(findings.strip()) < 5:
                return jsonify({"error": "Please provide a detailed MRI PDF report or findings text."}), 400
            
            # Vectorize text
            vectorized_text = tfidf_vectorizer.transform([findings])
            
            # Predict
            prediction = brain_model.predict(vectorized_text)[0]
            probabilities = brain_model.predict_proba(vectorized_text)[0]
            # Classes are usually [False, True] or [0, 1]
            prob_index = 1 if len(probabilities) > 1 else 0
            risk_prob = float(probabilities[prob_index])
            
            risk_level = "High" if risk_prob > 0.7 else "Moderate" if risk_prob > 0.3 else "Low"
            
            return jsonify({
                "probability": f"{risk_prob*100:.1f}%",
                "risk_level": risk_level,
                "statement": "Neurological MRI Report Analysis",
                "explanation": f"The NLP model identified keyword patterns indicative of a {'significant' if prediction else 'low-probability'} abnormal finding.",
                "diagnostic": {
                    "Detected Condition": "Abnormal Pattern" if prediction else "Normal Pattern",
                    "NLP Confidence": round(risk_prob, 4),
                    "Extracted Text Snippet": findings[:200] + "..." if len(findings) > 200 else findings
                },
                "precautions": get_neuro_precautions(risk_level, prediction),
                "disclaimer": "DISCLAIMER: AI-based text analysis can misinterpret medical context. High-risk results require immediate radiological review."
            })

        else:
            return jsonify({
                "error": f"The {category} category is currently in data-collection phase. Currently supported: HEART, NEURO."
            }), 400

    except Exception as e:
        logger.error(f"Inference error: {str(e)}")
        return jsonify({"error": "An internal error occurred during model inference."}), 500

def field_to_label(field):
    mapping = {
        "age": "Age", "sex": "Gender", "cp": "Chest Pain Type", "trestbps": "Resting Blood Pressure",
        "chol": "Cholesterol", "fbs": "Fasting Blood Sugar", "restecg": "Resting ECG",
        "thalach": "Max Heart Rate", "exang": "Exercise Induced Angina", "oldpeak": "ST Depression",
        "slope": "ST Slope", "ca": "Vessels Colored by Fluroscopy", "thal": "Thalassemia"
    }
    return mapping.get(field, field)

def get_heart_precautions(risk_level, prediction):
    precautions = [
        "Avoid heavy physical strain until a doctor is consulted.",
        "Monitor your heart rate and blood pressure daily.",
        "Maintain a low-sodium, heart-healthy diet."
    ]
    if risk_level == "High" or prediction == 1:
        precautions.insert(0, "URGENT: Consult a cardiologist immediately for an exercise stress test or ECG.")
    return precautions

def get_neuro_precautions(risk_level, prediction):
    precautions = [
        "Provide this report to your neurologist for clinical correlation.",
        "Ensure you have a follow-up imaging session if symptoms persist.",
        "Avoid self-diagnosing based on internet search terms."
    ]
    if risk_level == "High" or prediction:
        precautions.insert(0, "URGENT: Schedule a specialized consultation with a Neurosurgeon or Senior Physician.")
    return precautions

if __name__ == '__main__':
    logger.info("Saarthi Medical AI Backend started on port 8000")
    app.run(host='0.0.0.0', port=8000, debug=True)
