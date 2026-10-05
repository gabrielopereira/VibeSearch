from flask import Flask, render_template, request, url_for
from app.database.chroma_client import ChromaClient
import json
import os
from collections import Counter
from importlib.util import find_spec

def init_routes(app):
    chroma_client = ChromaClient()

    def generate_year_histogram_data(results):
        """Generate histogram data from search results"""
        if not results or not results.get('metadatas') or not results['metadatas'][0]:
            return None
        
        # Extract years from metadata
        years = []
        for metadata in results['metadatas'][0]:
            if metadata.get('year'):
                try:
                    year = int(metadata['year'])
                    if 1900 <= year <= 2030:  # Reasonable year range
                        years.append(year)
                except (ValueError, TypeError):
                    continue
        
        if not years:
            return None
        
        # Count publications per year
        year_counts = Counter(years)
        
        # Get the full year range
        min_year = min(years)
        max_year = max(years)
        
        # Fill in missing years with zero values
        all_years = list(range(min_year, max_year + 1))
        all_counts = [year_counts.get(year, 0) for year in all_years]
        
        return {
            'years': all_years,
            'counts': all_counts,
            'total_papers': len(years),
            'year_range': f"{min_year} - {max_year}"
        }

    def generate_journal_histogram_data(results):
        """Generate journal histogram data from search results"""
        if not results or not results.get('metadatas') or not results['metadatas'][0]:
            return None
        
        # Extract journals from metadata
        journals = []
        for metadata in results['metadatas'][0]:
            if metadata.get('journal'):
                journal = metadata['journal'].strip()
                if journal:  # Only include non-empty journal names
                    journals.append(journal)
        
        if not journals:
            return None
        
        # Count publications per journal
        journal_counts = Counter(journals)
        
        # Sort by count (descending) and take top 10 journals
        sorted_journals = sorted(journal_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Separate journals and counts
        journal_names = [item[0] for item in sorted_journals]
        journal_counts_list = [item[1] for item in sorted_journals]
        
        return {
            'journals': journal_names,
            'counts': journal_counts_list,
            'total_papers': len(journals),
            'total_journals': len(journal_counts)
        }

    def run_search():
        """Run the search described by the submitted form, if there is one.
        Returns the variables the search templates need."""
        search_query = ''
        results = None
        num_results = 50
        search_type = "semantic"
        histogram_data = None
        journal_data = None

        if request.method == 'POST':
            search_query = request.form.get('search_query', '')
            num_results = int(request.form.get('num_results', 10))
            search_type = request.form.get('search_type', "semantic")
            
            if search_query:
                results = chroma_client.search_papers(
                    search_query,
                    num_results=num_results,
                    search_type=search_type
                )
                # Generate histogram data
                histogram_data = generate_year_histogram_data(results)
                journal_data = generate_journal_histogram_data(results)

        return dict(search_query=search_query,
                    results=results,
                    num_results=num_results,
                    search_type=search_type,
                    histogram_data=histogram_data,
                    journal_data=journal_data)

    @app.route('/', methods=['GET', 'POST'])
    def index():
        return render_template('index.html', **run_search())

    @app.route('/twopane', methods=['GET', 'POST'])
    def twopane():
        return render_template('twopane.html', **run_search())

    def load_journal_summary():
        journal_summary_path = os.path.join('chroma_db', 'journal_summary.json')
        with open(journal_summary_path, 'r') as f:
            return json.load(f)

    @app.route('/demo', methods=['GET', 'POST'])
    def demo():
        context = run_search()
        # The demo page searches in place: it asks for just the results
        if request.headers.get('X-Requested-With') == 'fetch':
            return render_template('_results.html', demo=True, **context)
        # About is part of the page, so that the demo never leaves it
        return render_template('demo.html', demo=True,
                               journal_summary=load_journal_summary(), **context)

    @app.route('/about')
    def about():
        return render_template('about.html', journal_summary=load_journal_summary(),
                               home_url=url_for('index'))

    @app.route('/paper/<paper_id>')
    def paper_detail(paper_id):
        paper = chroma_client.get_paper(paper_id)
        return render_template('paper_detail.html', paper=paper)

    # The canvas prototype is kept out of the repository for now: its routes
    # are only there on a machine that has the file
    if find_spec('app.canvas_routes'):
        from app.canvas_routes import init_canvas_routes
        init_canvas_routes(app, chroma_client)
