"""
CoalTrade AI - Price Prediction Model Training
Uses Random Forest Regression trained on coal import/export data
University of Lahore - FYP
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import os
import json

# ─── Generate Training Data ────────────────────────────────────
def generate_coal_dataset(n_samples=2000):
    """
    Generate realistic coal price dataset based on international coal market data.
    Features: coal_type, calorific_value, ash_content, moisture_content, sulfur_content, quantity
    Target: price_per_ton (USD)
    """
    np.random.seed(42)

    coal_types = ['Anthracite', 'Bituminous', 'Sub-Bituminous', 'Lignite', 'Coking Coal', 'Thermal Coal']
    base_prices = {
        'Anthracite': 190, 'Bituminous': 130, 'Sub-Bituminous': 95,
        'Lignite': 55, 'Coking Coal': 230, 'Thermal Coal': 110
    }

    records = []
    for _ in range(n_samples):
        coal_type = np.random.choice(coal_types)
        base = base_prices[coal_type]

        # Coal quality parameters
        calorific_value = np.random.uniform(4500, 8000)
        ash_content = np.random.uniform(5, 35)
        moisture_content = np.random.uniform(2, 25)
        sulfur_content = np.random.uniform(0.3, 3.5)
        quantity = np.random.uniform(100, 50000)

        # Price formula: base price adjusted by quality
        cv_factor = (calorific_value - 4500) / 3500 * 0.3      # higher CV = higher price
        ash_factor = -(ash_content - 10) / 25 * 0.15           # higher ash = lower price
        moisture_factor = -(moisture_content - 5) / 20 * 0.10  # higher moisture = lower price
        sulfur_factor = -(sulfur_content - 0.5) / 3 * 0.10    # higher sulfur = lower price
        quantity_factor = -np.log(quantity / 1000) * 0.02      # bulk discount

        price = base * (1 + cv_factor + ash_factor + moisture_factor + sulfur_factor + quantity_factor)
        price += np.random.normal(0, price * 0.05)  # 5% noise
        price = max(price, 20)  # Minimum price floor

        records.append({
            'coal_type': coal_type,
            'calorific_value': round(calorific_value, 2),
            'ash_content': round(ash_content, 2),
            'moisture_content': round(moisture_content, 2),
            'sulfur_content': round(sulfur_content, 3),
            'quantity': round(quantity, 2),
            'price_per_ton': round(price, 2)
        })

    return pd.DataFrame(records)

# ─── Train Model ───────────────────────────────────────────────
def train_model():
    print("🔧 CoalTrade AI - Training Price Prediction Model")
    print("=" * 55)

    # Generate dataset
    df = generate_coal_dataset(2000)
    print(f"✅ Dataset generated: {len(df)} samples")

    # Save dataset
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/coal_dataset.csv', index=False)
    print("✅ Dataset saved to data/coal_dataset.csv")

    # Encode categorical features
    le = LabelEncoder()
    df['coal_type_encoded'] = le.fit_transform(df['coal_type'])

    # Features and target
    feature_cols = ['coal_type_encoded', 'calorific_value', 'ash_content',
                    'moisture_content', 'sulfur_content', 'quantity']
    X = df[feature_cols]
    y = df['price_per_ton']

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Random Forest (primary model)
    print("\n📊 Training Random Forest Regressor...")
    rf_model = RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_scaled, y_train)

    # Train Gradient Boosting (secondary for ensemble)
    print("📊 Training Gradient Boosting Regressor...")
    gb_model = GradientBoostingRegressor(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    gb_model.fit(X_train_scaled, y_train)

    # Evaluate
    rf_preds = rf_model.predict(X_test_scaled)
    gb_preds = gb_model.predict(X_test_scaled)
    ensemble_preds = (rf_preds * 0.6 + gb_preds * 0.4)

    print("\n📈 Model Performance:")
    print(f"  Random Forest  - R²: {r2_score(y_test, rf_preds):.4f} | MAE: {mean_absolute_error(y_test, rf_preds):.2f} | RMSE: {np.sqrt(mean_squared_error(y_test, rf_preds)):.2f}")
    print(f"  Gradient Boost - R²: {r2_score(y_test, gb_preds):.4f} | MAE: {mean_absolute_error(y_test, gb_preds):.2f} | RMSE: {np.sqrt(mean_squared_error(y_test, gb_preds)):.2f}")
    print(f"  Ensemble       - R²: {r2_score(y_test, ensemble_preds):.4f} | MAE: {mean_absolute_error(y_test, ensemble_preds):.2f} | RMSE: {np.sqrt(mean_squared_error(y_test, ensemble_preds)):.2f}")

    # Cross-validation
    cv_scores = cross_val_score(rf_model, X_train_scaled, y_train, cv=5, scoring='r2')
    print(f"\n  Cross-validation R² (5-fold): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Save models and artifacts
    os.makedirs('models', exist_ok=True)
    joblib.dump(rf_model, 'models/rf_model.pkl')
    joblib.dump(gb_model, 'models/gb_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    joblib.dump(le, 'models/label_encoder.pkl')

    # Save model metadata
    metadata = {
        'rf_r2': round(r2_score(y_test, rf_preds), 4),
        'gb_r2': round(r2_score(y_test, gb_preds), 4),
        'ensemble_r2': round(r2_score(y_test, ensemble_preds), 4),
        'rf_mae': round(mean_absolute_error(y_test, rf_preds), 2),
        'training_samples': len(df),
        'features': feature_cols,
        'coal_types': le.classes_.tolist(),
        'cv_mean': round(cv_scores.mean(), 4),
        'cv_std': round(cv_scores.std(), 4)
    }
    with open('models/metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print("\n✅ Models saved to models/ directory")
    print("✅ Training complete!\n")
    return metadata

if __name__ == '__main__':
    train_model()
