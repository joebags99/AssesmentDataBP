import { TrendingUp, Users, Target, Award, Info } from 'lucide-react';
import { useState } from 'react';

function StatCard({ icon: Icon, label, value, subValue, color = 'blue', tooltip }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-2">
        <Icon className="w-6 h-6" />
        {tooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Info className="w-4 h-4" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {subValue && (
        <div className="text-xs text-gray-600 mt-1">{subValue}</div>
      )}
    </div>
  );
}

export default function StatsDashboard({ stats, analysisData }) {
  if (!stats) {
    return null;
  }

  const improvementRate = (stats.improvementDistribution.improved / stats.totalParticipants) * 100;
  const declineRate = (stats.improvementDistribution.declined / stats.totalParticipants) * 100;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Participants"
            value={stats.totalParticipants}
            subValue="Completed both assessments"
            color="blue"
            tooltip="Number of staff members who completed both pre and post assessments"
          />

          <StatCard
            icon={TrendingUp}
            label="Average Learning Gain"
            value={`${stats.averageLearningGain.toFixed(1)} pts`}
            subValue={`${improvementRate.toFixed(0)}% improved`}
            color="green"
            tooltip="Average score increase from pre to post assessment across all participants"
          />

          <StatCard
            icon={Target}
            label="Post-Assessment Pass Rate"
            value={`${stats.postPassRate.toFixed(0)}%`}
            subValue={`Pre: ${stats.prePassRate.toFixed(0)}%`}
            color="purple"
            tooltip="Percentage of participants who passed the post-assessment vs pre-assessment"
          />

          <StatCard
            icon={Award}
            label="Median Post Score"
            value={`${stats.medianPostScore.toFixed(0)}%`}
            subValue={`Pre: ${stats.medianPreScore.toFixed(0)}%`}
            color="orange"
            tooltip="Middle value of all post-assessment scores (less affected by outliers than average)"
          />
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Score Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Pre-Assessment Average</span>
              <span className="text-lg font-bold text-gray-900">
                {stats.averagePreScore.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.averagePreScore}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Post-Assessment Average</span>
              <span className="text-lg font-bold text-gray-900">
                {stats.averagePostScore.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.averagePostScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Learning Gain Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-3xl font-bold text-green-700 mb-1">
              {stats.improvementDistribution.improved}
            </div>
            <div className="text-sm font-medium text-green-600">Improved</div>
            <div className="text-xs text-green-500 mt-1">
              {improvementRate.toFixed(0)}% of participants
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-3xl font-bold text-yellow-700 mb-1">
              {stats.improvementDistribution.noChange}
            </div>
            <div className="text-sm font-medium text-yellow-600">No Change</div>
            <div className="text-xs text-yellow-500 mt-1">
              {((stats.improvementDistribution.noChange / stats.totalParticipants) * 100).toFixed(0)}% of participants
            </div>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-3xl font-bold text-red-700 mb-1">
              {stats.improvementDistribution.declined}
            </div>
            <div className="text-sm font-medium text-red-600">Declined</div>
            <div className="text-xs text-red-500 mt-1">
              {declineRate.toFixed(0)}% of participants
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
