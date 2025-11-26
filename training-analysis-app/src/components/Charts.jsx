import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';
import { getLearningGainDistribution, getScoreDistribution } from '../utils/dataProcessing';

export function PrePostComparison({ stats }) {
  const data = [
    {
      name: 'Average Score',
      'Pre-Assessment': stats.averagePreScore,
      'Post-Assessment': stats.averagePostScore,
    },
    {
      name: 'Median Score',
      'Pre-Assessment': stats.medianPreScore,
      'Post-Assessment': stats.medianPostScore,
    },
  ];

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Pre vs Post Assessment Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Pre-Assessment" fill="#3B82F6" />
          <Bar dataKey="Post-Assessment" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LearningGainHistogram({ analysisData }) {
  const learningGains = analysisData.map(d => d.learningGain);
  const distribution = getLearningGainDistribution(learningGains);

  const data = distribution.map(bin => ({
    range: bin.range,
    count: bin.count,
    fill: bin.min < 0 ? '#EF4444' : bin.min === 0 ? '#F59E0B' : '#10B981',
  }));

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Learning Gain Distribution</h3>
      <p className="text-sm text-gray-600 mb-4">
        Number of participants by score change from pre to post assessment
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600">Decline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">No Change</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Improvement</span>
        </div>
      </div>
    </div>
  );
}

export function ScoreDistributionChart({ analysisData, type = 'pre' }) {
  const scores = type === 'pre'
    ? analysisData.map(d => d.preRate)
    : analysisData.map(d => d.postRate);

  const distribution = getScoreDistribution(scores, 10);

  const data = distribution.map(bin => ({
    range: bin.range,
    count: bin.count,
  }));

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {type === 'pre' ? 'Pre-Assessment' : 'Post-Assessment'} Score Distribution
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="count"
            fill={type === 'pre' ? '#3B82F6' : '#10B981'}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BaselineVsGainScatter({ analysisData }) {
  const data = analysisData.map(d => ({
    preScore: d.preRate,
    learningGain: d.learningGain,
    name: `${d.displayName} ${d.lastname}`,
  }));

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Baseline Knowledge vs Learning Gain
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Does pre-test score affect how much participants learn?
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="preScore"
            name="Pre-Test Score"
            unit="%"
            domain={[0, 100]}
            label={{ value: 'Pre-Test Score (%)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            type="number"
            dataKey="learningGain"
            name="Learning Gain"
            label={{ value: 'Learning Gain (points)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{data.name}</p>
                    <p className="text-sm text-gray-600">
                      Pre-Test: {data.preScore.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Learning Gain: {data.learningGain.toFixed(1)} pts
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter data={data} fill="#8B5CF6" />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Insight:</strong> This chart helps identify if starting knowledge level impacts learning.
        Look for patterns - do those with lower pre-test scores show greater gains, or is learning consistent across all baseline levels?
      </div>
    </div>
  );
}
