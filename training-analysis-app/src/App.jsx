import { useState, useEffect, useMemo } from 'react';
import { Activity, Database, RefreshCw, Filter, TrendingUp, CheckCircle } from 'lucide-react';
import CSVUpload from './components/CSVUpload';
import CourseSelector from './components/CourseSelector';
import StatsDashboard from './components/StatsDashboard';
import ResultsTable from './components/ResultsTable';
import DataQuality from './components/DataQuality';
import {
  PrePostComparison,
  LearningGainHistogram,
  ScoreDistributionChart,
  BaselineVsGainScatter,
} from './components/Charts';
import {
  getUniqueCourses,
  filterByCourse,
  separateAssessments,
  matchAssessments,
  calculateLearningGains,
  calculateStatistics,
} from './utils/dataProcessing';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  getCacheInfo,
} from './utils/localStorage';

function App() {
  const [rawData, setRawData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [excludeAlreadyProficient, setExcludeAlreadyProficient] = useState(false);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  // Load cached data on mount
  useEffect(() => {
    const cached = loadFromLocalStorage();
    const info = getCacheInfo();
    setCacheInfo(info);

    if (cached && cached.length > 0) {
      setRawData(cached);
    }
  }, []);

  // Process data when rawData, selectedCourse, or filter changes
  const processedData = useMemo(() => {
    if (!rawData) return null;

    const courses = getUniqueCourses(rawData);

    // Calculate course counts
    const courseCounts = {};
    courses.forEach(course => {
      const courseRecords = filterByCourse(rawData, course);
      const { preAssessments, postAssessments } = separateAssessments(courseRecords);
      courseCounts[course] = {
        pre: preAssessments.length,
        post: postAssessments.length,
        total: courseRecords.length,
      };
    });

    if (!selectedCourse) {
      return { courses, courseCounts };
    }

    // Process selected course
    const courseRecords = filterByCourse(rawData, selectedCourse);
    const { preAssessments, postAssessments } = separateAssessments(courseRecords);
    const { matches, unmatchedPre, unmatchedPost } = matchAssessments(
      preAssessments,
      postAssessments
    );
    let analysisData = calculateLearningGains(matches);

    // Store full dataset for comparison
    const allParticipantsData = analysisData;
    const allParticipantsStats = calculateStatistics(allParticipantsData);

    // Filter to only course completers (passed post-assessment) if requested
    let incompleteCount = 0;
    if (showCompletedOnly) {
      const filtered = analysisData.filter(d => d.postPassed);
      incompleteCount = analysisData.length - filtered.length;
      analysisData = filtered;
    }

    // Filter out already proficient if requested
    let excludedCount = 0;
    if (excludeAlreadyProficient) {
      const filtered = analysisData.filter(d => d.preRate < 100);
      excludedCount = analysisData.length - filtered.length;
      analysisData = filtered;
    }

    const stats = calculateStatistics(analysisData);

    return {
      courses,
      courseCounts,
      analysisData,
      stats,
      unmatchedPre,
      unmatchedPost,
      allParticipantsData,
      allParticipantsStats,
      excludedCount,
      incompleteCount,
    };
  }, [rawData, selectedCourse, excludeAlreadyProficient, showCompletedOnly]);

  const handleDataLoaded = (data) => {
    setRawData(data);
    setSelectedCourse(null);
    saveToLocalStorage(data);
    setCacheInfo(getCacheInfo());
  };

  const handleClearData = () => {
    setRawData(null);
    setSelectedCourse(null);
    clearLocalStorage();
    setCacheInfo(null);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Training Analysis Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Brightpoint Learning & Development
                </p>
              </div>
            </div>
            {rawData && (
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Data
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cache Info */}
        {cacheInfo && !rawData && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-600" />
            <div className="flex-1 text-sm text-blue-800">
              <p>
                <strong>Cached data available:</strong> {cacheInfo.recordCount} records from{' '}
                {new Date(cacheInfo.timestamp).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setRawData(loadFromLocalStorage())}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Load Cached Data
            </button>
          </div>
        )}

        <div className="space-y-8">
          {/* Upload Section */}
          {!rawData && <CSVUpload onDataLoaded={handleDataLoaded} />}

          {/* Course Selection */}
          {rawData && processedData && !selectedCourse && (
            <CourseSelector
              courses={processedData.courses}
              courseCounts={processedData.courseCounts}
              selectedCourse={selectedCourse}
              onCourseSelect={handleCourseSelect}
            />
          )}

          {/* Analysis Results */}
          {selectedCourse && processedData && (
            <>
              {/* Back Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  ← Back to Course Selection
                </button>
                <div className="text-gray-600">
                  <span className="font-semibold text-gray-900">{selectedCourse}</span>
                </div>
              </div>

              {/* Course Completers Filter */}
              <div className="card bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Course Completers Only
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Show only participants who passed the post-assessment.
                        This focuses on those who successfully completed the training.
                      </p>
                      {processedData.incompleteCount > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                            {processedData.incompleteCount} non-passers excluded
                          </span>
                          <span className="text-gray-600">
                            • Analyzing {processedData.analysisData.length} course completers
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCompletedOnly(!showCompletedOnly)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      showCompletedOnly ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        showCompletedOnly ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Comparison Stats */}
                {showCompletedOnly && processedData.allParticipantsStats && processedData.incompleteCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">All Participants</div>
                        <div className="text-2xl font-bold text-gray-400">
                          +{(processedData.allParticipantsStats.averagePostScore - processedData.allParticipantsStats.averagePreScore).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">average gain</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Completers</div>
                        <div className="text-2xl font-bold text-green-700">
                          +{(processedData.stats.averagePostScore - processedData.stats.averagePreScore).toFixed(0)}%
                        </div>
                        <div className="text-xs text-green-600 font-medium">average gain</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Toggle */}
              <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Filter className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Focus on Learning Group
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Exclude participants who scored 100% on the pre-test (already proficient).
                        This shows the true training impact on those who needed to learn.
                      </p>
                      {processedData.excludedCount > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                            {processedData.excludedCount} already proficient excluded
                          </span>
                          <span className="text-gray-600">
                            • Analyzing {processedData.analysisData.length} participants who had room to grow
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setExcludeAlreadyProficient(!excludeAlreadyProficient)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      excludeAlreadyProficient ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        excludeAlreadyProficient ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Comparison Stats */}
                {excludeAlreadyProficient && processedData.allParticipantsStats && processedData.excludedCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">All Participants</div>
                        <div className="text-2xl font-bold text-gray-400">
                          +{(processedData.allParticipantsStats.averagePostScore - processedData.allParticipantsStats.averagePreScore).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">average gain</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Learning Group</div>
                        <div className="text-2xl font-bold text-purple-700">
                          +{(processedData.stats.averagePostScore - processedData.stats.averagePreScore).toFixed(0)}%
                        </div>
                        <div className="text-xs text-purple-600 font-medium">average gain</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Statistics Dashboard */}
              <StatsDashboard
                stats={processedData.stats}
                analysisData={processedData.analysisData}
              />

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PrePostComparison stats={processedData.stats} />
                <LearningGainHistogram analysisData={processedData.analysisData} />
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ScoreDistributionChart
                  analysisData={processedData.analysisData}
                  type="pre"
                />
                <ScoreDistributionChart
                  analysisData={processedData.analysisData}
                  type="post"
                />
              </div>

              {/* Baseline vs Gain Scatter */}
              <BaselineVsGainScatter analysisData={processedData.analysisData} />

              {/* Data Quality Alerts */}
              <DataQuality
                unmatchedPre={processedData.unmatchedPre}
                unmatchedPost={processedData.unmatchedPost}
                analysisData={processedData.analysisData}
              />

              {/* Results Table */}
              <ResultsTable
                analysisData={processedData.analysisData}
                courseName={selectedCourse}
              />
            </>
          )}

          {/* Welcome Message */}
          {!rawData && !cacheInfo && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Training Analysis
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Upload your CSV export from UKG Learning Pro to begin analyzing training effectiveness,
                identify knowledge gaps, and make data-driven decisions about curriculum improvements.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Built for Brightpoint's Learning & Development team · Data is stored locally in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
