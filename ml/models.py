"""
HIREFLOW-AI Machine Learning Models
DEV-01: Baseline Model (Logistic Regression)
DEV-02: Core ML Model (Random Forest)
"""

import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score, roc_curve
)
import pickle
import warnings
warnings.filterwarnings('ignore')


class CandidateMatchingBaseline:
    """DEV-01: Baseline Model - Logistic Regression"""
    
    def __init__(self):
        self.model = LogisticRegression(max_iter=1000, random_state=42)
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.metrics = {}
    
    def prepare_data(self, training_data):
        """Prepare features and labels"""
        X = []
        y = []
        
        for sample in training_data:
            # Extract numeric features (exclude metadata)
            features = {}
            for key, value in sample.items():
                if key not in ["label", "candidate_metadata", "job_metadata", 
                              "candidate_id", "job_id"]:
                    if isinstance(value, (int, float)):
                        features[key] = value
            
            X.append(features)
            y.append(sample["label"])
        
        # Convert to DataFrame for easier handling
        df = pd.DataFrame(X)
        self.feature_columns = df.columns.tolist()
        
        return df.values, np.array(y)
    
    def train(self, X, y):
        """Train baseline model"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Predictions
        y_pred = self.model.predict(X_test_scaled)
        y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
        
        # Calculate metrics
        self.metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, zero_division=0)),
            "recall": float(recall_score(y_test, y_pred, zero_division=0)),
            "f1_score": float(f1_score(y_test, y_pred, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_test, y_pred_proba)),
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            "classification_report": classification_report(y_test, y_pred, output_dict=True)
        }
        
        return self.metrics
    
    def predict(self, features_dict):
        """Make prediction for new candidate-job pair"""
        # Convert to feature vector
        features = np.array([[features_dict.get(col, 0) for col in self.feature_columns]])
        features_scaled = self.scaler.transform(features)
        
        prediction = self.model.predict(features_scaled)[0]
        confidence = self.model.predict_proba(features_scaled)[0][1]
        
        return {
            "prediction": int(prediction),
            "confidence": float(confidence),
            "match": "Good Match" if prediction == 1 else "Poor Match"
        }


class CandidateMatchingRandomForest:
    """DEV-02: Core ML Model - Random Forest"""
    
    def __init__(self, n_estimators=100):
        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.metrics = {}
        self.feature_importance = {}
    
    def prepare_data(self, training_data):
        """Prepare features and labels"""
        X = []
        y = []
        
        for sample in training_data:
            features = {}
            for key, value in sample.items():
                if key not in ["label", "candidate_metadata", "job_metadata",
                              "candidate_id", "job_id"]:
                    if isinstance(value, (int, float)):
                        features[key] = value
            
            X.append(features)
            y.append(sample["label"])
        
        df = pd.DataFrame(X)
        self.feature_columns = df.columns.tolist()
        
        return df.values, np.array(y)
    
    def train(self, X, y):
        """Train core ML model"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Predictions
        y_pred = self.model.predict(X_test_scaled)
        y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
        
        # Feature importance
        feature_importance = dict(zip(self.feature_columns, self.model.feature_importances_))
        self.feature_importance = dict(sorted(
            feature_importance.items(), 
            key=lambda x: x[1], 
            reverse=True
        ))
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=5)
        
        # Calculate metrics
        self.metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, zero_division=0)),
            "recall": float(recall_score(y_test, y_pred, zero_division=0)),
            "f1_score": float(f1_score(y_test, y_pred, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_test, y_pred_proba)),
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            "cross_validation_scores": cv_scores.tolist(),
            "cv_mean": float(cv_scores.mean()),
            "cv_std": float(cv_scores.std()),
            "feature_importance": {k: float(v) for k, v in list(self.feature_importance.items())[:10]},
            "classification_report": classification_report(y_test, y_pred, output_dict=True)
        }
        
        return self.metrics
    
    def predict(self, features_dict):
        """Make prediction for new candidate-job pair"""
        features = np.array([[features_dict.get(col, 0) for col in self.feature_columns]])
        features_scaled = self.scaler.transform(features)
        
        prediction = self.model.predict(features_scaled)[0]
        confidence = self.model.predict_proba(features_scaled)[0][1]
        
        return {
            "prediction": int(prediction),
            "confidence": float(confidence),
            "match": "Good Match" if prediction == 1 else "Poor Match"
        }
    
    def get_feature_importance(self, top_n=10):
        """Get top N important features"""
        return dict(list(self.feature_importance.items())[:top_n])
    
    def save(self, filepath):
        """Save model and scaler to file"""
        with open(filepath, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'scaler': self.scaler,
                'feature_columns': self.feature_columns,
                'metrics': self.metrics,
                'feature_importance': self.feature_importance
            }, f)
        print(f"✓ Model saved to {filepath}")
    
    @staticmethod
    def load(filepath):
        """Load model and scaler from file"""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
        
        instance = CandidateMatchingRandomForest()
        instance.model = data['model']
        instance.scaler = data['scaler']
        instance.feature_columns = data['feature_columns']
        instance.metrics = data['metrics']
        instance.feature_importance = data['feature_importance']
        return instance


