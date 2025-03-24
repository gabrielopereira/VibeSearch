@ -1,107 +0,0 @@
# VibeSearch

A Flask application for searching academic papers using ChromaDB, supporting both semantic and traditional/keyword-based search.

## Features

- Semantic search using ChromaDB
- Traditional keyword-based search
- Paper preview functionality
- Responsive design
- Support for multiple search result counts

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd VibeSearch
```

2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

### Local Development

To run the application locally:
```bash
python run.py
```

### Production Deployment

The application can be deployed using the provided `deploy.sh` script:
```bash
chmod +x deploy.sh
./deploy.sh
```

### Managing the Application with Screen

The application runs in a screen session named 'vibesearch' for persistent execution. Here's how to manage it:

1. **View Running Sessions**
   ```bash
   screen -ls
   ```

2. **Attach to the Session**
   ```bash
   screen -r vibesearch
   ```

3. **Detach from the Session**
   - Press `Ctrl+A`, then `D`
   - The application will continue running in the background

4. **Kill the Session** (if needed)
   ```bash
   screen -X -S vibesearch quit
   ```

## Project Structure

```
VibeSearch/
├── app/
│   ├── database/
│   │   └── chroma_client.py
│   ├── routes.py
│   ├── static/
│   │   └── css/
│   │       └── style.css
│   └── templates/
│       ├── index.html
│       └── paper_detail.html
├── chroma_db/
├── requirements.txt
├── run.py
└── deploy.sh
```

## Search Types

### Semantic Search
- Uses ChromaDB's semantic search capabilities
- Finds papers based on meaning rather than exact keyword matches
- Results are sorted by semantic similarity

### Traditional Search
- Performs keyword-based search in titles and abstracts
- Prioritizes matches in titles over abstract matches
- Shows total number of matches found


## License

Just do whatever, it's just vibes.