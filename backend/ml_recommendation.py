"""
Machine Learning Recommendation Algorithm for MuzikaX
This module implements an advanced recommendation system using Python ML libraries
to provide personalized music recommendations based on user behavior, genre preferences, 
and location data.
"""

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import json
import pickle
import os
from datetime import datetime
from typing import List, Dict, Tuple, Optional


class MLRecommendationEngine:
    def __init__(self):
        """
        Initialize the ML recommendation engine
        """
        self.track_features = None
        self.track_metadata = None
        self.user_profiles = {}
        self.genre_clusters = {}
        self.location_preferences = {}
        self.scaler = StandardScaler()
        self.tfidf_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        
    def load_data(self, tracks_data: List[Dict], user_data: List[Dict]):
        """
        Load track metadata and user interaction data
        """
        # Convert to DataFrame for easier processing
        self.track_metadata = pd.DataFrame(tracks_data)
        
        # Create numerical features for ML
        self.create_numerical_features()
        
        # Process user data to build user profiles
        self.build_user_profiles(user_data)
        
    def create_numerical_features(self):
        """
        Create numerical features from track metadata for ML processing
        """
        # Create features from categorical data
        features_df = pd.DataFrame()
        
        # Normalize plays and likes
        if 'plays' in self.track_metadata.columns:
            features_df['normalized_plays'] = self.track_metadata['plays'].fillna(0) / (self.track_metadata['plays'].max() + 1)
        else:
            features_df['normalized_plays'] = 0
            
        if 'likes' in self.track_metadata.columns:
            features_df['normalized_likes'] = self.track_metadata['likes'].fillna(0) / (self.track_metadata['likes'].max() + 1)
        else:
            features_df['normalized_likes'] = 0
        
        # Genre encoding (using TF-IDF for genre similarity)
        if 'genre' in self.track_metadata.columns:
            genre_str = self.track_metadata['genre'].fillna('unknown').astype(str)
            genre_matrix = self.tfidf_vectorizer.fit_transform(genre_str)
            genre_df = pd.DataFrame(genre_matrix.toarray(), columns=[f'genre_{i}' for i in range(genre_matrix.shape[1])])
            features_df = pd.concat([features_df, genre_df], axis=1)
        else:
            # Create dummy genre features
            features_df['genre_unknown'] = 1
        
        # Creator ID encoding (if available)
        if 'creatorId' in self.track_metadata.columns:
            creator_counts = self.track_metadata['creatorId'].value_counts()
            features_df['creator_popularity'] = self.track_metadata['creatorId'].map(creator_counts).fillna(0) / creator_counts.max()
        
        # Type encoding (song, beat, mix)
        if 'type' in self.track_metadata.columns:
            type_dummies = pd.get_dummies(self.track_metadata['type'], prefix='type')
            features_df = pd.concat([features_df, type_dummies], axis=1)
        else:
            features_df['type_song'] = 1  # Default to song
        
        # Location-based features (if available)
        if 'location' in self.track_metadata.columns:
            location_str = self.track_metadata['location'].fillna('global').astype(str)
            location_matrix = self.tfidf_vectorizer.fit_transform(location_str)
            location_df = pd.DataFrame(location_matrix.toarray(), columns=[f'loc_{i}' for i in range(location_matrix.shape[1])])
            features_df = pd.concat([features_df, location_df], axis=1)
        
        # Fill NaN values with 0
        self.track_features = features_df.fillna(0)
        
        # Scale the features
        self.track_features_scaled = self.scaler.fit_transform(self.track_features)
        
    def build_user_profiles(self, user_data: List[Dict]):
        """
        Build user preference profiles based on listening history
        """
        for user_interaction in user_data:
            user_id = user_interaction.get('userId')
            if not user_id:
                continue
                
            if user_id not in self.user_profiles:
                self.user_profiles[user_id] = {
                    'genres': {},
                    'creators': {},
                    'locations': {},
                    'interaction_history': []
                }
            
            # Update user profile based on interaction
            track_id = user_interaction.get('trackId')
            interaction_type = user_interaction.get('type', 'play')  # play, like, skip, etc.
            timestamp = user_interaction.get('timestamp', datetime.now())
            
            # Get track metadata to extract preferences
            track_row = self.track_metadata[self.track_metadata['_id'] == track_id]
            if not track_row.empty:
                track_genre = track_row.iloc[0].get('genre', 'unknown')
                track_creator = track_row.iloc[0].get('creatorId', 'unknown')
                
                # Weight based on interaction type
                weight = 1.0
                if interaction_type == 'like':
                    weight = 2.0
                elif interaction_type == 'skip':
                    weight = 0.1
                elif interaction_type == 'play':
                    weight = 1.0
                    
                # Update genre preferences
                if track_genre not in self.user_profiles[user_id]['genres']:
                    self.user_profiles[user_id]['genres'][track_genre] = 0
                self.user_profiles[user_id]['genres'][track_genre] += weight
                
                # Update creator preferences
                if track_creator not in self.user_profiles[user_id]['creators']:
                    self.user_profiles[user_id]['creators'][track_creator] = 0
                self.user_profiles[user_id]['creators'][track_creator] += weight
                
            # Store interaction in history
            self.user_profiles[user_id]['interaction_history'].append({
                'trackId': track_id,
                'type': interaction_type,
                'timestamp': timestamp,
                'weight': weight
            })
    
    def calculate_track_similarities(self) -> np.ndarray:
        """
        Calculate similarities between tracks using cosine similarity
        """
        return cosine_similarity(self.track_features_scaled)
    
    def get_collaborative_filtering_recommendations(self, user_id: str, n_recommendations: int = 10) -> List[str]:
        """
        Get recommendations using collaborative filtering based on similar users
        """
        if user_id not in self.user_profiles:
            # Return popular tracks if user profile doesn't exist
            return self.get_popular_tracks(n_recommendations)
        
        user_profile = self.user_profiles[user_id]
        
        # Calculate user preference vector
        user_genres = user_profile['genres']
        user_creators = user_profile['creators']
        
        # Score all tracks based on user preferences
        track_scores = []
        for idx, track in self.track_metadata.iterrows():
            score = 0.0
            
            # Genre match score
            track_genre = track.get('genre', 'unknown')
            if track_genre in user_genres:
                score += user_genres[track_genre] * 0.4  # 40% weight to genre
            else:
                score += 0.1  # Small bonus for diversity
                
            # Creator match score
            track_creator = track.get('creatorId', 'unknown')
            if track_creator in user_creators:
                score += user_creators[track_creator] * 0.3  # 30% weight to creator
            else:
                score += 0.1  # Small bonus for diversity
                
            # Popularity boost
            track_plays = track.get('plays', 0)
            if track_plays > 0:
                normalized_plays = track_plays / self.track_metadata['plays'].max() if 'plays' in self.track_metadata.columns else 0
                score += normalized_plays * 0.2  # 20% weight to popularity
            
            # Freshness factor
            track_created = track.get('createdAt', datetime.now())
            if isinstance(track_created, str):
                try:
                    track_created = datetime.fromisoformat(track_created.replace('Z', '+00:00'))
                except:
                    track_created = datetime.now()
                    
            freshness = min(1.0, (datetime.now() - track_created).days / 365)  # Up to 1 year gets full freshness score
            score += (1 - freshness) * 0.1  # 10% weight to freshness
            
            track_scores.append((track['_id'], score))
        
        # Sort by score and return top N
        track_scores.sort(key=lambda x: x[1], reverse=True)
        return [track_id for track_id, score in track_scores[:n_recommendations]]
    
    def get_content_based_recommendations(self, seed_track_ids: List[str], n_recommendations: int = 10) -> List[str]:
        """
        Get recommendations using content-based filtering based on track features
        """
        similarities = self.calculate_track_similarities()
        
        track_scores = {}
        
        for seed_track_id in seed_track_ids:
            # Find the index of the seed track
            seed_idx = self.track_metadata[self.track_metadata['_id'] == seed_track_id].index
            if len(seed_idx) == 0:
                continue
            seed_idx = seed_idx[0]
            
            # Get similarity scores for this track
            sim_scores = list(enumerate(similarities[seed_idx]))
            
            # Add scores to track_scores dictionary
            for idx, score in sim_scores:
                track_id = self.track_metadata.iloc[idx]['_id']
                if track_id in seed_track_ids:
                    continue  # Skip seed tracks
                if track_id not in track_scores:
                    track_scores[track_id] = 0
                track_scores[track_id] += score
        
        # Sort and return top recommendations
        sorted_scores = sorted(track_scores.items(), key=lambda x: x[1], reverse=True)
        return [track_id for track_id, score in sorted_scores[:n_recommendations]]
    
    def get_popular_tracks(self, n_recommendations: int = 10) -> List[str]:
        """
        Get popular tracks based on plays and likes
        """
        if 'plays' in self.track_metadata.columns:
            # Sort by plays and likes
            sorted_tracks = self.track_metadata.nlargest(n_recommendations, 'plays')
            return sorted_tracks['_id'].tolist()
        else:
            # Fallback to random if no play data
            return self.track_metadata.sample(n=n_recommendations, random_state=42)['_id'].tolist()
    
    def get_location_based_recommendations(self, user_location: str, n_recommendations: int = 10) -> List[str]:
        """
        Get recommendations based on user's location
        """
        if 'location' not in self.track_metadata.columns:
            return self.get_popular_tracks(n_recommendations)
        
        # Find tracks from the same or similar locations
        location_matches = self.track_metadata[
            self.track_metadata['location'].str.contains(user_location, case=False, na=False)
        ]
        
        if len(location_matches) < n_recommendations:
            # If not enough local tracks, include nearby locations or global tracks
            all_locations = self.track_metadata.copy()
            all_locations['location_match'] = all_locations['location'].apply(
                lambda loc: 2.0 if user_location.lower() in str(loc).lower() else 
                           1.5 if str(loc) != 'global' else 1.0
            )
            sorted_tracks = all_locations.nlargest(n_recommendations * 2, ['location_match', 'plays'])
        else:
            sorted_tracks = location_matches.nlargest(n_recommendations, 'plays')
        
        return sorted_tracks['_id'].tolist()
    
    def get_personalized_recommendations(self, user_id: str, seed_track_id: Optional[str] = None, 
                                       user_location: Optional[str] = None, n_recommendations: int = 10) -> List[str]:
        """
        Main recommendation function that combines multiple approaches
        """
        recommendations = []
        
        # Get collaborative filtering recommendations
        collab_recs = self.get_collaborative_filtering_recommendations(user_id, n_recommendations)
        recommendations.extend(collab_recs)
        
        if seed_track_id:
            # Get content-based recommendations from seed track
            content_recs = self.get_content_based_recommendations([seed_track_id], n_recommendations)
            recommendations.extend(content_recs)
        
        if user_location:
            # Get location-based recommendations
            location_recs = self.get_location_based_recommendations(user_location, n_recommendations)
            recommendations.extend(location_recs)
        
        # Get popular tracks as fallback
        popular_recs = self.get_popular_tracks(n_recommendations)
        recommendations.extend(popular_recs)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_recommendations = []
        for track_id in recommendations:
            if track_id not in seen and track_id not in (seed_track_id or []):
                seen.add(track_id)
                unique_recommendations.append(track_id)
        
        return unique_recommendations[:n_recommendations]
    
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
            'track_features_scaled': self.track_features_scaled
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
    
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
        self.track_features_scaled = model_data['track_features_scaled']


# Example usage
def example_usage():
    """
    Example of how to use the recommendation engine
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
        }
    ]
    
    # Initialize and train the recommendation engine
    engine = MLRecommendationEngine()
    engine.load_data(sample_tracks, sample_users)
    
    # Get personalized recommendations
    recommendations = engine.get_personalized_recommendations(
        user_id='user1',
        seed_track_id='track1',
        user_location='us',
        n_recommendations=5
    )
    
    print("Recommended tracks:", recommendations)
    
    # Save the model
    engine.save_model('ml_recommendation_model.pkl')


if __name__ == "__main__":
    example_usage()