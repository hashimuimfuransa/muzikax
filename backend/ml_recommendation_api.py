"""
Flask API for ML-powered Recommendations
This module provides REST API endpoints to serve ML-based music recommendations
"""

from flask import Flask, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml_recommendation import MLRecommendationEngine
import json
import pymongo
from bson import ObjectId
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# MongoDB connection (you'll need to configure this based on your setup)
client = pymongo.MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client['muzikax_db']

class ObjectIdEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

def get_tracks_from_db(limit=500):
    """Retrieve tracks data from MongoDB"""
    try:
        tracks_collection = db['tracks']
        tracks = list(tracks_collection.find({}, {
            '_id': 1,
            'title': 1,
            'genre': 1,
            'creatorId': 1,
            'plays': 1,
            'likes': 1,
            'location': 1,
            'createdAt': 1
        }).limit(limit))
        
        # Convert ObjectId to string
        for track in tracks:
            track['_id'] = str(track['_id'])
            if 'creatorId' in track and isinstance(track['creatorId'], ObjectId):
                track['creatorId'] = str(track['creatorId'])
        
        return tracks
    except Exception as e:
        logger.error(f"Error retrieving tracks from DB: {e}")
        return []

def get_user_interactions_from_db(user_id=None, limit=1000):
    """Retrieve user interactions data from MongoDB"""
    try:
        interactions = []
        
        # Get recently played tracks
        if user_id:
            user_collection = db['users']
            user_doc = user_collection.find_one({'_id': ObjectId(user_id)})
            if user_doc and 'recentlyPlayed' in user_doc:
                for rp in user_doc['recentlyPlayed']:
                    interactions.append({
                        'userId': user_id,
                        'trackId': str(rp['trackId']) if isinstance(rp['trackId'], ObjectId) else rp['trackId'],
                        'type': 'play',
                        'timestamp': rp.get('timestamp', datetime.utcnow())
                    })
        
        # Get likes/dislikes
        likes_collection = db['favorites']
        if user_id:
            user_likes = list(likes_collection.find({'userId': ObjectId(user_id)}, {'trackId': 1}).limit(100))
            for like in user_likes:
                interactions.append({
                    'userId': user_id,
                    'trackId': str(like['trackId']) if isinstance(like['trackId'], ObjectId) else like['trackId'],
                    'type': 'like',
                    'timestamp': datetime.utcnow()
                })
        
        return interactions
    except Exception as e:
        logger.error(f"Error retrieving user interactions from DB: {e}")
        return []

# Initialize the ML recommendation engine
engine = MLRecommendationEngine()

