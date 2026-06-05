"""
CoalTrade AI - Flask Price Prediction API
Serves ML model predictions for coal price estimation
University of Lahore - FYP
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import json
import logging
from datetime import datetime

# ─── App Setup ─────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Load Models ───────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

rf_model = None
gb_model = None
scaler = None
label_encoder = None
metadata = {}

def load_models():
    global rf_model, gb_model, scaler, label_encoder, metadata
    try:
        rf_model = joblib.load(os.path.join(MODEL_DIR, 'rf_model.pkl'))
        gb_model = joblib.load(os.path.join(MODEL_DIR, 'gb_model.pkl'))
        scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
        label_encoder = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.pkl'))

        with open(os.path.join(MODEL_DIR, 'metadata.json'), 'r') as f:
            metadata = json.load(f)

        logger.info("✅ AI models loaded successfully")
        return True
    except FileNotFoundError:
        logger.warning("⚠️  Models not found. Run train_model.py first.")
        return False

models_loaded = load_models()

# ─── Helper: encode coal type ──────────────────────────────────
def encode_coal_type(coal_type_str):
    """Fuzzy match coal type string to known labels."""
    if label_encoder is None:
        return 0

    known_types = label_encoder.classes_
    coal_type_lower = coal_type_str.strip().lower()

    # Direct match
    for ct in known_types:
        if ct.lower() == coal_type_lower:
            return label_encoder.transform([ct])[0]

    # Partial match
    for ct in known_types:
        if coal_type_lower in ct.lower() or ct.lower() in coal_type_lower:
            return label_encoder.transform([ct])[0]

    # Keyword match
    if 'anthracite' in coal_type_lower:
        return label_encoder.transform(['Anthracite'])[0]
    elif 'coking' in coal_type_lower:
        return label_encoder.transform(['Coking Coal'])[0]
    elif 'thermal' in coal_type_lower:
        return label_encoder.transform(['Thermal Coal'])[0]
    elif 'lignite' in coal_type_lower or 'brown' in coal_type_lower:
        return label_encoder.transform(['Lignite'])[0]
    elif 'sub' in coal_type_lower:
        return label_encoder.transform(['Sub-Bituminous'])[0]
    elif 'bituminous' in coal_type_lower:
        return label_encoder.transform(['Bituminous'])[0]

    # Default: Thermal Coal (most common)
    return label_encoder.transform(['Thermal Coal'])[0]

# ─── Routes ────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'models_loaded': models_loaded,
        'timestamp': datetime.utcnow().isoformat(),
        'model_accuracy': metadata.get('ensemble_r2', 'N/A'),
        'training_samples': metadata.get('training_samples', 'N/A')
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Extract and validate features
        coal_type = data.get('coal_type', 'Thermal Coal')
        calorific_value = float(data.get('calorific_value') or 5500)
        ash_content = float(data.get('ash_content') or 15)
        moisture_content = float(data.get('moisture_content') or 10)
        sulfur_content = float(data.get('sulfur_content') or 0.8)
        quantity = float(data.get('quantity') or 1000)

        # Clamp to valid ranges
        calorific_value = max(3000, min(9000, calorific_value))
        ash_content = max(0, min(50, ash_content))
        moisture_content = max(0, min(40, moisture_content))
        sulfur_content = max(0, min(5, sulfur_content))
        quantity = max(1, quantity)

        if not models_loaded:
            # Fallback heuristic prediction
            base_prices = {
                'anthracite': 190, 'bituminous': 130, 'sub-bituminous': 95,
                'lignite': 55, 'coking': 230, 'thermal': 110
            }
            ct_lower = coal_type.lower()
            base = 110
            for k, v in base_prices.items():
                if k in ct_lower:
                    base = v
                    break

            cv_adj = (calorific_value - 5500) / 3500 * 30
            ash_adj = -(ash_content - 15) / 25 * 15
            moisture_adj = -(moisture_content - 10) / 20 * 10
            predicted_price = round(max(20, base + cv_adj + ash_adj + moisture_adj), 2)

            return jsonify({
                'predicted_price': predicted_price,
                'confidence': 0.65,
                'model': 'heuristic_fallback',
                'coal_type': coal_type,
                'features_used': {
                    'calorific_value': calorific_value,
                    'ash_content': ash_content,
                    'moisture_content': moisture_content,
                    'sulfur_content': sulfur_content,
                    'quantity': quantity
                }
            })

        # Encode and scale features
        coal_type_encoded = encode_coal_type(coal_type)
        features = np.array([[
            coal_type_encoded, calorific_value, ash_content,
            moisture_content, sulfur_content, quantity
        ]])
        features_scaled = scaler.transform(features)

        # Ensemble prediction
        rf_pred = rf_model.predict(features_scaled)[0]
        gb_pred = gb_model.predict(features_scaled)[0]
        ensemble_pred = rf_pred * 0.6 + gb_pred * 0.4
        predicted_price = round(max(20, ensemble_pred), 2)

        # Price range (±10%)
        lower_bound = round(predicted_price * 0.90, 2)
        upper_bound = round(predicted_price * 1.10, 2)

        return jsonify({
            'predicted_price': predicted_price,
            'price_range': {
                'low': lower_bound,
                'high': upper_bound
            },
            'confidence': round(metadata.get('ensemble_r2', 0.85), 2),
            'model': 'ensemble_rf_gb',
            'coal_type': coal_type,
            'individual_predictions': {
                'random_forest': round(rf_pred, 2),
                'gradient_boosting': round(gb_pred, 2)
            },
            'features_used': {
                'calorific_value': calorific_value,
                'ash_content': ash_content,
                'moisture_content': moisture_content,
                'sulfur_content': sulfur_content,
                'quantity': quantity
            },
            'currency': 'USD',
            'unit': 'per ton'
        })

    except ValueError as e:
        return jsonify({'error': f'Invalid input values: {str(e)}'}), 400
    except Exception as e:
        logger.error(f'Prediction error: {e}')
        return jsonify({'error': 'Prediction failed', 'details': str(e)}), 500

@app.route('/coal-types', methods=['GET'])
def get_coal_types():
    if label_encoder:
        coal_types = label_encoder.classes_.tolist()
    else:
        coal_types = ['Anthracite', 'Bituminous', 'Sub-Bituminous', 'Lignite', 'Coking Coal', 'Thermal Coal']

    return jsonify({'coal_types': coal_types})

@app.route('/model-info', methods=['GET'])
def model_info():
    return jsonify({
        'loaded': models_loaded,
        'metadata': metadata,
        'features': ['coal_type', 'calorific_value', 'ash_content', 'moisture_content', 'sulfur_content', 'quantity'],
        'output': 'price_per_ton_usd'
    })

# ─── Run ───────────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    print(f"\n🤖 CoalTrade AI Flask Model Server")
    print(f"🚀 Running on port {port}")
    print(f"📊 Models loaded: {models_loaded}")
    app.run(host='0.0.0.0', port=port, debug=debug)
