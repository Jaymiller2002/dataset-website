import pandas as pd
import os
from typing import Optional, Union, Dict, Any
import json
import tkinter as tk
from tkinter import filedialog, messagebox
import sys
import mailbox
from flask import Flask, jsonify, request
from flask_cors import CORS
import tempfile
import re
import yake

print(pd.__version__)

def select_file_gui(title: str = "Select a file to parse", 
                   file_types: list = None) -> Optional[str]:
    """
    Open a GUI file dialog to select a file for parsing.
    
    Args:
        title (str): Title for the file dialog window
        file_types (list): List of tuples with file type descriptions and extensions
                          e.g., [("CSV files", "*.csv"), ("Excel files", "*.xlsx")]
    
    Returns:
        str or None: Selected file path or None if cancelled
    """
    if file_types is None:
        file_types = [
            ("All supported files", "*.csv;*.xlsx;*.xls;*.json;*.parquet;*.pkl;*.pickle;*.mbox"),
            ("CSV files", "*.csv"),
            ("Excel files", "*.xlsx;*.xls"),
            ("JSON files", "*.json"),
            ("Parquet files", "*.parquet"),
            ("Pickle files", "*.pkl;*.pickle"),
            ("MBOX files", "*.mbox"),
            ("All files", "*.*")
        ]
    
    # Create and hide the main tkinter window
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    
    try:
        file_path = filedialog.askopenfilename(
            title=title,
            filetypes=file_types
        )
        return file_path if file_path else None
    except Exception as e:
        print(f"Error opening file dialog: {e}")
        return None
    finally:
        root.destroy()

def select_multiple_files_gui(title: str = "Select files to parse",
                            file_types: list = None) -> list:
    """
    Open a GUI file dialog to select multiple files for parsing.
    
    Args:
        title (str): Title for the file dialog window
        file_types (list): List of tuples with file type descriptions and extensions
    
    Returns:
        list: List of selected file paths
    """
    if file_types is None:
        file_types = [
            ("All supported files", "*.csv;*.xlsx;*.xls;*.json;*.parquet;*.pkl;*.pickle;*.mbox"),
            ("CSV files", "*.csv"),
            ("Excel files", "*.xlsx;*.xls"),
            ("JSON files", "*.json"),
            ("Parquet files", "*.parquet"),
            ("Pickle files", "*.pkl;*.pickle"),
            ("MBOX files", "*.mbox"),
            ("All files", "*.*")
        ]
    
    # Create and hide the main tkinter window
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    
    try:
        file_paths = filedialog.askopenfilenames(
            title=title,
            filetypes=file_types
        )
        return list(file_paths) if file_paths else []
    except Exception as e:
        print(f"Error opening file dialog: {e}")
        return []
    finally:
        root.destroy()

def get_file_path_input() -> Optional[str]:
    """
    Get file path from user input via command line.
    
    Returns:
        str or None: File path entered by user or None if cancelled
    """
    print("\nFile Upload Options:")
    print("1. Enter file path manually")
    print("2. Use GUI file dialog")
    print("3. Cancel")
    
    while True:
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == "1":
            file_path = input("Enter the full path to your file: ").strip()
            if file_path:
                # Remove quotes if user included them
                file_path = file_path.strip('"\'')
                return file_path
            else:
                print("No file path entered.")
                return None
        
        elif choice == "2":
            return select_file_gui()
        
        elif choice == "3":
            print("File selection cancelled.")
            return None
        
        else:
            print("Invalid choice. Please enter 1, 2, or 3.")

def parse_data_with_upload(
    use_gui: bool = True,
    file_path: Optional[str] = None,
    **kwargs
) -> Optional[pd.DataFrame]:
    """
    Parse data with file upload functionality.
    
    Args:
        use_gui (bool): Whether to use GUI file dialog (default: True)
        file_path (str, optional): Direct file path (if provided, skips file selection)
        **kwargs: Additional arguments for parse_data function
    
    Returns:
        pd.DataFrame or None: Parsed data or None if no file selected
    """
    
    # If file path is provided directly, use it
    if file_path:
        if os.path.exists(file_path):
            return parse_data(file_path, **kwargs)
        else:
            print(f"File not found: {file_path}")
            return None
    
    # Otherwise, get file path from user
    if use_gui:
        selected_file = select_file_gui()
    else:
        selected_file = get_file_path_input()
    
    if selected_file:
        try:
            return parse_data(selected_file, **kwargs)
        except Exception as e:
            print(f"Error parsing file: {e}")
            return None
    else:
        print("No file selected.")
        return None

