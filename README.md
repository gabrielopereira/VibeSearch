# 🔮 VibeSearch

A vibe-y search engine for academic papers! It uses both semantic (vector) and traditional keyword-based search to help you find relevant articles. The database is built from selected New Media journals using Crossref data, with vector embeddings powered by ChromaDB (check out [VibeCollector](https://github.com/gabrielopereira/VibeCollector) to build your own database! ✨).

## Features 🌟

- Semantic search using ChromaDB's magic ✨
- Traditional keyword-based search for when you know exactly what you want 🎯
- Host it yourself using the built-in Waitress server 🍽️

## Quick Start 🚀

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

## Running the Application 🧠

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

## Search Types 🔎

### Semantic Search ✨
- Uses ChromaDB's semantic search capabilities with Snowflake/snowflake-arctic-embed-s model 
- Finds papers based on "meaning" rather than exact keyword matches
- Results are sorted by semantic similarity using cosine distance
- Embeddings are generated using sentence transformers and stored in ChromaDB

### Traditional Search 🎯
- Performs keyword-based search in titles and abstracts 
- Uses weighted scoring: title matches have 2x weight compared to abstract matches
- Implements case-insensitive substring matching
- Results are sorted by combined weighted score


### Note on the Data 📊
  
- Some articles may not have abstracts 
- Abstract availability depends on journal policies and time periods
- Not all journals have year of the pub in CrossRef 

## License 📄

Just do whatever, it's just vibes.
