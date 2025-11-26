import { useState, useEffect, useMemo } from 'react';
import { Activity, Database, RefreshCw } from 'lucide-react';
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

  // Load cached data on mount
  useEffect(() => {
    const cached = loadFromLocalStorage();
    const info = getCacheInfo();
    setCacheInfo(info);

    if (cached && cached.length > 0) {
      setRawData(cached);
    }
  }, []);

  // Process data when rawData or selectedCourse changes
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
    const analysisData = calculateLearningGains(matches);
    const stats = calculateStatistics(analysisData);

    return {
      courses,
      courseCounts,
      analysisData,
      stats,
      unmatchedPre,
      unmatchedPost,
    };
  }, [rawData, selectedCourse]);

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