def parse_multiple_files_with_upload(
    use_gui: bool = True,
    file_paths: Optional[list] = None,
    **kwargs
) -> Dict[str, pd.DataFrame]:
    """
    Parse multiple files with upload functionality.
    
    Args:
        use_gui (bool): Whether to use GUI file dialog
        file_paths (list, optional): List of file paths (if provided, skips file selection)
        **kwargs: Additional arguments for parse_data function
    
    Returns:
        dict: Dictionary mapping file names to DataFrames
    """
    
    # If file paths are provided directly, use them
    if file_paths:
        files_to_parse = file_paths
    else:
        # Get files from user
        if use_gui:
            files_to_parse = select_multiple_files_gui()
        else:
            print("Multiple file selection via command line not implemented yet.")
            return {}
    
    results = {}
    
    for file_path in files_to_parse:
        if os.path.exists(file_path):
            try:
                df = parse_data(file_path, **kwargs)
                file_name = os.path.basename(file_path)
                results[file_name] = df
                print(f"Successfully parsed: {file_name}")
            except Exception as e:
                print(f"Error parsing {file_path}: {e}")
        else:
            print(f"File not found: {file_path}")
    
    return results

def parse_data(
    file_path: str,
    file_type: Optional[str] = None,
    encoding: str = 'utf-8',
    **kwargs
) -> pd.DataFrame:
    """
    Parse data from various file formats using pandas.
    
    Args:
        file_path (str): Path to the data file
        file_type (str, optional): Type of file ('csv', 'excel', 'json', 'parquet', 'pickle')
                                  If None, will be inferred from file extension
        encoding (str): File encoding (default: 'utf-8')
        **kwargs: Additional arguments to pass to pandas read functions
    
    Returns:
        pd.DataFrame: Parsed data as a pandas DataFrame
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        ValueError: If file type is not supported
        Exception: For other parsing errors
    """
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Determine file type from extension if not provided
    if file_type is None:
        file_extension = os.path.splitext(file_path)[1].lower()
        file_type_map = {
            '.csv': 'csv',
            '.xlsx': 'excel',
            '.xls': 'excel',
            '.json': 'json',
            '.parquet': 'parquet',
            '.pkl': 'pickle',
            '.pickle': 'pickle'
        }
        file_type = file_type_map.get(file_extension, 'csv')
    
    try:
        if file_type.lower() == 'csv':
            return pd.read_csv(file_path, encoding=encoding, **kwargs)
        
        elif file_type.lower() == 'excel':
            return pd.read_excel(file_path, **kwargs)
        
        elif file_type.lower() == 'json':
            return pd.read_json(file_path, encoding=encoding, **kwargs)
        
        elif file_type.lower() == 'parquet':
            return pd.read_parquet(file_path, **kwargs)
        
        elif file_type.lower() == 'pickle':
            return pd.read_pickle(file_path, **kwargs)
        
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
    
    except Exception as e:
        raise Exception(f"Error parsing file {file_path}: {str(e)}")

