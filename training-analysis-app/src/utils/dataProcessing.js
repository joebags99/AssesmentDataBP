/**
 * Data processing utilities for training analysis
 */

/**
 * Parse CSV data and extract records
 * Assumes first 7 lines are metadata, line 8 has headers
 */
export function parseTrainingData(csvData) {
  // Skip first 7 lines of metadata
  const lines = csvData.split('\n');
  const dataLines = lines.slice(7); // Line 8 onwards

  if (dataLines.length < 2) {
    throw new Error('CSV file does not contain enough data');
  }

  const headers = dataLines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const records = [];

  for (let i = 1; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length !== headers.length) continue;

    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index].trim().replace(/"/g, '');
    });

    // Only add records with essential fields
    if (record.Email && record['Exam Title'] && record.Score) {
      records.push(record);
    }
  }

  return records;
}

/**
 * Parse a CSV line handling quoted values with commas
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Extract unique courses from the data
 */
export function getUniqueCourses(records) {
  const courses = new Set();
  records.forEach(record => {
    if (record.Course) {
      courses.add(record.Course);
    }
  });
  return Array.from(courses).sort();
}

/**
 * Filter records by course
 */
export function filterByCourse(records, courseName) {
  return records.filter(record => record.Course === courseName);
}

/**
 * Separate pre and post assessments
 */
export function separateAssessments(records) {
  const preAssessments = records.filter(r =>
    r['Exam Title']?.toLowerCase().includes('pre')
  );
  const postAssessments = records.filter(r =>
    r['Exam Title']?.toLowerCase().includes('post')
  );

  return { preAssessments, postAssessments };
}

/**
 * Match pre and post assessments by email
 */
export function matchAssessments(preAssessments, postAssessments) {
  const matches = [];
  const unmatchedPre = [];
  const unmatchedPost = [...postAssessments];

  preAssessments.forEach(pre => {
    const postIndex = unmatchedPost.findIndex(post =>
      post.Email.toLowerCase() === pre.Email.toLowerCase()
    );

    if (postIndex !== -1) {
      const post = unmatchedPost.splice(postIndex, 1)[0];
      matches.push({
        email: pre.Email,
        legalFirstname: pre['Legal Firstname'] || '',
        preferredFirstname: pre['Preferred Firstname'] || '',
        lastname: pre.Lastname || '',
        preScore: parseFloat(pre.Score) || 0,
        postScore: parseFloat(post.Score) || 0,
        fullScore: parseFloat(pre['Full Score']) || 100,
        preRate: parseFloat(pre['Rate (%)']) || 0,
        postRate: parseFloat(post['Rate (%)']) || 0,
        prePassed: pre.Passed === 'Yes',
        postPassed: post.Passed === 'Yes',
        preDate: pre['Start Date'],
        postDate: post['Start Date'],
        examTitle: pre['Exam Title'],
      });
    } else {
      unmatchedPre.push(pre);
    }
  });

  return { matches, unmatchedPre, unmatchedPost };
}

/**
 * Calculate learning gains for matched assessments
 */
export function calculateLearningGains(matches) {
  return matches.map(match => {
    const learningGain = match.postScore - match.preScore;
    const possibleGain = match.fullScore - match.preScore;
    const percentageImprovement = possibleGain > 0
      ? (learningGain / possibleGain) * 100
      : 0;

    return {
      ...match,
      learningGain,
      percentageImprovement,
      displayName: match.preferredFirstname || match.legalFirstname,
    };
  });
}

/**
 * Calculate summary statistics
 */
export function calculateStatistics(analysisData) {
  if (!analysisData || analysisData.length === 0) {
    return null;
  }

  const preScores = analysisData.map(d => d.preScore);
  const postScores = analysisData.map(d => d.postScore);
  const learningGains = analysisData.map(d => d.learningGain);

  const avgPre = average(preScores);
  const avgPost = average(postScores);
  const medianPre = median(preScores);
  const medianPost = median(postScores);
  const avgLearningGain = average(learningGains);

  const prePassCount = analysisData.filter(d => d.prePassed).length;
  const postPassCount = analysisData.filter(d => d.postPassed).length;

  const improved = analysisData.filter(d => d.learningGain > 0).length;
  const noChange = analysisData.filter(d => d.learningGain === 0).length;
  const declined = analysisData.filter(d => d.learningGain < 0).length;

  return {
    totalParticipants: analysisData.length,
    averagePreScore: avgPre,
    averagePostScore: avgPost,
    medianPreScore: medianPre,
    medianPostScore: medianPost,
    averageLearningGain: avgLearningGain,
    prePassRate: (prePassCount / analysisData.length) * 100,
    postPassRate: (postPassCount / analysisData.length) * 100,
    improvementDistribution: {
      improved,
      noChange,
      declined,
    },
  };
}

/**
 * Calculate average of an array
 */
function average(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Calculate median of an array
 */
function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;

  // Define headers
  const headers = [
    'Name',
    'Email',
    'Pre-Test Score',
    'Pre-Test %',
    'Pre-Test Pass',
    'Post-Test Score',
    'Post-Test %',
    'Post-Test Pass',
    'Learning Gain',
    'Improvement %',
    'Pre-Test Date',
    'Post-Test Date',
  ];

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      `"${row.displayName} ${row.lastname}"`,
      row.email,
      row.preScore,
      row.preRate.toFixed(1),
      row.prePassed ? 'Yes' : 'No',
      row.postScore,
      row.postRate.toFixed(1),
      row.postPassed ? 'Yes' : 'No',
      row.learningGain.toFixed(1),
      row.percentageImprovement.toFixed(1),
      row.preDate,
      row.postDate,
    ].join(','))
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get score distribution for histogram
 */
export function getScoreDistribution(scores, binSize = 10) {
  const bins = [];
  for (let i = 0; i <= 100; i += binSize) {
    bins.push({
      range: `${i}-${i + binSize}`,
      count: 0,
      min: i,
      max: i + binSize,
    });
  }

  scores.forEach(score => {
    const binIndex = Math.min(Math.floor(score / binSize), bins.length - 1);
    if (binIndex >= 0 && binIndex < bins.length) {
      bins[binIndex].count++;
    }
  });

  return bins;
}

/**
 * Get learning gain distribution
 */
export function getLearningGainDistribution(learningGains) {
  const bins = [
    { range: '< -20', count: 0, min: -Infinity, max: -20 },
    { range: '-20 to -10', count: 0, min: -20, max: -10 },
    { range: '-10 to 0', count: 0, min: -10, max: 0 },
    { range: '0 to 10', count: 0, min: 0, max: 10 },
    { range: '10 to 20', count: 0, min: 10, max: 20 },
    { range: '20 to 30', count: 0, min: 20, max: 30 },
    { range: '> 30', count: 0, min: 30, max: Infinity },
  ];

  learningGains.forEach(gain => {
    const bin = bins.find(b => gain >= b.min && gain < b.max);
    if (bin) bin.count++;
  });

  return bins;
}
