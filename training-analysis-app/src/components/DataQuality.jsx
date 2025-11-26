import { AlertTriangle, UserX, TrendingDown, CheckCircle, Info } from 'lucide-react';
import { useState } from 'react';

export default function DataQuality({ unmatchedPre, unmatchedPost, analysisData }) {
  const [showUnmatched, setShowUnmatched] = useState(false);

  const significantDecline = analysisData.filter(d => d.learningGain < -10);
  const totalIssues = unmatchedPre.length + unmatchedPost.length + significantDecline.length;

  if (totalIssues === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle className="w-6 h-6" />
          <div>
            <h3 className="text-xl font-bold">Data Quality: Excellent</h3>
            <p className="text-sm text-green-600 mt-1">
              All participants have matched pre and post assessments with no concerning patterns
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card border-l-4 border-yellow-500">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Data Quality Alerts</h3>
            <p className="text-sm text-gray-600 mt-1">
              Found {totalIssues} potential issue{totalIssues !== 1 ? 's' : ''} requiring attention
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {unmatchedPre.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserX className="w-5 h-5 text-yellow-700" />
                <span className="font-semibold text-yellow-900">
                  {unmatchedPre.length} Incomplete Assessment{unmatchedPre.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-yellow-800 mb-2">
                The following staff completed a pre-assessment but no matching post-assessment:
              </p>
              <button
                onClick={() => setShowUnmatched(!showUnmatched)}
                className="text-sm text-yellow-700 hover:text-yellow-900 font-medium underline"
              >
                {showUnmatched ? 'Hide' : 'Show'} list
              </button>
              {showUnmatched && (
                <ul className="mt-3 space-y-1 text-sm text-yellow-800">
                  {unmatchedPre.map((record, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                      {record['Preferred Firstname'] || record['Legal Firstname']} {record.Lastname} ({record.Email})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {unmatchedPost.length > 0 && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserX className="w-5 h-5 text-orange-700" />
                <span className="font-semibold text-orange-900">
                  {unmatchedPost.length} Post-Assessment Without Pre-Assessment
                </span>
              </div>
              <p className="text-sm text-orange-800">
                These staff completed a post-assessment but have no matching pre-assessment record.
              </p>
            </div>
          )}

          {significantDecline.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-700" />
                <span className="font-semibold text-red-900">
                  {significantDecline.length} Significant Score Decline{significantDecline.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-red-800 mb-3">
                These participants scored significantly lower on the post-assessment (&gt;10 points decline).
                This may indicate testing issues, learning loss, or need for curriculum review.
              </p>
              <ul className="space-y-2 text-sm text-red-800">
                {significantDecline.map((person, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                    <span className="font-medium">
                      {person.displayName} {person.lastname}
                    </span>
                    <span className="text-red-700 font-semibold">
                      {person.learningGain.toFixed(1)} pts
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Recommendations:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Follow up with staff who haven't completed both assessments</li>
              <li>Review cases of significant score decline for potential issues</li>
              <li>Ensure consistent testing conditions for accurate results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