def parse_data_with_validation(
    file_path: str,
    required_columns: Optional[list] = None,
    data_types: Optional[Dict[str, str]] = None,
    drop_duplicates: bool = True,
    handle_missing: str = 'drop',  # 'drop', 'fill', 'interpolate'
    fill_value: Any = None,
    **kwargs
) -> pd.DataFrame:
    """
    Parse data with validation and cleaning options.
    
    Args:
        file_path (str): Path to the data file
        required_columns (list, optional): List of required column names
        data_types (dict, optional): Dictionary mapping column names to expected data types
        drop_duplicates (bool): Whether to drop duplicate rows
        handle_missing (str): How to handle missing values ('drop', 'fill', 'interpolate')
        fill_value: Value to fill missing data with (if handle_missing='fill')
        **kwargs: Additional arguments for parse_data function
    
    Returns:
        pd.DataFrame: Cleaned and validated DataFrame
    """
    
    # Parse the data
    df = parse_data(file_path, **kwargs)
    
    # Validate required columns
    if required_columns:
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
    
    # Convert data types if specified
    if data_types:
        for col, dtype in data_types.items():
            if col in df.columns:
                try:
                    df[col] = df[col].astype(dtype)
                except Exception as e:
                    print(f"Warning: Could not convert column {col} to {dtype}: {e}")
    
    # Handle missing values
    if handle_missing == 'drop':
        df = df.dropna()
    elif handle_missing == 'fill':
        df = df.fillna(fill_value)
    elif handle_missing == 'interpolate':
        df = df.interpolate()
    
    # Drop duplicates if requested
    if drop_duplicates:
        df = df.drop_duplicates()
    
    return df

