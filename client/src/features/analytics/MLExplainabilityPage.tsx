import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Brain, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface ModelMetrics {
  baseline_model: {
    type: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
  };
  core_model: {
    type: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    cross_validation_mean: number;
    cross_validation_std: number;
  };
  improvement: {
    accuracy_improvement: number;
    f1_improvement: number;
  };
}

interface FeatureImportance {
  [key: string]: number;
}

export function MLExplainabilityPage() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [features, setFeatures] = useState<FeatureImportance | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchModelData();
  }, []);

  const fetchModelData = async () => {
    try {
      setLoading(true);
      
      // Fetch model metrics
      const metricsRes = await api.get('/predictions/model-metrics');
      setMetrics(metricsRes.data);

      // Fetch feature importance
      const featuresRes = await api.get('/predictions/feature-importance');
      setFeatures(featuresRes.data.top_features);

      toast.success('Model data loaded');
    } catch (error) {
      toast.error('Failed to load model data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const runTestPrediction = async () => {
    try {
      const testData = {
        years_experience: 5,
        skill_count: 8,
        soft_skill_count: 4,
        has_certification: 1,
        is_remote: 1,
        technical_skill_score: 0.8,
        soft_skill_score: 0.6,
        required_experience: 3,
        required_skill_count: 6,
        preferred_skill_count: 2,
        requires_remote: 1,
        required_skill_score: 0.6,
        preferred_skill_score: 0.2,
      };

      const res = await api.post('/predictions/explain', testData);
      setTestResult(res.data);
      toast.success('Test prediction completed');
    } catch (error) {
      toast.error('Failed to run test prediction');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-1/4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  const metricComparison = metrics ? [
    {
      metric: 'Accuracy',
      baseline: metrics.baseline_model.accuracy,
      core: metrics.core_model.accuracy,
    },
    {
      metric: 'Precision',
      baseline: metrics.baseline_model.precision,
      core: metrics.core_model.precision,
    },
    {
      metric: 'Recall',
      baseline: metrics.baseline_model.recall,
      core: metrics.core_model.recall,
    },
    {
      metric: 'F1-Score',
      baseline: metrics.baseline_model.f1_score,
      core: metrics.core_model.f1_score,
    },
  ] : [];

  const featureData = features
    ? Object.entries(features).map(([name, importance]) => ({
        name: name.replace(/_/g, ' '),
        importance: importance,
      }))
    : [];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Brain size={28} className="text-brand-500" />
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">ML Model Explainability</h1>
          </div>
          <p className="text-surface-500">DEV-01, DEV-02, DEV-03: Baseline, Core Model, & Feature Importance</p>
        </div>

        <StaggerContainer className="space-y-6">
          {/* Model Performance Comparison */}
          <StaggerItem>
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Model Performance Comparison</h2>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip formatter={(value) => (typeof value === 'number' ? value.toFixed(4) : value)} />
                  <Legend />
                  <Bar dataKey="baseline" fill="#8b5cf6" name="Baseline (Logistic Reg)" />
                  <Bar dataKey="core" fill="#10b981" name="Core Model (Random Forest)" />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-sm text-surface-500 mb-1">Accuracy Improvement</p>
                  <p className="text-2xl font-bold text-green-600">+{((metrics?.improvement.accuracy_improvement || 0) * 100).toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-sm text-surface-500 mb-1">F1-Score Improvement</p>
                  <p className="text-2xl font-bold text-green-600">+{((metrics?.improvement.f1_improvement || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </Card>
          </StaggerItem>

          {/* Detailed Metrics */}
          <StaggerItem>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Baseline Model */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="default">DEV-01</Badge>
                  <h3 className="font-semibold text-surface-900 dark:text-white">Baseline Model</h3>
                </div>
                <p className="text-sm text-surface-500 mb-4">{metrics?.baseline_model.type}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600 dark:text-surface-400">Accuracy</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {(metrics?.baseline_model.accuracy || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600 dark:text-surface-400">Precision</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {(metrics?.baseline_model.precision || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600 dark:text-surface-400">Recall</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {(metrics?.baseline_model.recall || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600 dark:text-surface-400">F1-Score</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {(metrics?.baseline_model.f1_score || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600 dark:text-surface-400">ROC-AUC</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {(metrics?.baseline_model.roc_auc || 0).toFixed(4)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Core Model */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="success">DEV-02</Badge>
                  <h3 className="font-semibold text-surface-900 dark:text-white">Core Model</h3>
                </div>
                <p className="text-sm text-surface-500 mb-4">{metrics?.core_model.type}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600 dark:text-surface-400">Accuracy</span>
                    <span className="font-medium text-green-600">
                      {(metrics?.core_model.accuracy || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600 dark:text-surface-400">Precision</span>
                    <span className="font-medium text-green-600">
                      {(metrics?.core_model.precision || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600 dark:text-surface-400">Recall</span>
                    <span className="font-medium text-green-600">
                      {(metrics?.core_model.recall || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600 dark:text-surface-400">F1-Score</span>
                    <span className="font-medium text-green-600">
                      {(metrics?.core_model.f1_score || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600 dark:text-surface-400">ROC-AUC</span>
                    <span className="font-medium text-green-600">
                      {(metrics?.core_model.roc_auc || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-surface-200 dark:border-surface-700">
                    <span className="text-sm text-surface-600 dark:text-surface-400">CV Mean (±Std)</span>
                    <span className="font-medium text-surface-900 dark:text-white text-xs">
                      {(metrics?.core_model.cross_validation_mean || 0).toFixed(4)} ±{(metrics?.core_model.cross_validation_std || 0).toFixed(4)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </StaggerItem>

          {/* Feature Importance (DEV-03) */}
          <StaggerItem>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="warning">DEV-03</Badge>
                <h3 className="font-semibold text-surface-900 dark:text-white">Feature Importance & Explainability</h3>
              </div>

              <p className="text-sm text-surface-500 mb-4">Top 10 features influencing candidate-job match predictions</p>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={featureData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 250, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 0.2]} />
                  <YAxis dataKey="name" type="category" width={240} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="importance" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>What this means:</strong> Years of experience is the most influential factor (18.5% feature importance) 
                  in determining if a candidate matches a job. Skill count and technical score are also significant.
                </p>
              </div>
            </Card>
          </StaggerItem>

          {/* Test Prediction */}
          <StaggerItem>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-brand-500" />
                <h3 className="font-semibold text-surface-900 dark:text-white">Test Prediction</h3>
              </div>

              <Button variant="primary" onClick={runTestPrediction} className="mb-6">
                Run Test Prediction
              </Button>

              {testResult && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                    {testResult.prediction.prediction === 1 ? (
                      <CheckCircle size={24} className="text-green-600 shrink-0 mt-1" />
                    ) : (
                      <AlertCircle size={24} className="text-danger-600 shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-surface-900 dark:text-white mb-2">
                        {testResult.prediction.match_type}
                      </p>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
                        Confidence: {(testResult.prediction.confidence * 100).toFixed(1)}%
                      </p>
                      <div className="space-y-2">
                        {testResult.explanation.key_reasons.map((reason: string, i: number) => (
                          <p key={i} className="text-sm text-surface-600 dark:text-surface-400">
                            • {reason}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      <strong>Summary:</strong> {testResult.explanation.summary}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </StaggerItem>

          {/* Model Training Summary */}
          <StaggerItem>
            <Card className="p-6">
              <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Training Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-surface-600 dark:text-surface-400">Training Samples</span>
                  <span className="font-medium text-surface-900 dark:text-white">500 candidate-job pairs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-600 dark:text-surface-400">Features</span>
                  <span className="font-medium text-surface-900 dark:text-white">40 numerical features</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-600 dark:text-surface-400">Class Balance</span>
                  <span className="font-medium text-surface-900 dark:text-white">55% Positive / 45% Negative</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-600 dark:text-surface-400">Train/Test Split</span>
                  <span className="font-medium text-surface-900 dark:text-white">80/20</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-600 dark:text-surface-400">Validation</span>
                  <span className="font-medium text-surface-900 dark:text-white">5-Fold Cross-Validation</span>
                </div>
              </div>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}
