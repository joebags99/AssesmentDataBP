import { BookOpen, Users, FileCheck } from 'lucide-react';

export default function CourseSelector({ courses, courseCounts, selectedCourse, onCourseSelect }) {
  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Course</h2>
        <p className="text-gray-600">
          Choose a course to analyze learning gains and performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const counts = courseCounts[course] || { pre: 0, post: 0, total: 0 };
          const isSelected = selectedCourse === course;

          return (
            <button
              key={course}
              onClick={() => onCourseSelect(course)}
              className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <BookOpen className={`w-5 h-5 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-lg mb-1 ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {course}
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <FileCheck className="w-4 h-4" />
                    Pre-Assessments
                  </span>
                  <span className="font-semibold text-gray-900">{counts.pre}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <FileCheck className="w-4 h-4" />
                    Post-Assessments
                  </span>
                  <span className="font-semibold text-gray-900">{counts.post}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Matched Pairs
                  </span>
                  <span className="font-bold text-gray-900">
                    {Math.min(counts.pre, counts.post)}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <span className="text-sm font-medium text-blue-700">
                    ✓ Currently analyzing
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No courses found in the uploaded data</p>
        </div>
      )}
    </div>
  );
}