def get_data_info(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Get comprehensive information about a DataFrame.
    
    Args:
        df (pd.DataFrame): Input DataFrame
    
    Returns:
        dict: Dictionary containing data information
    """
    info = {
        'shape': df.shape,
        'columns': list(df.columns),
        'data_types': df.dtypes.to_dict(),
        'missing_values': df.isnull().sum().to_dict(),
        'memory_usage': df.memory_usage(deep=True).sum(),
        'numeric_columns': list(df.select_dtypes(include=['number']).columns),
        'categorical_columns': list(df.select_dtypes(include=['object', 'category']).columns),
        'datetime_columns': list(df.select_dtypes(include=['datetime']).columns)
    }
    
    # Add basic statistics for numeric columns
    if info['numeric_columns']:
        info['numeric_stats'] = df[info['numeric_columns']].describe().to_dict()
    
    return info

def parse_mbox(file_path):
    mbox = mailbox.mbox(file_path)
    records = []
    for msg in mbox:
        subject = msg['subject']
        from_ = msg['from']
        to = msg['to']
        date = msg['date']
        # Get the email body (handle multipart)
        if msg.is_multipart():
            body = ''
            for part in msg.walk():
                if part.get_content_type() == 'text/plain':
                    try:
                        body += part.get_payload(decode=True).decode(part.get_content_charset() or 'utf-8', errors='replace')
                    except Exception:
                        body += str(part.get_payload())
        else:
            try:
                body = msg.get_payload(decode=True).decode(msg.get_content_charset() or 'utf-8', errors='replace')
            except Exception:
                body = str(msg.get_payload())
        records.append({'subject': subject, 'from': from_, 'to': to, 'date': date, 'body': body})
    return pd.DataFrame(records)
""" Add Thread Message and extract all threads with customer messages """
def extract_customer_info(subject, body):
    """Extract customer name, rating, place, review text, messages sent, dates, review link, and thread link from email content."""
    info = {
        'customer_name': None,
        'rating': None,
        'place': None,
        'review_text': None,
        'dates': None,
        'message_thread': None,
        'review_link': None,
        'message_link': None,  # NEW FIELD
        'thread_link': None  # NEW FIELD
    }

    # Extract customer name from subject
    name_match = re.search(r'(\w+)\s+wrote\s+you\s+a\s+review', subject or '', re.IGNORECASE)
    if name_match:
        info['customer_name'] = name_match.group(1)
    else:
        name_match2 = re.search(r'(\w+)\s+left\s+a\s+\d+-star\s+review', subject or '', re.IGNORECASE)
        if name_match2:
            info['customer_name'] = name_match2.group(1)

    # Extract rating
    rating_match = re.search(r'(\d+)-star\s+review', body or '', re.IGNORECASE)
    if rating_match:
        info['rating'] = rating_match.group(1)
    else:
        rating_match2 = re.search(r'RATED THEIR STAY (\d+) STARS', body or '', re.IGNORECASE)
        if rating_match2:
            info['rating'] = rating_match2.group(1)

    # Extract place name (in quotes)
    place_match = re.search(r'"([^"]+)"', body or '')
    if place_match:
        info['place'] = place_match.group(1)

    # Extract review text (unchanged)
    review_patterns = [
        r'Booker\s*(?:=20)?\s*\n+([\s\S]+)',
        r'OVERALL RATING\s*\d+\s*\n([^\n]+)',
        r'OVERALL RATING \d+\s*([^\n]+)',
        r'(?<=\n\n)[^"\n]{5,}\n*$',
        r'review(?:\s*text)?[:\-\s]+"?([^\n"]+)"?',
        r'comment[:\-\s]+"?([^\n"]+)"?',
        r'(?:review|feedback|comment)[^\n]*\n([^\n]{10,})',
        r'FEEDBACK FROM THEIR STAY.*?"([^\"]+)",',
        r'"([^\"]{10,})"',
    ]
    review_text = None
    for pat in review_patterns:
        match = re.search(pat, body or '', re.IGNORECASE | re.DOTALL)
        if match:
            review_block = match.group(1).strip()
            lines = [line.strip() for line in review_block.splitlines()]
            review_lines = []
            started = False
            for line in lines:
                if not started:
                    if line and line != '=20':
                        started = True
                        review_lines.append(line)
                else:
                    if not line or line == '=20':
                        break
                    review_lines.append(line)
            review_text = ' '.join(review_lines).strip()
            if 'Automatically translated from original message' in review_text:
                review_text = review_text.split('Automatically translated from original message')[0].strip()
            break
    if not review_text:
        quoted_texts = re.findall(r'"([^\"]{10,})"', body or '', re.DOTALL)
        if quoted_texts:
            review_text = max(quoted_texts, key=len)
    if not review_text and body:
        paragraphs = [p.strip() for p in (body or '').split('\n\n') if len(p.strip()) > 10]
        if paragraphs:
            review_text = max(paragraphs, key=len)
    info['review_text'] = review_text

    # --- Enhanced message_thread extraction using regex ---
    def extract_genuine_customer_messages(body):
        if not body:
            return None
        # Split on double newlines or reply markers
        blocks = re.split(r'(?:\n\s*\n|^On .+wrote:|^From:|^Sent:|^To:|^Subject:|^Date:)', body, flags=re.MULTILINE)
        boilerplate_patterns = [
            r'^[A-Za-z]+ had great things to say about their stay[—-]read on for a snapshot of what they loved most\. Now that you and your guest have both written reviews, we\'ve posted them to your Airbnb profiles\.\s*-*',
            r'read on for a snapshot',
            r'keep hosting 5-star stays',
            r'get more 5-star reviews',
            r'add details guests will love',
            r'connect with other hosts',
            r'visit the airbnb community center',
            r'airbnb, inc\.',
            r'888 brannan st',
            r'san francisco, ca',
            r'write a response',
            r'overlook lux dome',
            r'looked like the photos',
            r'proactive',
            r'peaceful',
            r'special thanks',
            r'now that you and your guest have both written reviews',
            r'we\'ve posted them to your airbnb profiles',
            r'https://',  # Any block that's just a link
            r'facebook.com/airbnb',
            r'instagram.com/airbnb',
            r'twitter.com/airbnb',
            r'10 min read',
            r'6 min read',
            r'\%opentrack\%',
        ]
        boilerplate_re = re.compile('|'.join(boilerplate_patterns), re.IGNORECASE)
        customer_messages = []
        boilerplate_phrase_re = re.compile(
            r'^[A-Za-z]+ had great things to say about their stay[—-]read on for a snapshot of what they loved most\. Now that you and your guest have both written reviews, we\'ve posted them to your Airbnb profiles\.\s*-*',
            re.IGNORECASE
        )
        for block in blocks:
            block = block.strip()
            # Remove boilerplate phrase if present at the start
            block = boilerplate_phrase_re.sub('', block).strip()
            # If the split phrase is present, keep only the text after it
            split_phrase = "Now that you and your guest have both written reviews, we've posted them to your Airbnb profiles."
            if split_phrase in block:
                block = block.split(split_phrase, 1)[1].lstrip(' -–—')
            # Further split on dashes and newlines, remove boilerplate sub-blocks
            sub_blocks = re.split(r'(?:\n---|\n)', block)
            cleaned_sub_blocks = []
            for sub in sub_blocks:
                sub = sub.strip()
                # Remove if matches any boilerplate pattern
                if not sub or boilerplate_re.search(sub):
                    continue
                # Remove if matches 'RATED THEIR STAY' phrase
                if re.match(r'^[A-Z ]+RATED THEIR STAY \d STARS!?$', sub, re.IGNORECASE):
                    continue
                cleaned_sub_blocks.append(sub)
            block = ' '.join(cleaned_sub_blocks).strip()
            # Heuristics for a genuine message
            if (
                len(block) > 30 and
                not boilerplate_re.search(block) and
                not re.match(r'^(on |from:|sent:|to:|subject:|date:|>|---|--|regards,|best,|cheers|thank you|sincerely|kind regards|warm regards|with appreciation|with gratitude|respectfully|faithfully|truly|appreciatively|cordially|love|take care|see you|goodbye|bye|ps|p.s.)', block, re.IGNORECASE) and
                not re.match(r'^https?://', block) and
                re.search(r'[.!?]', block)  # At least one sentence-ending punctuation
            ):
                customer_messages.append(block)
        # If no genuine messages, try to extract a message thread URL
        if not customer_messages:
            urls = re.findall(r'https://www\.airbnb\.com/messages/thread/\d+', body or '')
            if urls:
                return [urls[0]]  # Return the first thread URL as the message_thread
        return customer_messages if customer_messages else None
    thread = extract_genuine_customer_messages(body)
    info['message_thread'] = '\n\n---\n\n'.join(thread) if thread else None

    # Extract dates (e.g., Jun 10 – 12)
    date_match = re.search(r'(\w+\s+\d+\s*[–-]\s*\d+(?:,\s*\d{4})?)', body or '')
    if date_match:
        info['dates'] = date_match.group(1)

    # Extract review link (fixed: use first 'review' URL)
    urls = re.findall(r'https?://\S+', body or '')
    review_link = None
    if urls:
        for url in urls:
            if 'review' in url.lower():
                review_link = url
                break  # Use the first match only
        if not review_link:
            review_link = urls[0]
    info['review_link'] = review_link
    # Do NOT set info['message_link']
    return info

def enhance_mbox_data(df):
    """Add extracted customer information to the DataFrame."""
    df['customer_name'] = None
    df['rating'] = None
    df['place'] = None
    df['review_text'] = None
    df['dates'] = None
    df['message_thread'] = None
    df['review_link'] = None
    # Do NOT set df['message_link']
    for idx, row in df.iterrows():
        info = extract_customer_info(row.get('subject', ''), row.get('body', ''))
        df.at[idx, 'customer_name'] = info['customer_name']
        df.at[idx, 'rating'] = info['rating']
        df.at[idx, 'place'] = info['place']
        df.at[idx, 'review_text'] = info['review_text']
        df.at[idx, 'dates'] = info['dates']
        df.at[idx, 'message_thread'] = info['message_thread']
        df.at[idx, 'review_link'] = info['review_link']
    return df

def extract_global_keywords(df, text_column='body', lan='en', n=2, top=20):
    """
    Extract most common keywords/phrases from a DataFrame column using YAKE.
    Args:
        df: pandas DataFrame
        text_column: column name with text to analyze
        lan: language code (default 'en')
        n: max n-gram size (1=words, 2=2-word phrases, etc.)
        top: number of keywords/phrases to return
    Returns:
        List of (keyword, score) tuples
    """
    all_text = ' '.join(df[text_column].dropna().astype(str))
    kw_extractor = yake.KeywordExtractor(lan=lan, n=n, top=top)
    keywords = kw_extractor.extract_keywords(all_text)
    return keywords

def extract_keywords_per_review(df, text_column='body', lan='en', n=2, top=5):
    kw_extractor = yake.KeywordExtractor(lan=lan, n=n, top=top)
    def extract(text):
        if not text or not isinstance(text, str):
            return []
        return [kw for kw, score in kw_extractor.extract_keywords(text)]
    df['keywords'] = df[text_column].apply(extract)
    return df

# --- Flask API for React frontend ---
app = Flask(__name__)
CORS(app)

@app.route('/api/data', methods=['GET'])
def api_data():
    file_path = request.args.get('file')
    if not file_path:
        return jsonify({'error': 'No file path provided. Use ?file=yourfile.csv'}), 400
    if not os.path.exists(file_path):
        return jsonify({'error': f'File not found: {file_path}'}), 404
    try:
        if file_path.lower().endswith('.mbox'):
            df = parse_mbox(file_path)
            df = enhance_mbox_data(df)
            df = extract_keywords_per_review(df, text_column='review_text')
        else:
            df = parse_data(file_path)
            df = extract_keywords_per_review(df, text_column='body')
        # Improved has_suggestion logic
        import re
        def has_suggestion(row):
            try:
                rating = float(row.get('rating', 0))
            except Exception:
                rating = 0
            text = (row.get('review_text') or row.get('body') or '').lower()
            if rating >= 4:
                # Exclude negations
                if re.search(r'no (issues?|problems?)', text):
                    return False
                # Look for more specific suggestion patterns
                suggestion_patterns = [
                    r'\bwish\b',
                    r'\bit would be better if\b',
                    r'\bit would help if\b',
                    r'\bif only\b',
                    r'\bexcept that\b',
                    r'\bbut\b.*(could|should|would|wasn\'t|isn\'t|not|problem|issue|improve|change)',
                    r'\bhowever\b.*(could|should|would|wasn\'t|isn\'t|not|problem|issue|improve|change)',
                    # Only match recommend if followed by 'that', 'to', 'you', or a verb
                    r'\brecommend (that|to|you|adding|changing|improving|fixing|making|doing|considering|trying)\b',
                ]
                for pat in suggestion_patterns:
                    if re.search(pat, text):
                        return True
            return False
        df['has_suggestion'] = df.apply(has_suggestion, axis=1)
        columns_of_interest = ['from', 'to', 'subject', 'date', 'body', 'customer_name', 'review', 'message', 'rating', 'place', 'review_text', 'review_link', 'dates', 'keywords', 'has_suggestion', 'message_thread']
        available = [col for col in columns_of_interest if col in df.columns]
        if available:
            df = df[available]
        return df.to_json(orient='records')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name
    try:
        if file.filename.lower().endswith('.mbox'):
            df = parse_mbox(tmp_path)
            df = enhance_mbox_data(df)
            df = extract_keywords_per_review(df, text_column='review_text')
        else:
            df = parse_data(tmp_path)
            df = extract_keywords_per_review(df, text_column='body')
        # Improved has_suggestion logic
        import re
        def has_suggestion(row):
            try:
                rating = float(row.get('rating', 0))
            except Exception:
                rating = 0
            text = (row.get('review_text') or row.get('body') or '').lower()
            if rating >= 4:
                # Exclude negations
                if re.search(r'no (issues?|problems?)', text):
                    return False
                # Look for more specific suggestion patterns
                suggestion_patterns = [
                    r'\bwish\b',
                    r'\bit would be better if\b',
                    r'\bit would help if\b',
                    r'\bif only\b',
                    r'\bexcept that\b',
                    r'\bbut\b.*(could|should|would|wasn\'t|isn\'t|not|problem|issue|improve|change)',
                    r'\bhowever\b.*(could|should|would|wasn\'t|isn\'t|not|problem|issue|improve|change)',
                    # Only match recommend if followed by 'that', 'to', 'you', or a verb
                    r'\brecommend (that|to|you|adding|changing|improving|fixing|making|doing|considering|trying)\b',
                ]
                for pat in suggestion_patterns:
                    if re.search(pat, text):
                        return True
            return False
        df['has_suggestion'] = df.apply(has_suggestion, axis=1)
        columns_of_interest = ['from', 'to', 'subject', 'date', 'body', 'customer_name', 'review', 'message', 'rating', 'place', 'review_text', 'review_link', 'dates', 'keywords', 'has_suggestion', 'message_thread']
        available = [col for col in columns_of_interest if col in df.columns]
        if available:
            df = df[available]
        return df.to_json(orient='records')
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(tmp_path)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))