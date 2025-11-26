# Brightpoint Training Analysis Dashboard

A comprehensive React application for analyzing pre-test and post-test data from training programs to measure learning effectiveness, identify knowledge gaps, and support data-driven decisions about curriculum improvements.

## 🎯 Features

### Core Functionality
- **CSV Upload & Processing**: Drag-and-drop CSV upload with visual feedback
- **Course Selection**: Interactive cards showing course statistics and participant counts
- **Learning Gains Analysis**: Automatic matching of pre/post assessments with learning gain calculations
- **Summary Statistics Dashboard**: Key metrics including averages, medians, pass rates, and completion rates
- **Interactive Charts**:
  - Pre vs Post comparison bar chart
  - Learning gain distribution histogram
  - Score distribution charts
  - Baseline knowledge vs learning gain scatter plot
- **Individual Results Table**: Sortable, filterable table with export functionality
- **Data Quality Checks**: Identifies incomplete assessments and unusual patterns
- **LocalStorage Caching**: Automatically saves your last uploaded dataset

### User Experience
- Clean, professional UI with Tailwind CSS
- Responsive design that works on all screen sizes
- Color-coded results (green for improvement, yellow for no change, red for decline)
- Helpful tooltips explaining metrics
- CSV export functionality for reports

## 📋 Requirements

- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher

## 🚀 Getting Started

### Installation

1. Navigate to the project directory:
```bash
cd training-analysis-app
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will open in your browser at `http://localhost:5173`

### Building for Production

To create a production build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## 📊 CSV Data Format

The application expects CSV exports from UKG Learning Pro with the following structure:

- **Lines 1-7**: Metadata (automatically skipped)
- **Line 8**: Column headers
- **Line 9+**: Data records

### Required Fields

- `Legal Firstname`: Legal first name of participant
- `Preferred Firstname`: Preferred first name (optional)
- `Lastname`: Last name
- `Email`: Email address (used to match pre/post assessments)
- `Exam Id`: Unique exam identifier
- `Exam Title`: Should include "Pre" or "Post" to identify assessment type
- `Current Passing Score`: Passing threshold
- `Score`: Raw score
- `Full Score`: Maximum possible score
- `Passed`: "Yes" or "No"
- `Rate (%)`: Percentage score
- `Start Date`: Assessment date
- `Course`: Course name

### Example CSV Structure

```csv
[Metadata Line 1]
[Metadata Line 2]
...
[Metadata Line 7]
Legal Firstname,Preferred Firstname,Lastname,Email,Exam Id,Exam Title,Current Passing Score,Score,Full Score,Passed,Rate (%),Start Date,Course
John,Johnny,Doe,john.doe@example.com,12345,Pre-Assessment,80,45,50,No,90,2024-01-15,ARC 101
John,Johnny,Doe,john.doe@example.com,12346,Post-Assessment,80,48,50,Yes,96,2024-02-15,ARC 101
```

## 🎓 How to Use

### 1. Upload Your Data

- Click the upload area or drag and drop your CSV file
- The application will automatically parse and validate the data
- Data is cached in your browser for future sessions

### 2. Select a Course

- View all available courses with participant counts
- Click on a course card to begin analysis

### 3. Review Analysis

The dashboard provides:

- **Summary Statistics**: Total participants, average learning gains, pass rates
- **Visual Analytics**: Charts showing score distributions and learning patterns
- **Individual Results**: Detailed table of each participant's performance
- **Data Quality Alerts**: Identifies incomplete assessments or concerning patterns

### 4. Export Results

- Filter and sort the results table as needed
- Click "Export CSV" to download filtered results for reports

## 🔍 Understanding the Metrics

### Learning Gain
The absolute difference between post-test and pre-test scores:
```
Learning Gain = Post Score - Pre Score
```

### Percentage Improvement
The percentage of possible improvement achieved:
```
Percentage Improvement = (Learning Gain / (Full Score - Pre Score)) × 100
```

### Pass Rate
Percentage of participants who achieved a passing score:
```
Pass Rate = (Passed Count / Total Participants) × 100
```

## 🎨 Customization

### Brand Colors

The application uses Brightpoint's color scheme, defined in `tailwind.config.js`:

```javascript
brightpoint: {
  blue: '#0066CC',
  green: '#00A651',
  orange: '#FF6B35',
}
```

### Modifying Thresholds

To adjust what constitutes a "significant decline" in the data quality checks, edit:
```javascript
// src/components/DataQuality.jsx
const significantDecline = analysisData.filter(d => d.learningGain < -10);
```

## 📁 Project Structure

```
training-analysis-app/
├── src/
│   ├── components/          # React components
│   │   ├── CSVUpload.jsx    # File upload interface
│   │   ├── CourseSelector.jsx   # Course selection cards
│   │   ├── StatsDashboard.jsx   # Summary statistics
│   │   ├── Charts.jsx       # Recharts visualizations
│   │   ├── ResultsTable.jsx # Individual results table
│   │   └── DataQuality.jsx  # Data quality alerts
│   ├── utils/               # Utility functions
│   │   ├── dataProcessing.js    # Data analysis logic
│   │   └── localStorage.js      # Browser storage
│   ├── App.jsx              # Main application component
│   ├── index.css            # Tailwind CSS styles
│   └── main.jsx             # Application entry point
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── README.md               # This file
```

## 🛠 Technologies Used

- **React 18**: UI framework
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Charting library
- **PapaParse**: CSV parsing library
- **Lucide React**: Icon library

## 🔒 Privacy & Data Security

- All data processing happens in your browser
- No data is sent to external servers
- Data is stored locally using browser localStorage
- Clearing your browser data will remove cached datasets

## 🐛 Troubleshooting

### CSV Upload Fails

- Ensure your CSV has the correct structure (7 metadata lines + header + data)
- Verify all required fields are present
- Check for special characters that might break CSV parsing

### Charts Not Displaying

- Ensure you have selected a course with matched pre/post assessments
- Check browser console for errors
- Try refreshing the page

### Performance Issues

- For very large datasets (1000+ records), consider filtering by date range
- Clear browser cache if the application feels slow
- Use CSV export to work with subsets of data

## 📧 Support

For questions or issues related to the application, contact your IT department or the Learning & Development team.

## 📄 License

This application is built for internal use by Brightpoint healthcare organization.

---

**Built for Brightpoint's Learning & Development Team**
