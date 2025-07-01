# Parsed Dataset Viewer

This project allows you to upload and visualize data files (including .mbox email exports) using a modern React frontend and a Python (Flask) backend. It is designed to help you extract, parse, and explore structured information such as customer reviews, ratings, and more from various data formats.

## Features

- **Upload and parse data files**: Supports CSV, Excel, JSON, Parquet, Pickle, and MBOX email files.
- **Automatic extraction**: For .mbox files, extracts customer names, ratings, places, review text, and dates from unstructured email content.
- **Modern UI**: View your data in a table or as color-coded bubbles, with pagination and responsive design.
- **Filtering**: Only shows rows with complete key information for clarity.
- **Color-coded ratings**: Bubbles are colored by review rating for instant visual feedback.

## How It Works

- The **frontend** (React) provides a user-friendly interface for uploading files and viewing parsed data.
- The **backend** (Python/Flask) receives uploaded files, parses them using pandas (and mailbox for .mbox), extracts relevant fields, and returns the data as JSON to the frontend.
- For .mbox files, the backend uses regex and custom logic to extract reviews, ratings, and other structured info from email bodies.

---

## Getting Started

### 1. Start the Python Backend (Flask)

1. **Install dependencies** (in your project root):

   ```bash
   pip install flask flask-cors pandas
   ```

   (You may also need `openpyxl`, `pyarrow`, or other pandas file format dependencies depending on your data.)

2. **Run the backend server** (from the project root):
   ```bash
   python parsed_data.py
   ```
   By default, this will start the Flask server at `http://127.0.0.1:5000`.

---

### 2. Start the React Frontend

1. **Install dependencies** (in the `frontend` directory):

   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend development server**:
   ```bash
   npm start
   ```
   This will open the app at `http://localhost:3000` in your browser.

---

## Usage

1. Open the frontend in your browser.
2. Use the file upload input to select a data file (CSV, Excel, JSON, Parquet, Pickle, or .mbox).
3. The file is sent to the backend, parsed, and the extracted data is displayed in a table and as color-coded bubbles.
4. You can toggle between table and bubble views, and use pagination to browse large datasets.

---

## Project Structure

- `parsed_data.py` — Python backend for parsing and extracting data.
- `frontend/` — React frontend for uploading files and visualizing data.
- `frontend/src/DataTable.js` — Main data display component (table and bubbles).
- `frontend/src/DataTable.css` — Modern, responsive styles for the UI.

---

## Notes

- For .mbox files, only reviews and structured info that can be reliably extracted will be shown. Direct guest messages may not be present if not included in the .mbox export.
- The backend and frontend must both be running for the app to work.
- You can further customize the extraction logic in `parsed_data.py` to fit your data formats.

---

## License

Moved outside of frontend folder
