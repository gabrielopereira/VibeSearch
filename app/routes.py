from flask import Flask, render_template, request, url_for
from app.database.chroma_client import ChromaClient
import json
import os

def init_routes(app):
    chroma_client = ChromaClient()

    @app.route('/', methods=['GET', 'POST'])
    def index():
        search_query = ''
        results = None
        num_results = 10
        search_type = "semantic"

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

        return render_template('index.html',
                             search_query=search_query,
                             results=results,
                             num_results=num_results,
                             search_type=search_type)

    @app.route('/about')
    def about():
        # Read the journal summary data
        journal_summary_path = os.path.join('chroma_db', 'journal_summary.json')
        with open(journal_summary_path, 'r') as f:
            journal_summary = json.load(f)
        
        return render_template('about.html', journal_summary=journal_summary)

    @app.route('/paper/<paper_id>')
    def paper_detail(paper_id):
        paper = chroma_client.get_paper(paper_id)
        return render_template('paper_detail.html', paper=paper) 