@app.route('/api/ml-recommendations/personalized', methods=['GET'])
def get_ml_personalized_recommendations():
    """
    Get ML-powered personalized recommendations
    Query parameters:
    - userId: User ID for personalization
    - currentTrackId: Current track ID for context-aware recommendations
    - limit: Number of recommendations (default 10)
    - location: User's location for location-based recommendations
    """
    try:
        user_id = request.args.get('userId')
        current_track_id = request.args.get('currentTrackId')
        limit = int(request.args.get('limit', 10))
        user_location = request.args.get('location')
        
        logger.info(f"Getting ML recommendations for user: {user_id}, track: {current_track_id}, limit: {limit}, location: {user_location}")
        
        # Load data if engine hasn't been initialized
        if engine.track_metadata is None:
            tracks = get_tracks_from_db(limit=500)
            interactions = get_user_interactions_from_db(user_id=user_id, limit=1000)
            engine.load_data(tracks, interactions)
        
        # Get recommendations
        recommendations = engine.get_personalized_recommendations(
            user_id=user_id,
            seed_track_id=current_track_id,
            user_location=user_location,
            n_recommendations=limit
        )
        
        # Get track details for the recommended track IDs
        track_details = []
        tracks_collection = db['tracks']
        
        for track_id in recommendations:
            track = tracks_collection.find_one({'_id': ObjectId(track_id)})
            if track:
                track['_id'] = str(track['_id'])
                if 'creatorId' in track and isinstance(track['creatorId'], ObjectId):
                    track['creatorId'] = str(track['creatorId'])
                track_details.append(track)
        
        return jsonify({
            'tracks': track_details,
            'count': len(track_details),
            'algorithm': 'ml_personalized'
        }), 200
    
    except Exception as e:
        logger.error(f"Error in get_ml_personalized_recommendations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml-recommendations/location-based', methods=['GET'])
def get_location_based_recommendations():
    """
    Get location-based recommendations
    Query parameters:
    - location: Target location for recommendations
    - limit: Number of recommendations (default 10)
    """
    try:
        location = request.args.get('location')
        limit = int(request.args.get('limit', 10))
        
        if not location:
            return jsonify({'error': 'Location parameter is required'}), 400
        
        logger.info(f"Getting location-based recommendations for: {location}, limit: {limit}")
        
        # Load data if engine hasn't been initialized
        if engine.track_metadata is None:
            tracks = get_tracks_from_db(limit=500)
            interactions = []
            engine.load_data(tracks, interactions)
        
        # Get location-based recommendations
        recommendations = engine.get_location_based_recommendations(
            user_location=location,
            n_recommendations=limit
        )
        
        # Get track details for the recommended track IDs
        track_details = []
        tracks_collection = db['tracks']
        
        for track_id in recommendations:
            track = tracks_collection.find_one({'_id': ObjectId(track_id)})
            if track:
                track['_id'] = str(track['_id'])
                if 'creatorId' in track and isinstance(track['creatorId'], ObjectId):
                    track['creatorId'] = str(track['creatorId'])
                track_details.append(track)
        
        return jsonify({
            'tracks': track_details,
            'count': len(track_details),
            'algorithm': 'location_based',
            'location': location
        }), 200
    
    except Exception as e:
        logger.error(f"Error in get_location_based_recommendations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml-recommendations/collaborative', methods=['GET'])
def get_collaborative_recommendations():
    """
    Get collaborative filtering recommendations
    Query parameters:
    - userId: User ID for personalization
    - limit: Number of recommendations (default 10)
    """
    try:
        user_id = request.args.get('userId')
        limit = int(request.args.get('limit', 10))
        
        if not user_id:
            return jsonify({'error': 'User ID parameter is required'}), 400
        
        logger.info(f"Getting collaborative recommendations for user: {user_id}, limit: {limit}")
        
        # Load data if engine hasn't been initialized
        if engine.track_metadata is None:
            tracks = get_tracks_from_db(limit=500)
            interactions = get_user_interactions_from_db(user_id=user_id, limit=1000)
            engine.load_data(tracks, interactions)
        
        # Get collaborative filtering recommendations
        recommendations = engine.get_collaborative_filtering_recommendations(
            user_id=user_id,
            n_recommendations=limit
        )
        
        # Get track details for the recommended track IDs
        track_details = []
        tracks_collection = db['tracks']
        
        for track_id in recommendations:
            track = tracks_collection.find_one({'_id': ObjectId(track_id)})
            if track:
                track['_id'] = str(track['_id'])
                if 'creatorId' in track and isinstance(track['creatorId'], ObjectId):
                    track['creatorId'] = str(track['creatorId'])
                track_details.append(track)
        
        return jsonify({
            'tracks': track_details,
            'count': len(track_details),
            'algorithm': 'collaborative_filtering',
            'userId': user_id
        }), 200
    
    except Exception as e:
        logger.error(f"Error in get_collaborative_recommendations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml-recommendations/content-based', methods=['GET'])
def get_content_based_recommendations():
    """
    Get content-based recommendations
    Query parameters:
    - seedTrackIds: Comma-separated track IDs for content-based recommendations
    - limit: Number of recommendations (default 10)
    """
    try:
        seed_track_ids_param = request.args.get('seedTrackIds')
        limit = int(request.args.get('limit', 10))
        
        if not seed_track_ids_param:
            return jsonify({'error': 'seedTrackIds parameter is required'}), 400
        
        seed_track_ids = [tid.strip() for tid in seed_track_ids_param.split(',')]
        
        logger.info(f"Getting content-based recommendations for tracks: {seed_track_ids}, limit: {limit}")
        
        # Load data if engine hasn't been initialized
        if engine.track_metadata is None:
            tracks = get_tracks_from_db(limit=500)
            interactions = []
            engine.load_data(tracks, interactions)
        
        # Get content-based recommendations
        recommendations = engine.get_content_based_recommendations(
            seed_track_ids=seed_track_ids,
            n_recommendations=limit
        )
        
        # Get track details for the recommended track IDs
        track_details = []
        tracks_collection = db['tracks']
        
        for track_id in recommendations:
            track = tracks_collection.find_one({'_id': ObjectId(track_id)})
            if track:
                track['_id'] = str(track['_id'])
                if 'creatorId' in track and isinstance(track['creatorId'], ObjectId):
                    track['creatorId'] = str(track['creatorId'])
                track_details.append(track)
        
        return jsonify({
            'tracks': track_details,
            'count': len(track_details),
            'algorithm': 'content_based',
            'seedTrackIds': seed_track_ids
        }), 200
    
    except Exception as e:
        logger.error(f"Error in get_content_based_recommendations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml-recommendations/train-model', methods=['POST'])
def train_model():
    """
    Train or retrain the ML model with fresh data
    """
    try:
        logger.info("Training ML model with fresh data")
        
        # Get fresh data from database
        tracks = get_tracks_from_db(limit=10000)  # Get more data for training
        interactions = get_user_interactions_from_db(limit=10000)
        
        # Reinitialize and train the engine
        global engine
        engine = MLRecommendationEngine()
        engine.load_data(tracks, interactions)
        
        # Optionally save the model
        try:
            engine.save_model('ml_recommendation_model.pkl')
            logger.info("Model saved successfully")
        except Exception as save_error:
            logger.warning(f"Could not save model: {save_error}")
        
        return jsonify({
            'message': 'Model trained successfully',
            'tracks_processed': len(tracks),
            'interactions_processed': len(interactions)
        }), 200
    
    except Exception as e:
        logger.error(f"Error in train_model: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'ml-recommendation-api'}), 200

if __name__ == '__main__':
    # Train the model on startup if possible
    try:
        # Try to load a saved model
        engine.load_model('ml_recommendation_model.pkl')
        logger.info("Loaded pre-trained model from disk")
    except FileNotFoundError:
        logger.info("No pre-trained model found, will load data on first request")
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        logger.info("Will load data on first request")
    
    app.run(debug=True, host='0.0.0.0', port=5001)