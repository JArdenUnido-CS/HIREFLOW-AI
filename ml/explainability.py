"""
DEV-03: Model Explainability & Feature Importance
SHAP Analysis for HIREFLOW-AI Candidate Matching Model
"""

import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import shap
from models import CandidateMatchingRandomForest


class ModelExplainability:
    """Analyze and explain ML model predictions"""
    
    def __init__(self, model_path="ml/candidate_matching_model.pkl"):
        self.model = CandidateMatchingRandomForest.load(model_path)
        self.explainer = None
        self.shap_values = None
    
    def prepare_shap_data(self, training_data_path="ml/training_data.json"):
        """Prepare data for SHAP analysis"""
        with open(training_data_path, 'r') as f:
            training_data = json.load(f)
        
        X = []
        for sample in training_data:
            features = {}
            for key, value in sample.items():
                if key not in ["label", "candidate_metadata", "job_metadata",
                              "candidate_id", "job_id"]:
                    if isinstance(value, (int, float)):
                        features[key] = value
            X.append(features)
        
        df = pd.DataFrame(X)
        X_scaled = self.model.scaler.transform(df.values)
        
        return X_scaled, df, self.model.feature_columns
    
    def calculate_shap_values(self, X_scaled, sample_size=100):
        """Calculate SHAP values using TreeExplainer"""
        print("🔄 Calculating SHAP values (this may take a moment)...")
        
        # Use smaller sample for faster computation
        X_sample = X_scaled[:sample_size]
        
        # Create SHAP explainer
        self.explainer = shap.TreeExplainer(self.model.model)
        self.shap_values = self.explainer.shap_values(X_sample)
        
        print("✓ SHAP values calculated")
        return self.shap_values
    
    def get_feature_importance_summary(self):
        """Get feature importance from model"""
        return self.model.get_feature_importance(top_n=15)
    
    def explain_prediction(self, features_dict):
        """Explain a single prediction"""
        # Convert features to array
        features = np.array([[features_dict.get(col, 0) for col in self.model.feature_columns]])
        features_scaled = self.model.scaler.transform(features)
        
        # Get prediction
        prediction = self.model.model.predict(features_scaled)[0]
        confidence = self.model.model.predict_proba(features_scaled)[0][1]
        
        # Get feature contributions (approximation using feature importance)
        base_value = np.mean(self.model.model.predict_proba(
            self.model.scaler.transform(np.zeros((1, len(self.model.feature_columns))))
        )[0][1])
        
        explanation = {
            "prediction": int(prediction),
            "confidence": float(confidence),
            "match": "Good Match" if prediction == 1 else "Poor Match",
            "base_value": float(base_value),
            "feature_importances": self.model.get_feature_importance(top_n=5),
            "explanation": f"Model predicts this is a {'GOOD' if prediction == 1 else 'POOR'} match "
                          f"with {confidence*100:.1f}% confidence"
        }
        
        return explanation
    
    def generate_explainability_report(self):
        """Generate comprehensive explainability report"""
        report = {
            "model_type": "Random Forest Classifier",
            "total_features": len(self.model.feature_columns),
            "feature_names": self.model.feature_columns,
            "model_metrics": self.model.metrics,
            "top_15_important_features": self.get_feature_importance_summary(),
            "explanation_methods": [
                "Feature Importance (Tree-based)",
                "SHAP (SHapley Additive exPlanations)"
            ]
        }
        
        return report


def generate_explainability_artifacts():
    """Generate all explainability visualizations and reports"""
    
    print("=" * 60)
    print("DEV-03: MODEL EXPLAINABILITY & FEATURE IMPORTANCE")
    print("=" * 60)
    
    # Initialize explainability
    explainer = ModelExplainability()
    
    # Prepare data
    X_scaled, df, feature_cols = explainer.prepare_shap_data()
    
    # Calculate SHAP values
    shap_vals = explainer.calculate_shap_values(X_scaled, sample_size=100)
    
    # Generate report
    report = explainer.generate_explainability_report()
    
    print("\n📋 Feature Importance Report:")
    print("\nTop 15 Most Important Features:")
    for i, (feature, importance) in enumerate(report['top_15_important_features'].items(), 1):
        print(f"  {i:2d}. {feature:35s} {importance:7.4f} {'█' * int(importance * 50)}")
    
    # Save report
    with open("ml/explainability_report.json", 'w') as f:
        json.dump(report, f, indent=2)
    print("\n✓ Explainability report saved to ml/explainability_report.json")
    
    # Example predictions with explanations
    print("\n" + "="*60)
    print("EXAMPLE PREDICTIONS WITH EXPLANATIONS")
    print("="*60)
    
    # Good match example
    good_match_features = {
        "years_experience": 5.0,
        "skill_count": 8,
        "soft_skill_count": 4,
        "has_certification": 1,
        "is_remote": 1,
        "technical_skill_score": 0.8,
        "soft_skill_score": 0.6,
        "required_experience": 3,
        "required_skill_count": 6,
        "preferred_skill_count": 2,
        "requires_remote": 1,
        "required_skill_score": 0.6,
        "preferred_skill_score": 0.2
    }
    
    print("\n🎯 Example 1: Strong Candidate-Job Match")
    print("-" * 60)
    explanation1 = explainer.explain_prediction(good_match_features)
    print(f"Result: {explanation1['match']}")
    print(f"Confidence: {explanation1['confidence']*100:.1f}%")
    print(f"Explanation: {explanation1['explanation']}")
    
    # Poor match example
    poor_match_features = {
        "years_experience": 1.0,
        "skill_count": 2,
        "soft_skill_count": 1,
        "has_certification": 0,
        "is_remote": 0,
        "technical_skill_score": 0.2,
        "soft_skill_score": 0.1,
        "required_experience": 5,
        "required_skill_count": 6,
        "preferred_skill_count": 2,
        "requires_remote": 1,
        "required_skill_score": 0.6,
        "preferred_skill_score": 0.2
    }
    
    print("\n❌ Example 2: Weak Candidate-Job Match")
    print("-" * 60)
    explanation2 = explainer.explain_prediction(poor_match_features)
    print(f"Result: {explanation2['match']}")
    print(f"Confidence: {explanation2['confidence']*100:.1f}%")
    print(f"Explanation: {explanation2['explanation']}")
    
    # Save example explanations
    examples = {
        "good_match_example": explanation1,
        "poor_match_example": explanation2
    }
    with open("ml/prediction_examples.json", 'w') as f:
        json.dump(examples, f, indent=2)
    
    print("\n✓ Prediction examples saved to ml/prediction_examples.json")
    
    print("\n" + "="*60)
    print("✅ EXPLAINABILITY ANALYSIS COMPLETE")
    print("="*60)
    
    return explainer, report


if __name__ == "__main__":
    generate_explainability_artifacts()
