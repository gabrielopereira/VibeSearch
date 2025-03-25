import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
import os
import html
import re

class ChromaClient:
    def __init__(self, db_path="chroma_db"):
        self.client = chromadb.PersistentClient(path=db_path)
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        self.collection = self.client.get_collection(
            name="academic_papers",
            embedding_function=self.embedding_function
        )

    def clean_text(self, text):
        if not text:
            return text
        # Decode HTML entities
        text = html.unescape(text)
        # Remove XML/HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        return text

    def clean_metadata(self, metadata):
        if not metadata:
            return metadata
        cleaned = metadata.copy()
        for key in ['title', 'journal', 'abstract']:
            if key in cleaned:
                cleaned[key] = self.clean_text(cleaned[key])
        return cleaned

    def search_papers(self, query, num_results=10, search_type="semantic"):
        if search_type == "semantic":
            results = self.collection.query(
                query_texts=[query],
                n_results=num_results
            )
            # Clean the metadata
            results['metadatas'] = [[self.clean_metadata(m) for m in results['metadatas'][0]]]
            return results
            
        elif search_type == "keyword":
            # Use ChromaDB's built-in SQLite FTS5 support for exact keyword matching
            results = self.collection.query(
                query_texts=[query],
                n_results=num_results,
                where_document={
                    "$or": [
                        {"$contains": query},
                        {"$contains": query.lower()}
                    ]
                }
            )
            
            # Clean the metadata
            results['metadatas'] = [[self.clean_metadata(m) for m in results['metadatas'][0]]]
            results['total_matches'] = len(results['ids'][0])
            return results
            
        else:  # traditional search
            # Split query into words and remove common words
            query_words = [word.lower() for word in query.split() 
                         if word.lower() not in {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}]
            
            if not query_words:  # If all words were filtered out
                query_words = [word.lower() for word in query.split()]
            
            # Build a complex query using FTS5 for initial filtering
            where_conditions = []
            for word in query_words:
                where_conditions.append({"$contains": word})
                where_conditions.append({"$contains": word.upper()})
            
            # Use FTS5 for initial filtering
            initial_results = self.collection.query(
                query_texts=[query],
                n_results=num_results * 2,  # Get more results than needed for ranking
                where_document={
                    "$or": where_conditions
                }
            )
            
            # Apply our ranking system to the filtered results
            matches = []
            for i, metadata in enumerate(initial_results['metadatas'][0]):
                cleaned_metadata = self.clean_metadata(metadata)
                title = cleaned_metadata.get('title', '').lower()
                abstract = cleaned_metadata.get('abstract', '').lower()
                
                # Calculate match score
                title_matches = sum(1 for word in query_words if word in title)
                abstract_matches = sum(1 for word in query_words if word in abstract)
                
                # Calculate relevance score
                if title_matches > 0 or abstract_matches > 0:
                    # Base score: number of matching words
                    base_score = title_matches + abstract_matches
                    
                    # Bonus for title matches (they're more important)
                    title_bonus = title_matches * 2
                    
                    # Bonus for matching all words
                    all_words_bonus = 2 if title_matches + abstract_matches == len(query_words) else 0
                    
                    # Calculate final score
                    relevance_score = base_score + title_bonus + all_words_bonus
                    
                    matches.append({
                        'id': initial_results['ids'][0][i],
                        'metadata': cleaned_metadata,
                        'distance': 1 - (relevance_score / (len(query_words) * 3)),  # Normalize distance
                        'match_score': relevance_score
                    })
            
            # Sort matches by relevance score
            matches.sort(key=lambda x: x['match_score'], reverse=True)
            
            # Take only the requested number of results
            matches = matches[:num_results]
            
            # Format results to match the semantic search structure
            return {
                'ids': [[m['id'] for m in matches]],
                'metadatas': [[m['metadata'] for m in matches]],
                'distances': [[m['distance'] for m in matches]],
                'total_matches': len(matches)
            }

    def get_paper(self, paper_id):
        result = self.collection.get(ids=[paper_id])
        if result and result['metadatas']:
            result['metadatas'] = [self.clean_metadata(m) for m in result['metadatas']]
        return result 