def train_and_evaluate_models(training_data_path="ml/training_data.json"):
    """Train both baseline and core models"""
    
    print("=" * 60)
    print("HIREFLOW-AI ML MODEL TRAINING")
    print("=" * 60)
    
    # Load training data
    with open(training_data_path, 'r') as f:
        training_data = json.load(f)
    
    print(f"\n📊 Loaded {len(training_data)} training samples")
    
    # ============ DEV-01: BASELINE MODEL ============
    print("\n" + "="*60)
    print("DEV-01: BASELINE MODEL - LOGISTIC REGRESSION")
    print("="*60)
    
    baseline = CandidateMatchingBaseline()
    X_base, y_base = baseline.prepare_data(training_data)
    baseline_metrics = baseline.train(X_base, y_base)
    
    print("\n📈 Baseline Model Metrics:")
    print(f"  Accuracy:  {baseline_metrics['accuracy']:.4f}")
    print(f"  Precision: {baseline_metrics['precision']:.4f}")
    print(f"  Recall:    {baseline_metrics['recall']:.4f}")
    print(f"  F1-Score:  {baseline_metrics['f1_score']:.4f}")
    print(f"  ROC-AUC:   {baseline_metrics['roc_auc']:.4f}")
    
    # Save baseline metrics
    with open("ml/baseline_results.json", 'w') as f:
        json.dump(baseline_metrics, f, indent=2)
    print("\n✓ Baseline results saved to ml/baseline_results.json")
    
    # ============ DEV-02: CORE MODEL ============
    print("\n" + "="*60)
    print("DEV-02: CORE MODEL - RANDOM FOREST")
    print("="*60)
    
    core = CandidateMatchingRandomForest(n_estimators=100)
    X_core, y_core = core.prepare_data(training_data)
    core_metrics = core.train(X_core, y_core)
    
    print("\n📈 Core Model Metrics:")
    print(f"  Accuracy:  {core_metrics['accuracy']:.4f}")
    print(f"  Precision: {core_metrics['precision']:.4f}")
    print(f"  Recall:    {core_metrics['recall']:.4f}")
    print(f"  F1-Score:  {core_metrics['f1_score']:.4f}")
    print(f"  ROC-AUC:   {core_metrics['roc_auc']:.4f}")
    print(f"  CV Mean:   {core_metrics['cv_mean']:.4f} (±{core_metrics['cv_std']:.4f})")
    
    print("\n🎯 Top 10 Important Features:")
    for i, (feature, importance) in enumerate(core_metrics['feature_importance'].items(), 1):
        print(f"  {i:2d}. {feature:30s} {importance:.4f}")
    
    # Save core model
    core.save("ml/candidate_matching_model.pkl")
    
    # Save core metrics
    core_metrics_clean = {k: v for k, v in core_metrics.items() 
                          if k != 'classification_report'}
    with open("ml/core_model_results.json", 'w') as f:
        json.dump(core_metrics_clean, f, indent=2)
    print("\n✓ Core model saved to ml/candidate_matching_model.pkl")
    print("✓ Core results saved to ml/core_model_results.json")
    
    # ============ MODEL COMPARISON ============
    print("\n" + "="*60)
    print("MODEL COMPARISON")
    print("="*60)
    print(f"\n{'Metric':<15} {'Baseline':<15} {'Core RF':<15} {'Improvement'}")
    print("-" * 60)
    
    metrics_to_compare = ['accuracy', 'precision', 'recall', 'f1_score', 'roc_auc']
    for metric in metrics_to_compare:
        baseline_val = baseline_metrics[metric]
        core_val = core_metrics[metric]
        improvement = ((core_val - baseline_val) / baseline_val * 100) if baseline_val > 0 else 0
        
        print(f"{metric:<15} {baseline_val:<15.4f} {core_val:<15.4f} {improvement:+.2f}%")
    
    print("\n" + "="*60)
    print("✅ ML MODEL TRAINING COMPLETE")
    print("="*60)
    
    return baseline, core, baseline_metrics, core_metrics


if __name__ == "__main__":
    train_and_evaluate_models()
