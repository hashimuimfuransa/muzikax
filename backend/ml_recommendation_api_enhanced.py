"""
Enhanced Flask API for ML-powered Recommendations
This module provides REST API endpoints to serve advanced ML-based music recommendations
optimized for massive data and scalable algorithms
"""

from flask import Flask, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml_recommendation_enhanced import AdvancedMLRecommendationEngine
import json
import pymongo
from bson import ObjectId
from datetime import datetime
import logging
from threading import Lock

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# MongoDB connection (you'll need to configure this based on your setup)
client = pymongo.MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client['muzikax_db']

# Global lock for thread safety
engine_lock = Lock()

class ObjectIdEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

def get_tracks_from_db(limit=10000, offset=0):
    """Retrieve tracks data from MongoDB with pagination for massive datasets"""
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
            'createdAt': 1,
            'type': 1
        }).skip(offset).limit(limit))
        
        # Convert ObjectId to string
        for track in tracks:
            track['_id'] = str(track['_id'])
            if 'creatorId' in track and isinstance(track['creatorId'], ObjectId):
                track['creatorId'] = str(track['creatorId'])
        
        return tracks
    except Exception as e:
        logger.error(f"Error retrieving tracks from DB: {e}")
        return []

def get_user_interactions_from_db(user_id=None, limit=10000, offset=0):
    """Retrieve user interactions data from MongoDB with pagination"""
    try:
        interactions = []
        
        # Get user's recently played tracks
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
            user_likes = list(likes_collection.find({'userId': ObjectId(user_id)}, {'trackId': 1, 'timestamp': 1}).limit(limit).skip(offset))
            for like in user_likes:
                interactions.append({
                    'userId': user_id,
                    'trackId': str(like['trackId']) if isinstance(like['trackId'], ObjectId) else like['trackId'],
                    'type': 'like',
                    'timestamp': like.get('timestamp', datetime.utcnow())
                })
        
        # Get comments and other interactions
        comments_collection = db['comments']
        if user_id:
            user_comments = list(comments_collection.find({'userId': ObjectId(user_id)}, {'trackId': 1, 'createdAt': 1}).limit(limit//2).skip(offset//2))
            for comment in user_comments:
                interactions.append({
                    'userId': user_id,
                    'trackId': str(comment['trackId']) if isinstance(comment['trackId'], ObjectId) else comment['trackId'],
                    'type': 'comment',
                    'timestamp': comment.get('createdAt', datetime.utcnow())
                })
        
        return interactions
    except Exception as e:
        logger.error(f"Error retrieving user interactions from DB: {e}")
        return []

def get_all_users(limit=1000):
    """Get a sample of users for model training"""
    try:
        users_collection = db['users']
        users = list(users_collection.find({}, {'_id': 1}).limit(limit))
        
        user_ids = [str(user['_id']) for user in users]
        return user_ids
    except Exception as e:
        logger.error(f"Error retrieving users from DB: {e}")
        return []

# Initialize the enhanced ML recommendation engine
engine = AdvancedMLRecommendationEngine(max_tracks_for_training=10000, cache_size=1000)
engine_initialized = False

# Global lock for thread safety
engine_lock = Lock()

@app.route('/api/ml-recommendations/personalized', methods=['GET'])
def get_ml_personalized_recommendations():
    """
    Get enhanced ML-powered personalized recommendations
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
        
        logger.info(f"Getting enhanced ML recommendations for user: {user_id}, track: {current_track_id}, limit: {limit}, location: {user_location}")
        
        # Acquire lock to ensure thread safety during engine initialization
        global engine_initialized
        with engine_lock:
            # Load data if engine hasn't been initialized
            if not engine_initialized:
                logger.info("Initializing recommendation engine with fresh data...")
                
                # Load tracks in batches to handle massive datasets
                batch_size = 5000
                offset = 0
                all_tracks = []
                all_interactions = []
                
                # Load tracks
                while True:
                    tracks_batch = get_tracks_from_db(limit=batch_size, offset=offset)
                    if not tracks_batch:
                        break
                    all_tracks.extend(tracks_batch)
                    offset += batch_size
                    
                    if len(all_tracks) >= engine.max_tracks_for_training:
                        break
                
                # Load interactions if user_id provided
                if user_id:
                    interactions_batch = get_user_interactions_from_db(user_id=user_id, limit=5000)
                    all_interactions.extend(interactions_batch)
                
                # Load some general interactions for model training
                general_users = get_all_users(limit=50)
                for gen_user_id in general_users:
                    gen_interactions = get_user_interactions_from_db(user_id=gen_user_id, limit=100)
                    all_interactions.extend(gen_interactions)
                
                # Load data incrementally
                engine.load_data_incrementally(all_tracks, all_interactions, batch_size=1000)
                
                # Train the models
                engine.train_models()
                
                engine_initialized = True
                logger.info(f"Engine initialized with {len(all_tracks)} tracks and {len(all_interactions)} interactions")
        
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
            'algorithm': 'enhanced_ml_personalized',
            'cache_hit_rate': f"{engine.get_performance_stats()['cache_hits'] / max(engine.get_performance_stats()['requests_served'], 1) * 100:.2f}%"
        }), 200

    except Exception as e:
        logger.error(f"Error in get_ml_personalized_recommendations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml-recommendations/location-based', methods=['GET'])
def get_location_based_recommendations():
    """
    Get location-based recommendations using enhanced ML
    Query parameters:
    - location: Target location for recommendations
    - limit: Number of recommendations (default 10)
    """
    try:
        location = request.args.get('location')
        limit = int(request.args.get('limit', 10))
        
        if not location:
            return jsonify({'error': 'Location parameter is required'}), 400
        
        logger.info(f"Getting enhanced location-based recommendations for: {location}, limit: {limit}")
        
        # Ensure engine is initialized
        global engine_initialized
        with engine_lock:
            if not engine_initialized:
                # Initialize with general data
                tracks = get_tracks_from_db(limit=5000)
                interactions = []
                engine.load_data_incrementally(tracks, interactions, batch_size=1000)
                engine.train_models()
                
                engine_initialized = True
        
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
            'algorithm': 'enhanced_location_based',
            'location': location,
            'cache_hit_rate': f"{engine.get_performance_stats()['cache_hits'] / max(engine.get_performance_stats()['requests_served'], 1) * 100:.2f}%"
        }), 200

    except Exception as e:
        logger.error(f"Error in get_location_based_recommendations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml-recommendations/collaborative', methods=['GET'])
def get_collaborative_recommendations():
    """
    Get collaborative filtering recommendations using enhanced ML
    Query parameters:
    - userId: User ID for personalization
    - limit: Number of recommendations (default 10)
    """
    try:
        user_id = request.args.get('userId')
        limit = int(request.args.get('limit', 10))
        
        if not user_id:
            return jsonify({'error': 'User ID parameter is required'}), 400
        
        logger.info(f"Getting enhanced collaborative recommendations for user: {user_id}, limit: {limit}")
        
        # Ensure engine is initialized
        global engine_initialized
        with engine_lock:
            if not engine_initialized:
                # Initialize with general data
                tracks = get_tracks_from_db(limit=5000)
                interactions = []
                engine.load_data_incrementally(tracks, interactions, batch_size=1000)
                engine.train_models()
                
                engine_initialized = True
        
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
            'algorithm': 'enhanced_collaborative_filtering',
            'userId': user_id,
            'cache_hit_rate': f"{engine.get_performance_stats()['cache_hits'] / max(engine.get_performance_stats()['requests_served'], 1) * 100:.2f}%"
        }), 200

    except Exception as e:
        logger.error(f"Error in get_collaborative_recommendations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml-recommendations/content-based', methods=['GET'])
def get_content_based_recommendations():
    """
    Get content-based recommendations using enhanced ML
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
        
        logger.info(f"Getting enhanced content-based recommendations for tracks: {seed_track_ids}, limit: {limit}")
        
        # Ensure engine is initialized
        global engine_initialized
        with engine_lock:
            if not engine_initialized:
                # Initialize with general data
                tracks = get_tracks_from_db(limit=5000)
                interactions = []
                engine.load_data_incrementally(tracks, interactions, batch_size=1000)
                engine.train_models()
                
                engine_initialized = True
        
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
            'algorithm': 'enhanced_content_based',
            'seedTrackIds': seed_track_ids,
            'cache_hit_rate': f"{engine.get_performance_stats()['cache_hits'] / max(engine.get_performance_stats()['requests_served'], 1) * 100:.2f}%"
        }), 200

    except Exception as e:
        logger.error(f"Error in get_content_based_recommendations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml-recommendations/train-model', methods=['POST'])
def train_model():
    """
    Train or retrain the enhanced ML model with fresh data
    """
    try:
        logger.info("Training enhanced ML model with fresh data")
        
        global engine_initialized
        with engine_lock:
            # Get fresh data from database in batches to handle massive datasets
            batch_size = 5000
            offset = 0
            all_tracks = []
            all_interactions = []
            
            # Load tracks
            while True:
                tracks_batch = get_tracks_from_db(limit=batch_size, offset=offset)
                if not tracks_batch:
                    break
                all_tracks.extend(tracks_batch)
                offset += batch_size
            
            # Load user interactions for some active users
            active_users = get_all_users(limit=100)
            for user_id in active_users:
                user_interactions = get_user_interactions_from_db(user_id=user_id, limit=500)
                all_interactions.extend(user_interactions)
            
            # Initialize and train the enhanced engine
            global engine
            engine = AdvancedMLRecommendationEngine(max_tracks_for_training=15000, cache_size=2000)
            engine.load_data_incrementally(all_tracks, all_interactions, batch_size=1000)
            engine.train_models()
            
            engine_initialized = True
            
            # Save the model
            try:
                engine.save_model('enhanced_ml_recommendation_model.pkl')
                logger.info("Enhanced model saved successfully")
            except Exception as save_error:
                logger.warning(f"Could not save enhanced model: {save_error}")
        
        return jsonify({
            'message': 'Enhanced model trained successfully',
            'tracks_processed': len(all_tracks),
            'interactions_processed': len(all_interactions),
            'algorithm': 'enhanced_ml_recommendation_engine'
        }), 200

    except Exception as e:
        logger.error(f"Error in train_model: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml-recommendations/performance-stats', methods=['GET'])
def get_performance_stats():
    """
    Get performance statistics for the ML recommendation engine
    """
    try:
        stats = engine.get_performance_stats()
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Error in get_performance_stats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'service': 'enhanced-ml-recommendation-api',
        'initialized': engine_initialized,
        'performance': engine.get_performance_stats() if engine_initialized else {}
    }), 200

if __name__ == '__main__':
    # Try to load a saved enhanced model on startup
    try:
        with engine_lock:
            engine.load_model('enhanced_ml_recommendation_model.pkl')
            engine_initialized = True
            logger.info("Loaded pre-trained enhanced model from disk")
    except FileNotFoundError:
        logger.info("No pre-trained enhanced model found, will load data on first request")
    except Exception as e:
        logger.error(f"Error loading enhanced model: {e}")
        logger.info("Will load data on first request")
    
    app.run(debug=True, host='0.0.0.0', port=5001)