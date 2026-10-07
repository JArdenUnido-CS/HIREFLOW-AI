#!/usr/bin/env python3
"""
HIREFLOW-AI Complete ML Training Pipeline
Orchestrates all ML components: Data → Baseline → Core Model → Explainability
"""

import os
import json
from training_dataset import generate_training_data, save_training_data
from models import train_and_evaluate_models
from explainability import generate_explainability_artifacts


def main():
    """Run complete ML pipeline"""
    
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*58 + "║")
    print("║" + "  HIREFLOW-AI ML TRAINING PIPELINE".center(58) + "║")
    print("║" + "  System Fundamentals Thesis - Midterm Exam".center(58) + "║")
    print("║" + " "*58 + "║")
    print("╚" + "="*58 + "╝")
    
    # ============ STEP 1: GENERATE TRAINING DATA ============
    print("\n[STEP 1/3] Generating Training Dataset")
    print("-" * 60)
    
    print("🔄 Generating 500 candidate-job pair samples...")
    training_data = generate_training_data(num_samples=500)
    
    print("💾 Saving training data...")
    save_training_data(training_data, "ml/training_data.json")
    
    # Print statistics
    labels = [d["label"] for d in training_data]
    matches = sum(labels)
    non_matches = len(labels) - matches
    
    print(f"\n✓ Dataset Generated:")
    print(f"  • Total samples: {len(training_data)}")
    print(f"  • Good matches: {matches} ({100*matches/len(labels):.1f}%)")
    print(f"  • Poor matches: {non_matches} ({100*non_matches/len(labels):.1f}%)")
    print(f"  • Class balance: {matches/non_matches:.2f}:1")
    print(f"  • Features per sample: {len([k for k in training_data[0].keys() if k not in ['label', 'candidate_metadata', 'job_metadata', 'candidate_id', 'job_id']])}")
    
    # ============ STEP 2: TRAIN MODELS ============
    print("\n[STEP 2/3] Training ML Models")
    print("-" * 60)
    
    print("🤖 Training baseline and core models...")
    baseline, core, baseline_metrics, core_metrics = train_and_evaluate_models(
        training_data_path="ml/training_data.json"
    )
    
    print("\n✓ Models Training Complete:")
    print(f"  • Baseline Accuracy: {baseline_metrics['accuracy']:.4f}")
    print(f"  • Core Model Accuracy: {core_metrics['accuracy']:.4f}")
    print(f"  • Improvement: {(core_metrics['accuracy']-baseline_metrics['accuracy'])*100:+.2f}%")
    
    # ============ STEP 3: EXPLAINABILITY ============
    print("\n[STEP 3/3] Generating Model Explainability")
    print("-" * 60)
    
    print("🔍 Analyzing model explanations...")
    explainer, explainability_report = generate_explainability_artifacts()
    
    # ============ SUMMARY ============
    print("\n" + "╔" + "="*58 + "╗")
    print("║" + " "*58 + "║")
    print("║" + "  ✅ ML TRAINING PIPELINE COMPLETE".center(58) + "║")
    print("║" + " "*58 + "║")
    print("╚" + "="*58 + "╝")
    
    print("\n📁 Output Files Generated:")
    print("  ✓ ml/training_data.json")
    print("  ✓ ml/baseline_results.json")
    print("  ✓ ml/core_model_results.json")
    print("  ✓ ml/candidate_matching_model.pkl")
    print("  ✓ ml/explainability_report.json")
    print("  ✓ ml/prediction_examples.json")
    
    print("\n📊 Model Performance Summary:")
    print(f"  Baseline (Logistic Regression):")
    print(f"    • Accuracy:  {baseline_metrics['accuracy']:.4f}")
    print(f"    • Precision: {baseline_metrics['precision']:.4f}")
    print(f"    • Recall:    {baseline_metrics['recall']:.4f}")
    print(f"    • F1-Score:  {baseline_metrics['f1_score']:.4f}")
    
    print(f"\n  Core Model (Random Forest):")
    print(f"    • Accuracy:  {core_metrics['accuracy']:.4f}")
    print(f"    • Precision: {core_metrics['precision']:.4f}")
    print(f"    • Recall:    {core_metrics['recall']:.4f}")
    print(f"    • F1-Score:  {core_metrics['f1_score']:.4f}")
    print(f"    • ROC-AUC:   {core_metrics['roc_auc']:.4f}")
    print(f"    • CV Score:  {core_metrics['cv_mean']:.4f} (±{core_metrics['cv_std']:.4f})")
    
    print("\n🎯 Top 5 Most Important Features:")
    top_features = list(core_metrics['feature_importance'].items())[:5]
    for i, (feature, importance) in enumerate(top_features, 1):
        print(f"  {i}. {feature:30s} {importance:.4f}")
    
    print("\n📚 For Thesis Examination:")
    print("  • DEV-01: Baseline Model ✓ Complete")
    print("  • DEV-02: Core ML Model ✓ Complete")
    print("  • DEV-03: Model Explainability ✓ Complete")
    print("  • Data Validation ✓ Complete")
    print("  • Model Evaluation ✓ Complete")
    
    print("\n🚀 Next Steps:")
    print("  1. Integrate model into API (DES-05)")
    print("  2. Add prediction endpoint")
    print("  3. Add explainability to dashboard")
    print("  4. Test end-to-end flow")
    print("  5. Create presentation slides")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    main()
