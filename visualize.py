import chromadb
from umap.umap_ import UMAP
import umap.plot as umap_plot
import numpy as np
import plotly.express as px
import pandas as pd
import webbrowser
import os
from sklearn.cluster import KMeans
from scipy.stats import gaussian_kde
from collections import Counter
import re

# Initialize ChromaDB client
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Get the collection
collection = chroma_client.get_collection(name="academic_papers")

# Get all embeddings
support_embeddings = collection.get(include=['embeddings'])['embeddings']

# Get embeddings and metadata
mapper = UMAP().fit(support_embeddings)
embedding = mapper.embedding_

# Perform K-means clustering with more clusters
n_clusters = 60
kmeans = KMeans(n_clusters=n_clusters, random_state=42).fit(embedding)
cluster_labels = kmeans.labels_

# Get the documents and metadata for hover text
docs = collection.get(include=['documents', 'metadatas'])['documents']
metadatas = collection.get(include=['documents', 'metadatas'])['metadatas']

# Extract titles and journals from metadata
titles = [meta['title'] for meta in metadatas]
journals = [meta.get('journal', 'No journal') for meta in metadatas]
abstracts = [meta.get('abstract', '') for meta in metadatas]

# Function to get most common terms in a cluster
def get_cluster_label(docs, labels, cluster_id, n_terms=6):
    # Get documents and abstracts for this cluster
    cluster_docs = [doc for doc, label in zip(docs, labels) if label == cluster_id]
    cluster_abstracts = [abstract for abstract, label in zip(abstracts, labels) if label == cluster_id]
    
    # Combine all documents and abstracts, split into words
    all_text = ' '.join(cluster_docs + cluster_abstracts).lower()
    words = re.findall(r'\w+', all_text)
    
    # Remove common words
    stop_words = {'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'jats', 'but', 'taylor', 'francis', 'media', 'from', 'their', 'which', 'this', 'that', 'there', 'here', 'when', 'where', 'how', 'why', 'all', 'any', 'some', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'article', 'these', 'title', 'abstract', 'method', 'result', 'conclusion', 'introduction', 'background', 'study', 'research', 'analysis', 'data', 'methodology', 'findings', 'discussion', 'paper', 'journal', 'published', 'authors', 'first', 'monday', 'index', 'through', 'what', 'doi', 'year'}
    words = [w for w in words if w not in stop_words and len(w) > 3]
    
    # Get most common terms
    common_terms = Counter(words).most_common(n_terms)
    terms = [term for term, _ in common_terms]
    # Split into two lines of 3 words each
    return '<br>'.join([' '.join(terms[:3]), ' '.join(terms[3:])])

# Generate labels for each cluster
cluster_names = {i: get_cluster_label(docs, cluster_labels, i) for i in range(n_clusters)}

# Calculate point density for size variation
xy = np.vstack([embedding[:, 0], embedding[:, 1]])
z = gaussian_kde(xy)(xy)

# Create a dataframe for plotly
df = pd.DataFrame({
    'x': embedding[:, 0],
    'y': embedding[:, 1],
    'cluster': cluster_labels,
    'cluster_name': [cluster_names[i] for i in cluster_labels],
    'title': titles,
    'journal': journals,
    'density': z
})

# Create interactive plot with adjusted parameters
fig = px.scatter(
    df,
    x='x',
    y='y',
    color='cluster_name',
    size='density',
    color_discrete_sequence=px.colors.qualitative.Set3,
    hover_data=['title', 'journal'],
    title='Visualizing the vector space of academic articles in New Media',
    size_max=10,
    opacity=0.7,
    template='plotly_white'
)

# Calculate cluster centers and add annotations
for cluster_id in range(n_clusters):
    cluster_points = df[df['cluster'] == cluster_id]
    if len(cluster_points) > 0:
        center_x = cluster_points['x'].mean()
        center_y = cluster_points['y'].mean()
        fig.add_annotation(
            x=center_x,
            y=center_y,
            text=cluster_names[cluster_id],
            showarrow=False,
            font=dict(size=11),
            textangle=0,
            bgcolor='rgba(255, 255, 255, 0.8)',  # semi-transparent white background
            bordercolor='rgba(0, 0, 0, 0.1)',    # light border
            borderwidth=1,                        # thin border
            borderpad=2                          # padding around text
        )

# Update layout for better visibility
fig.update_layout(
    showlegend=False,  # hide legend since we have labels on plot
    plot_bgcolor='white',
    paper_bgcolor='white'
)

# Save the plot as HTML file
fig.write_html("embeddings_visualization.html")

# Open the file in browser
file_path = os.path.abspath("embeddings_visualization.html")
url = f'file://{file_path}'
webbrowser.open(url)
