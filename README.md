# VibeSearch

A simple application for searching academic papers using ChromaDB, supporting both semantic and traditional/keyword-based search. The database is built using Crossref data from selected journals, with vector search word embeddings created through ChromaDB (see [VibeCollector](https://github.com/gabrielopereira/VibeCollector)).

## Features

- Semantic search using ChromaDB
- Traditional keyword-based search
- You can also host this app using the in-built Waitress server

## Installation

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. If you want, replace the `chroma_db` folder with your own database created using VibeCollector.

## Running the Application

### Local Development

To run the application locally:
```bash
python run.py
```

### Hosting your own deployment (e.g. on DigitalOcean)

The application can be deployed using the provided `deploy.sh` script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Search Types

### Semantic Search
- Uses ChromaDB's semantic search capabilities with Snowflake/snowflake-arctic-embed-s model
- Finds papers based on "meaning" rather than exact keyword matches
- Results are sorted by semantic similarity using cosine distance
- Embeddings are generated using sentence transformers and stored in ChromaDB

### Traditional Search
- Performs keyword-based search in titles and abstracts
- Uses weighted scoring: title matches have 2x weight compared to abstract matches
- Implements case-insensitive substring matching
- Results are sorted by combined weighted score

## License

Just do whatever, it's just vibes.
