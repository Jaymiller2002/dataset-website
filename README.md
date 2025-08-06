# Parsed Dataset Viewer

A modern web application for uploading, parsing, and visualizing data files with advanced charting capabilities. Built with React frontend and Flask backend, featuring interactive data visualization including bar charts, stacked bar charts, timeline charts, pie charts, and word clouds.

## Features

### Data Processing

- **Multi-format support**: CSV, Excel, JSON, Parquet, Pickle, and MBOX email files
- **Automatic extraction**: For .mbox files, extracts customer names, ratings, places, review text, and dates
- **Smart filtering**: Only displays rows with complete key information for clarity
- **Keyword extraction**: Automatically extracts and highlights important keywords from text content

### Visualization Options

- **Table View**: Traditional tabular data display with pagination
- **Bubble View**: Color-coded bubbles based on ratings for instant visual feedback
- **Grouped View**: Data grouped by customer for better organization
- **Charts View**: Interactive visualizations including:
  - Bar Charts
  - Stacked Bar Charts
  - Timeline Charts
  - Pie Charts
  - Word Clouds

### User Experience

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Glassmorphism design with smooth animations and transitions
- **Real-time Search**: Filter data on the fly
- **Pagination**: Handle large datasets efficiently
- **Local Storage**: Remembers user preferences and view settings

## Architecture

### Frontend (React)

- **Framework**: React 19.1.0
- **Styling**: CSS3 with modern design principles (gradients, glassmorphism, 3D transforms)
- **Charts**: Chart.js with react-chartjs-2 wrapper
- **Word Cloud**: d3-cloud for custom SVG word cloud generation
- **State Management**: Custom React hooks for modular state logic
- **Build Tool**: Create React App

### Backend (Flask)

- **Framework**: Flask 3.1.1
- **CORS**: flask-cors for cross-origin requests
- **Data Processing**: pandas, numpy for data manipulation
- **Text Analysis**: yake for keyword extraction
- **File Handling**: Support for multiple file formats
- **API Endpoints**: RESTful API for file upload and data retrieval

## Libraries & Dependencies

### Frontend Dependencies

```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-scripts": "5.0.1",
  "chart.js": "^4.5.0",
  "react-chartjs-2": "^5.3.0",
  "d3-cloud": "^1.2.7"
}
```

### Backend Dependencies

```txt
Flask==3.1.1
flask-cors==6.0.1
pandas==2.3.0
numpy==2.3.1
yake==0.6.0
python-dateutil==2.9.0.post0
pytz==2025.2
```

## Deployment

### Production Deployment

#### Frontend (Vercel)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Settings**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
3. **Environment Variables**:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://your-backend.onrender.com`)
4. **Deploy**: Vercel will automatically deploy on git push

#### Backend (Render)

1. **Create Web Service**: Connect your GitHub repository
2. **Configure Settings**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
3. **Environment Variables**: None required for basic setup
4. **Deploy**: Render will automatically deploy on git push

### Local Development

#### Prerequisites

- Python 3.11+
- Node.js 16+
- npm or yarn

#### Backend Setup

```bash
# Clone repository
git clone <your-repo-url>
cd Dataset-website

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```

Backend will run at `http://127.0.0.1:5000`

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run at `http://localhost:3000`

## How to Use

### 1. Upload Data

- Click "📁 Choose File to Upload" button
- Select your data file (CSV, Excel, JSON, Parquet, Pickle, or .mbox)
- The file will be automatically processed and displayed

### 2. Explore Data

- **Table View**: Traditional spreadsheet-style display with pagination
- **Bubble View**: Color-coded bubbles where:
  - 🟢 Green: High ratings (4-5 stars)
  - 🟡 Yellow: Medium ratings (3-4 stars)
  - 🔴 Red: Low ratings (1-3 stars)
- **Grouped View**: Data organized by customer for better analysis
- **Charts View**: Interactive visualizations for data insights

### 3. Filter and Search

- Use the search bar to filter data in real-time
- Toggle "Show Only Positive with Suggestions" to focus on actionable feedback
- Navigate through pages for large datasets

### 4. Analyze with Charts

In Charts View, you can:

- **Bar Charts**: Compare values across categories
- **Stacked Bar Charts**: Show composition of data
- **Timeline Charts**: Track changes over time
- **Pie Charts**: Show proportions and percentages
- **Word Clouds**: Visualize most common terms and keywords

## Project Structure

```
Dataset-website/
├── app.py                          # Flask app entry point
├── parsed_data.py                  # Main Flask backend logic
├── requirements.txt                # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html             # HTML template
│   ├── src/
│   │   ├── App.js                 # Main React component
│   │   ├── App.css                # Global styles
│   │   ├── DataTable.js           # Main data display component
│   │   ├── DataTable.css          # Data table styles
│   │   ├── components/
│   │   │   ├── views/
│   │   │   │   ├── TableView.js   # Table view component
│   │   │   │   ├── BubbleView.js  # Bubble view component
│   │   │   │   ├── GroupedView.js # Grouped view component
│   │   │   │   └── ChartsView.js  # Charts container
│   │   │   └── charts/
│   │   │       ├── BarChart.js    # Bar chart component
│   │   │       ├── StackedBarChart.js
│   │   │       ├── TimelineChart.js
│   │   │       ├── PieChart.js
│   │   │       └── WordCloudChart.js
│   │   └── utils/
│   │       ├── hooks.js           # Custom React hooks
│   │       └── textProcessing.js  # Text processing utilities
│   ├── package.json               # Node.js dependencies
│   └── vercel.json               # Vercel deployment config
└── README.md
```

## Design Features

### Modern UI Elements

- **Glassmorphism**: Translucent backgrounds with backdrop blur
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: CSS transitions and transforms
- **Responsive Design**: Works on all screen sizes
- **Interactive Elements**: Hover effects and visual feedback

### Color Scheme

- **Primary**: Modern blue gradients
- **Success**: Green for positive ratings
- **Warning**: Yellow for neutral ratings
- **Error**: Red for negative ratings
- **Background**: Dark theme with glass effects

## Data Processing

### File Format Support

- **CSV**: Standard comma-separated values
- **Excel**: .xlsx and .xls files
- **JSON**: JavaScript Object Notation
- **Parquet**: Columnar storage format
- **Pickle**: Python serialized objects
- **MBOX**: Email archive format

### MBOX Processing

For .mbox files, the system automatically:

1. **Extracts emails**: Parses email structure and content
2. **Identifies reviews**: Uses regex patterns to find customer reviews
3. **Extracts metadata**: Customer names, ratings, places, dates
4. **Processes text**: Removes boilerplate and extracts keywords
5. **Analyzes sentiment**: Identifies suggestions in positive reviews

## Customization

### Adding New Chart Types

1. Create new component in `frontend/src/components/charts/`
2. Import and add to `ChartsView.js`
3. Update chart selection logic

### Modifying Data Processing

1. Edit functions in `parsed_data.py`
2. Update extraction patterns for new data formats
3. Modify keyword extraction logic

### Styling Changes

1. Update CSS files in `frontend/src/`
2. Modify color schemes and animations
3. Adjust responsive breakpoints

## Troubleshooting

### Common Issues

- **CORS Errors**: Ensure backend CORS settings include frontend domain
- **Build Failures**: Check Node.js and Python versions
- **Deployment Issues**: Verify environment variables and build commands
- **File Upload Errors**: Check file size limits and format support

### Debug Mode

- **Frontend**: Use browser developer tools
- **Backend**: Check Flask debug output
- **Network**: Monitor API requests in browser Network tab

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
