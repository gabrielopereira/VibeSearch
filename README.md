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

While working on the code, run it with hot reload instead:
```bash
python run.py --dev
```
- Changes to CSS are applied to the open page without reloading it
- Changes to templates and JavaScript reload the page (and repeat your last search)
- Changes to Python files restart the server, then reload the page

Add `--port 8081` to use another port, or `--host 0.0.0.0` to open it from another device on your network (e.g. an iPad).

### Hosting your own deployment (e.g. on DigitalOcean)

The application can be deployed using the provided `deploy.sh` script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## The Demo 🎪

`/demo` is a guided version of the search page, made for an unattended screen at a stand (desktop or iPad). A crystal ball guide invites visitors to search, gives tips after their first search, and offers a walkthrough. The demo puts itself back in order when a visitor walks away, and links that lead out of it are switched off.

- All its texts and timings are in `app/static/js/demo/content.js`
- The walkthrough's screenshots are in `app/static/img/demo/`
- The rest of the demo's code is in `app/static/js/demo/` and `app/static/css/demo.css`

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

## Version History 📚

### Version 1.1 - Timelines and Journals 📊

- **📊 Timeline**: Histogram showing publication years. Click bars to filter by year.
- **📝 Journals**: Half-Doughnut chart showing top 10 journals. Click segments to filter by journal.
- **Toggle**: Only one visualization visible at a time. Switching resets filters.
- **Session memory**: Remembers which visualization was last shown.


### Note on the Data 📊
  
- Some articles may not have abstracts 
- Abstract availability depends on journal policies and time periods
- Not all journals have year of the pub in CrossRef 

## License 📄

Just do whatever, it's just vibes.
