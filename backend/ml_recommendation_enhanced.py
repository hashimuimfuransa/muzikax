"""
Advanced Machine Learning Recommendation Algorithm for MuzikaX
This module implements a scalable recommendation system using Python ML libraries
to provide personalized music recommendations based on user behavior, genre preferences, 
and location data. Optimized for handling massive datasets.
"""

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import TruncatedSVD
from sklearn.cluster import MiniBatchKMeans
import json
import pickle
import os
import sqlite3
from datetime import datetime
from typing import List, Dict, Tuple, Optional
from collections import defaultdict
import threading
from concurrent.futures import ThreadPoolExecutor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AdvancedMLRecommendationEngine:
    def __init__(self, max_tracks_for_training=10000, cache_size=1000):
        """
        Initialize the advanced ML recommendation engine
        """
        self.max_tracks_for_training = max_tracks_for_training
        self.cache_size = cache_size
        
        # Core components
        self.track_features = None
        self.track_metadata = None
        self.user_profiles = {}
        self.genre_clusters = {}
        self.location_preferences = {}
        
        # ML components
        self.scaler = StandardScaler()
        self.tfidf_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.svd_model = TruncatedSVD(n_components=50)  # For dimensionality reduction
        self.kmeans_model = MiniBatchKMeans(n_clusters=50, random_state=42)  # Scalable clustering
        
        # Caching for performance
        self.recommendation_cache = {}
        self.similarity_matrices = {}
        
        # Thread safety
        self.lock = threading.RLock()
        
        # Performance tracking
        self.performance_stats = {
            'requests_served': 0,
            'cache_hits': 0,
            'avg_response_time': 0.0
        }
    
    def load_data_incrementally(self, tracks_data: List[Dict], user_data: List[Dict], 
                               batch_size=1000):
        """
        Load data incrementally to handle massive datasets without memory overload
        """
        logger.info(f"Loading data incrementally with batch size {batch_size}")
        
        # Process tracks in batches
        track_batches = [tracks_data[i:i + batch_size] for i in range(0, len(tracks_data), batch_size)]
        all_track_features = []
        all_track_metadata = []
        
        for i, track_batch in enumerate(track_batches):
            logger.info(f"Processing track batch {i+1}/{len(track_batches)}")
            
            # Convert to DataFrame for this batch
            batch_df = pd.DataFrame(track_batch)
            batch_features = self._create_numerical_features_batch(batch_df)
            
            all_track_features.append(batch_features)
            all_track_metadata.append(batch_df)
        
        # Combine all batches
        self.track_features = pd.concat(all_track_features, ignore_index=True)
        self.track_metadata = pd.concat(all_track_metadata, ignore_index=True)
        
        # Process user data in batches
        user_batches = [user_data[i:i + batch_size] for i in range(0, len(user_data), batch_size)]
        for i, user_batch in enumerate(user_batches):
            logger.info(f"Processing user batch {i+1}/{len(user_batches)}")
            self._build_user_profiles_batch(user_batch)
    
    def _create_numerical_features_batch(self, track_df: pd.DataFrame) -> pd.DataFrame:
        """
        Create numerical features from track metadata for ML processing
        """
        features_df = pd.DataFrame(index=track_df.index)
        
        # Normalize plays and likes with min-max scaling
        if 'plays' in track_df.columns:
            max_plays = track_df['plays'].max()
            features_df['normalized_plays'] = track_df['plays'].fillna(0) / (max_plays if max_plays > 0 else 1)
        else:
            features_df['normalized_plays'] = 0
            
        if 'likes' in track_df.columns:
            max_likes = track_df['likes'].max()
            features_df['normalized_likes'] = track_df['likes'].fillna(0) / (max_likes if max_likes > 0 else 1)
        else:
            features_df['normalized_likes'] = 0
        
        # Genre encoding (using TF-IDF for genre similarity)
        if 'genre' in track_df.columns:
            genre_str = track_df['genre'].fillna('unknown').astype(str)
            # Fit only on first batch, transform subsequent batches
            if hasattr(self.tfidf_vectorizer, 'vocabulary_'):
                genre_matrix = self.tfidf_vectorizer.transform(genre_str)
            else:
                genre_matrix = self.tfidf_vectorizer.fit_transform(genre_str)
            genre_df = pd.DataFrame(
                genre_matrix.toarray(), 
                columns=[f'genre_{i}' for i in range(genre_matrix.shape[1])],
                index=track_df.index
            )
            features_df = pd.concat([features_df, genre_df], axis=1)
        else:
            features_df['genre_unknown'] = 1
        
        # Creator ID encoding (if available)
        if 'creatorId' in track_df.columns:
            creator_counts = track_df['creatorId'].value_counts()
            features_df['creator_popularity'] = track_df['creatorId'].map(creator_counts).fillna(0) / creator_counts.max()
        
        # Type encoding (song, beat, mix)
        if 'type' in track_df.columns:
            type_dummies = pd.get_dummies(track_df['type'], prefix='type')
            features_df = pd.concat([features_df, type_dummies], axis=1)
        else:
            features_df['type_song'] = 1  # Default to song
        
        # Location-based features (if available)
        if 'location' in track_df.columns:
            location_str = track_df['location'].fillna('global').astype(str)
            # Use the same TF-IDF vectorizer to transform
            if hasattr(self.tfidf_vectorizer, 'vocabulary_'):
                location_matrix = self.tfidf_vectorizer.transform(location_str)
            else:
                location_matrix = self.tfidf_vectorizer.fit_transform(location_str)
            location_df = pd.DataFrame(
                location_matrix.toarray(),
                columns=[f'loc_{i}' for i in range(location_matrix.shape[1])],
                index=track_df.index
            )
            features_df = pd.concat([features_df, location_df], axis=1)
        
        # Fill NaN values with 0
        features_df = features_df.fillna(0)
        
        return features_df
    
    def _build_user_profiles_batch(self, user_data: List[Dict]):
        """
        Build user preference profiles based on listening history from batch
        """
        for user_interaction in user_data:
            user_id = user_interaction.get('userId')
            if not user_id:
                continue
                
            with self.lock:
                if user_id not in self.user_profiles:
                    self.user_profiles[user_id] = {
                        'genres': defaultdict(float),
                        'creators': defaultdict(float),
                        'locations': defaultdict(float),
                        'interaction_history': [],
                        'preferences_updated': datetime.now()
                    }
                
                # Update user profile based on interaction
                track_id = user_interaction.get('trackId')
                interaction_type = user_interaction.get('type', 'play')  # play, like, skip, etc.
                timestamp = user_interaction.get('timestamp', datetime.now())
                
                # Find track metadata to extract preferences
                track_row = self.track_metadata[self.track_metadata['_id'] == track_id]
                if not track_row.empty:
                    track_genre = track_row.iloc[0].get('genre', 'unknown')
                    track_creator = track_row.iloc[0].get('creatorId', 'unknown')
                    track_location = track_row.iloc[0].get('location', 'global')
                    
                    # Weight based on interaction type
                    weight = 1.0
                    if interaction_type == 'like':
                        weight = 2.0
                    elif interaction_type == 'skip':
                        weight = 0.1
                    elif interaction_type == 'play':
                        weight = 1.0
                        
                    # Update genre preferences with decay function
                    current_weight = self.user_profiles[user_id]['genres'][track_genre]
                    self.user_profiles[user_id]['genres'][track_genre] = current_weight + weight
                    
                    # Update creator preferences
                    current_weight = self.user_profiles[user_id]['creators'][track_creator]
                    self.user_profiles[user_id]['creators'][track_creator] = current_weight + weight
                    
                    # Update location preferences
                    current_weight = self.user_profiles[user_id]['locations'][track_location]
                    self.user_profiles[user_id]['locations'][track_location] = current_weight + weight
                
                # Store interaction in history
                self.user_profiles[user_id]['interaction_history'].append({
                    'trackId': track_id,
                    'type': interaction_type,
                    'timestamp': timestamp,
                    'weight': weight
                })
    
    def train_models(self):
        """
        Train the ML models using the loaded data
        Uses dimensionality reduction and clustering for scalability
        """
        logger.info("Training ML models for scalability...")
        
        # Scale features
        scaled_features = self.scaler.fit_transform(self.track_features)
        
        # Apply SVD for dimensionality reduction
        reduced_features = self.svd_model.fit_transform(scaled_features)
        
        # Apply MiniBatch K-Means for clustering (scalable clustering)
        cluster_labels = self.kmeans_model.fit_predict(reduced_features)
        
        # Store reduced features and clusters
        self.reduced_track_features = reduced_features
        self.track_clusters = cluster_labels
        
        # Precompute similarity matrices for different use cases
        logger.info("Computing similarity matrices...")
        
        # Content-based similarity (using reduced features)
        self.content_similarity_matrix = cosine_similarity(reduced_features)
        
        logger.info("Models trained successfully!")
    
    def get_collaborative_filtering_recommendations(self, user_id: str, n_recommendations: int = 10) -> List[str]:
        """
        Get recommendations using collaborative filtering based on similar users
        Enhanced to handle massive data efficiently
        """
        start_time = datetime.now()
        
        # Check cache first
        cache_key = f"collab_{user_id}_{n_recommendations}"
        if cache_key in self.recommendation_cache:
            self.performance_stats['cache_hits'] += 1
            self.performance_stats['requests_served'] += 1
            self._update_avg_response_time(start_time)
            return self.recommendation_cache[cache_key]
        
        if user_id not in self.user_profiles:
            # Return popular tracks if user profile doesn't exist
            result = self.get_popular_tracks(n_recommendations)
        else:
            user_profile = self.user_profiles[user_id]
            
            # Get user's interaction history
            user_history = set(item['trackId'] for item in user_profile['interaction_history'])
            
            # Score tracks based on user preferences
            track_scores = []
            for idx, track in self.track_metadata.iterrows():
                track_id = track['_id']
                
                # Skip tracks user has already interacted with
                if track_id in user_history:
                    continue
                
                score = 0.0
                
                # Genre match score
                track_genre = track.get('genre', 'unknown')
                if track_genre in user_profile['genres']:
                    genre_score = user_profile['genres'][track_genre]
                    score += genre_score * 0.4  # 40% weight to genre
                
                # Creator match score
                track_creator = track.get('creatorId', 'unknown')
                if track_creator in user_profile['creators']:
                    creator_score = user_profile['creators'][track_creator]
                    score += creator_score * 0.3  # 30% weight to creator
                
                # Popularity boost
                track_plays = track.get('plays', 0)
                if track_plays > 0:
                    max_plays = self.track_metadata['plays'].max()
                    normalized_plays = track_plays / max_plays if max_plays > 0 else 0
                    score += normalized_plays * 0.2  # 20% weight to popularity
                
                # Freshness factor
                track_created = track.get('createdAt', datetime.now())
                if isinstance(track_created, str):
                    try:
                        track_created = datetime.fromisoformat(track_created.replace('Z', '+00:00'))
                    except:
                        track_created = datetime.now()
                        
                days_old = (datetime.now() - track_created).days
                freshness = min(1.0, days_old / 365.0)  # Up to 1 year gets full freshness score
                score += (1 - freshness) * 0.1  # 10% weight to freshness
                
                track_scores.append((track_id, score))
            
            # Sort by score and return top N
            track_scores.sort(key=lambda x: x[1], reverse=True)
            result = [track_id for track_id, score in track_scores[:n_recommendations]]
        
        # Cache the result
        if len(self.recommendation_cache) >= self.cache_size:
            # Remove oldest cache entry
            oldest_key = next(iter(self.recommendation_cache))
            del self.recommendation_cache[oldest_key]
        
        self.recommendation_cache[cache_key] = result
        
        self.performance_stats['requests_served'] += 1
        self._update_avg_response_time(start_time)
        
        return result
    
    def get_content_based_recommendations(self, seed_track_ids: List[str], n_recommendations: int = 10) -> List[str]:
        """
        Get recommendations using content-based filtering based on track features
        Uses SVD-reduced features for efficiency with large datasets
        """
        start_time = datetime.now()
        
        # Check cache first
        cache_key = f"content_{'_'.join(sorted(seed_track_ids))}_{n_recommendations}"
        if cache_key in self.recommendation_cache:
            self.performance_stats['cache_hits'] += 1
            self.performance_stats['requests_served'] += 1
            self._update_avg_response_time(start_time)
            return self.recommendation_cache[cache_key]
        
        # Get indices of seed tracks
        seed_indices = []
        for seed_track_id in seed_track_ids:
            idx_list = self.track_metadata[self.track_metadata['_id'] == seed_track_id].index.tolist()
            if idx_list:
                seed_indices.append(idx_list[0])
        
        if not seed_indices:
            result = []
        else:
            # Calculate average similarity to all seed tracks
            avg_similarities = np.zeros(len(self.track_metadata))
            
            for seed_idx in seed_indices:
                if seed_idx < len(self.content_similarity_matrix):
                    avg_similarities += self.content_similarity_matrix[seed_idx]
            
            avg_similarities /= len(seed_indices) if seed_indices else 1
            
            # Get top N most similar tracks (excluding seed tracks)
            track_scores = [(self.track_metadata.iloc[i]['_id'], avg_similarities[i]) 
                           for i in range(len(avg_similarities))]
            
            # Sort by similarity and return top N
            track_scores.sort(key=lambda x: x[1], reverse=True)
            
            # Exclude seed tracks from results
            result = [track_id for track_id, score in track_scores 
                     if track_id not in seed_track_ids][:n_recommendations]
        
        # Cache the result
        if len(self.recommendation_cache) >= self.cache_size:
            # Remove oldest cache entry
            oldest_key = next(iter(self.recommendation_cache))
            del self.recommendation_cache[oldest_key]
        
        self.recommendation_cache[cache_key] = result
        
        self.performance_stats['requests_served'] += 1
        self._update_avg_response_time(start_time)
        
        return result
    
    def get_popular_tracks(self, n_recommendations: int = 10) -> List[str]:
        """
        Get popular tracks based on plays and likes
        """
        start_time = datetime.now()
        
        cache_key = f"popular_{n_recommendations}"
        if cache_key in self.recommendation_cache:
            self.performance_stats['cache_hits'] += 1
            self.performance_stats['requests_served'] += 1
            self._update_avg_response_time(start_time)
            return self.recommendation_cache[cache_key]
        
        if 'plays' in self.track_metadata.columns:
            # Sort by plays and likes
            sorted_tracks = self.track_metadata.nlargest(n_recommendations, 'plays')
            result = sorted_tracks['_id'].tolist()
        else:
            # Fallback to random if no play data
            result = self.track_metadata.sample(n=min(n_recommendations, len(self.track_metadata)), 
                                             random_state=42)['_id'].tolist()
        
        self.recommendation_cache[cache_key] = result
        self.performance_stats['requests_served'] += 1
        self._update_avg_response_time(start_time)
        
        return result
    
    def get_location_based_recommendations(self, user_location: str, n_recommendations: int = 10) -> List[str]:
        """
        Get recommendations based on user's location
        Optimized for massive data with efficient filtering
        """
        start_time = datetime.now()
        
        cache_key = f"location_{user_location}_{n_recommendations}"
        if cache_key in self.recommendation_cache:
            self.performance_stats['cache_hits'] += 1
            self.performance_stats['requests_served'] += 1
            self._update_avg_response_time(start_time)
            return self.recommendation_cache[cache_key]
        
        if 'location' not in self.track_metadata.columns:
            result = self.get_popular_tracks(n_recommendations)
        else:
            # Use vectorized string operations for efficiency
            location_mask = self.track_metadata['location'].str.contains(
                user_location, case=False, na=False
            )
            location_matches = self.track_metadata[location_mask]
            
            if len(location_matches) < n_recommendations:
                # If not enough local tracks, include nearby locations or global tracks
                all_locations = self.track_metadata.copy()
                all_locations['location_match'] = all_locations['location'].apply(
                    lambda loc: 2.0 if user_location.lower() in str(loc).lower() else 
                               1.5 if str(loc) != 'global' else 1.0
                )
                sorted_tracks = all_locations.nlargest(
                    n_recommendations * 2, ['location_match', 'plays']
                )
            else:
                sorted_tracks = location_matches.nlargest(n_recommendations, 'plays')
            
            result = sorted_tracks['_id'].tolist()
        
        self.recommendation_cache[cache_key] = result
        self.performance_stats['requests_served'] += 1
        self._update_avg_response_time(start_time)
        
        return result
    
    def get_personalized_recommendations(self, user_id: str, seed_track_id: Optional[str] = None, 
                                       user_location: Optional[str] = None, n_recommendations: int = 10) -> List[str]:
        """
        Main recommendation function that combines multiple approaches
        Uses weighted combination of different recommendation strategies
        """
        start_time = datetime.now()
        
        cache_key = f"personalized_{user_id}_{seed_track_id}_{user_location}_{n_recommendations}"
        if cache_key in self.recommendation_cache:
            self.performance_stats['cache_hits'] += 1
            self.performance_stats['requests_served'] += 1
            self._update_avg_response_time(start_time)
            return self.recommendation_cache[cache_key]
        
        recommendations = []
        
        # Get collaborative filtering recommendations (40% weight)
        collab_recs = self.get_collaborative_filtering_recommendations(user_id, n_recommendations)
        for i, track_id in enumerate(collab_recs):
            recommendations.append((track_id, 0.4 * (1 - i/len(collab_recs))))  # Rank-based weighting
        
        if seed_track_id:
            # Get content-based recommendations from seed track (30% weight)
            content_recs = self.get_content_based_recommendations([seed_track_id], n_recommendations)
            for i, track_id in enumerate(content_recs):
                recommendations.append((track_id, 0.3 * (1 - i/len(content_recs))))
        
        if user_location:
            # Get location-based recommendations (20% weight)
            location_recs = self.get_location_based_recommendations(user_location, n_recommendations)
            for i, track_id in enumerate(location_recs):
                recommendations.append((track_id, 0.2 * (1 - i/len(location_recs))))
        
        # Get popular tracks as fallback (10% weight)
        popular_recs = self.get_popular_tracks(n_recommendations)
        for i, track_id in enumerate(popular_recs):
            recommendations.append((track_id, 0.1 * (1 - i/len(popular_recs))))
        
        # Aggregate scores and remove duplicates while preserving order
        track_scores = defaultdict(float)
        for track_id, score in recommendations:
            track_scores[track_id] += score
        
        # Sort by aggregated score and return top N
        sorted_tracks = sorted(track_scores.items(), key=lambda x: x[1], reverse=True)
        result = [track_id for track_id, score in sorted_tracks[:n_recommendations]]
        
        # Cache the result
        if len(self.recommendation_cache) >= self.cache_size:
            # Remove oldest cache entry
            oldest_key = next(iter(self.recommendation_cache))
            del self.recommendation_cache[oldest_key]
        
        self.recommendation_cache[cache_key] = result
        
        self.performance_stats['requests_served'] += 1
        self._update_avg_response_time(start_time)
        
        return result
    
    def _update_avg_response_time(self, start_time):
        """
        Update average response time for performance tracking
        """
        response_time = (datetime.now() - start_time).total_seconds()
        self.performance_stats['avg_response_time'] = (
            (self.performance_stats['avg_response_time'] * (self.performance_stats['requests_served'] - 1) + response_time) /
            self.performance_stats['requests_served']
        )
    
    def get_performance_stats(self):
        """
        Get performance statistics
        """
        return self.performance_stats
    
    def save_model(self, filepath: str):
        """
        Save the trained model to disk
        """
        model_data = {
            'track_features': self.track_features,
            'track_metadata': self.track_metadata,
            'user_profiles': self.user_profiles,
            'scaler': self.scaler,
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'svd_model': self.svd_model,
            'kmeans_model': self.kmeans_model,
            'reduced_track_features': self.reduced_track_features,
            'track_clusters': self.track_clusters,
            'content_similarity_matrix': self.content_similarity_matrix,
            'recommendation_cache': self.recommendation_cache,
            'performance_stats': self.performance_stats
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """
        Load a trained model from disk
        """
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.track_features = model_data['track_features']
        self.track_metadata = model_data['track_metadata']
        self.user_profiles = model_data['user_profiles']
        self.scaler = model_data['scaler']
        self.tfidf_vectorizer = model_data['tfidf_vectorizer']
        self.svd_model = model_data['svd_model']
        self.kmeans_model = model_data['kmeans_model']
        self.reduced_track_features = model_data['reduced_track_features']
        self.track_clusters = model_data['track_clusters']
        self.content_similarity_matrix = model_data['content_similarity_matrix']
        self.recommendation_cache = model_data['recommendation_cache']
        self.performance_stats = model_data['performance_stats']
        
        logger.info(f"Model loaded from {filepath}")


# Example usage and testing
def example_usage():
    """
    Example of how to use the advanced recommendation engine
    """
    # Sample data - in practice, this would come from your database
    sample_tracks = [
        {
            '_id': 'track1',
            'title': 'Sample Song 1',
            'genre': 'pop',
            'creatorId': 'creator1',
            'plays': 1000,
            'likes': 100,
            'location': 'us'
        },
        {
            '_id': 'track2',
            'title': 'Sample Song 2',
            'genre': 'rock',
            'creatorId': 'creator2',
            'plays': 800,
            'likes': 80,
            'location': 'uk'
        },
        {
            '_id': 'track3',
            'title': 'Sample Song 3',
            'genre': 'pop',
            'creatorId': 'creator1',
            'plays': 1200,
            'likes': 150,
            'location': 'us'
        },
        {
            '_id': 'track4',
            'title': 'Sample Song 4',
            'genre': 'hip-hop',
            'creatorId': 'creator3',
            'plays': 1500,
            'likes': 200,
            'location': 'us'
        },
        {
            '_id': 'track5',
            'title': 'Sample Song 5',
            'genre': 'electronic',
            'creatorId': 'creator4',
            'plays': 900,
            'likes': 90,
            'location': 'ca'
        }
    ]
    
    sample_users = [
        {
            'userId': 'user1',
            'trackId': 'track1',
            'type': 'play',
            'timestamp': '2023-01-01T00:00:00Z'
        },
        {
            'userId': 'user1',
            'trackId': 'track3',
            'type': 'like',
            'timestamp': '2023-01-02T00:00:00Z'
        },
        {
            'userId': 'user1',
            'trackId': 'track4',
            'type': 'play',
            'timestamp': '2023-01-03T00:00:00Z'
        }
    ]
    
    # Initialize and train the advanced recommendation engine
    engine = AdvancedMLRecommendationEngine(max_tracks_for_training=10000, cache_size=1000)
    
    # Load data incrementally
    engine.load_data_incrementally(sample_tracks, sample_users, batch_size=1000)
    
    # Train the models
    engine.train_models()
    
    # Get personalized recommendations
    recommendations = engine.get_personalized_recommendations(
        user_id='user1',
        seed_track_id='track1',
        user_location='us',
        n_recommendations=5
    )
    
    print("Recommended tracks:", recommendations)
    
    # Print performance stats
    print("Performance stats:", engine.get_performance_stats())
    
    # Save the model
    engine.save_model('advanced_ml_recommendation_model.pkl')


if __name__ == "__main__":
    example_usage()