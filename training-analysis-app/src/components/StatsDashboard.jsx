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

  // Calculate percentage point gain (more meaningful than raw points for small quizzes)
  const percentagePointGain = stats.averagePostScore - stats.averagePreScore;
  const relativeImprovement = stats.averagePreScore > 0
    ? ((percentagePointGain / stats.averagePreScore) * 100)
    : 0;

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
            label="Average Score Improvement"
            value={`+${percentagePointGain.toFixed(0)}%`}
            subValue={`${improvementRate.toFixed(0)}% of staff improved`}
            color="green"
            tooltip="Average percentage point increase from pre to post assessment. This shows how much knowledge improved on average."
          />

          <StatCard
            icon={Target}
            label="Post-Assessment Pass Rate"
            value={`${stats.postPassRate.toFixed(0)}%`}
            subValue={`Up from ${stats.prePassRate.toFixed(0)}%`}
            color="purple"
            tooltip="Percentage of participants who passed the post-assessment compared to pre-assessment"
          />

          <StatCard
            icon={Award}
            label="Average Post Score"
            value={`${stats.averagePostScore.toFixed(0)}%`}
            subValue={`Started at ${stats.averagePreScore.toFixed(0)}%`}
            color="orange"
            tooltip="Average post-assessment score showing overall mastery level achieved"
          />
        </div>
      </div>

      <div className="card bg-gradient-to-br from-blue-50 to-green-50 border-2 border-green-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Knowledge Growth</h3>

        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Before Training</div>
            <div className="text-4xl font-bold text-blue-700">
              {stats.averagePreScore.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Average mastery</div>
          </div>

          <div className="px-8 py-4 bg-white rounded-lg shadow-md border-2 border-green-500">
            <div className="text-sm text-gray-600 mb-1 text-center">Score Gain</div>
            <div className="text-3xl font-bold text-green-600 text-center">
              +{percentagePointGain.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600 mt-1 text-center font-medium">
              percentage points
            </div>
          </div>

          <div className="flex-1 text-right">
            <div className="text-sm text-gray-600 mb-1">After Training</div>
            <div className="text-4xl font-bold text-green-700">
              {stats.averagePostScore.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Average mastery</div>
          </div>
        </div>

        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-1000"
            style={{ width: `${stats.averagePreScore}%` }}
          ></div>
          <div
            className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-1000 delay-300"
            style={{ width: `${stats.averagePostScore}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Mastery Achievement (80%+)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Number of participants who achieved mastery level (80% or higher, typically 4/5 or 5/5 on quizzes)
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Before Training</div>
            <div className="relative h-32 bg-gray-200 rounded-lg flex items-end overflow-hidden">
              <div
                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-1000 flex items-center justify-center"
                style={{ height: `${Math.max((stats.preMasteryCount / stats.totalParticipants) * 100, 5)}%` }}
              >
                <span className="text-white font-bold text-lg">
                  {stats.preMasteryCount}
                </span>
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="text-2xl font-bold text-blue-700">{stats.preMasteryCount}</div>
              <div className="text-xs text-gray-600">
                {((stats.preMasteryCount / stats.totalParticipants) * 100).toFixed(0)}% at mastery
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">After Training</div>
            <div className="relative h-32 bg-gray-200 rounded-lg flex items-end overflow-hidden">
              <div
                className="w-full bg-gradient-to-t from-purple-600 to-purple-400 transition-all duration-1000 delay-300 flex items-center justify-center"
                style={{ height: `${Math.max((stats.postMasteryCount / stats.totalParticipants) * 100, 5)}%` }}
              >
                <span className="text-white font-bold text-lg">
                  {stats.postMasteryCount}
                </span>
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="text-2xl font-bold text-purple-700">{stats.postMasteryCount}</div>
              <div className="text-xs text-gray-600">
                {((stats.postMasteryCount / stats.totalParticipants) * 100).toFixed(0)}% at mastery
              </div>
            </div>
          </div>
        </div>

        {stats.postMasteryCount > stats.preMasteryCount && (
          <div className="mt-4 p-3 bg-purple-100 border border-purple-300 rounded-lg text-center">
            <div className="text-sm font-medium text-purple-800">
              🎉 {stats.postMasteryCount - stats.preMasteryCount} more participant{stats.postMasteryCount - stats.preMasteryCount !== 1 ? 's' : ''} achieved mastery!
            </div>
          </div>
        )}
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
