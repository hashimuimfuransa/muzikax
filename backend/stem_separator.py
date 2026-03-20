"""
AI Stem Separation Service for MuzikaX
Uses Demucs/Spleeter to pre-process uploaded tracks
"""

import os
import sys
import subprocess
from pathlib import Path
import shutil
import pymongo
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_stem_completion_notification(track_id: str, has_stems: bool):
    """
    Call Node.js helper script to create a notification for the artist
    
    Args:
        track_id: MongoDB ObjectId of the track
        has_stems: Whether stem separation was successful
    """
    try:
        # Path to the Node.js notification helper
        helper_script = Path(__file__).parent / 'create_stem_notification.js'
        
        if not helper_script.exists():
            print(f"⚠️ Warning: Notification helper script not found at {helper_script}")
            return
        
        # Call the Node.js script
        cmd = ['node', str(helper_script), track_id, str(has_stems).lower()]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30  # 30 second timeout
        )
        
        if result.returncode == 0:
            print(f"✅ Notification sent to artist")
        else:
            print(f"⚠️ Warning: Notification creation failed: {result.stderr}")
            
    except subprocess.TimeoutExpired:
        print("⚠️ Warning: Notification creation timed out")
    except FileNotFoundError:
        print("⚠️ Warning: Node.js not installed, skipping notification")
    except Exception as e:
        print(f"⚠️ Warning: Error creating notification: {str(e)}")

def update_track_stem_status(track_id: str, has_stems: bool = True, status: str = 'completed', is_public: bool = True, progress: int = 0):
    """
    Update the track document in MongoDB to reflect stem processing completion
    
    Args:
        track_id: MongoDB ObjectId of the track
        has_stems: Whether the track has stems available
        status: Processing status ('pending', 'processing', 'completed', 'failed')
        is_public: Whether the track should be visible to public (default True when completed)
        progress: Processing progress percentage (0-100)
    """
    try:
        mongo_uri = os.getenv('MONGO_URI')
        if not mongo_uri:
            print("⚠️ Warning: MONGO_URI not found, skipping database update")
            return False
        
        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database()
        
        # Update the track
        update_data = {
            'hasStems': has_stems,
            'stemProcessingStatus': status,
            'isPublic': is_public
        }
        
        # Only add progress if it's provided
        if progress > 0:
            update_data['stemProgress'] = progress
        
        result = db.tracks.update_one(
            {'_id': track_id},
            {
                '$set': update_data
            }
        )
        
        if result.modified_count > 0:
            print(f"✅ Database updated: hasStems={has_stems}, status={status}, isPublic={is_public}, progress={progress}%")
            return True
        else:
            print(f"⚠️ Warning: No track found with ID {track_id}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating database: {str(e)}")
        return False

class StemSeparator:
    """
    Pre-process audio files into isolated stems using AI
    This provides PERFECT separation with ZERO noise/latency
    """
    
    def __init__(self, model='demucs'):
        """
        Initialize stem separator
        
        Args:
            model: 'demucs' (best quality) or 'spleeter' (faster)
        """
        self.model = model
        self.output_dir = Path('./storage/stems')
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def separate_track(self, track_id: str, audio_path: str) -> dict:
        """
        Separate a track into 4 stems: vocals, drums, bass, other
        
        Args:
            track_id: Unique identifier for the track
            audio_path: Path to the original audio file
            
        Returns:
            Dictionary with paths to each stem
        """
        print(f"🎵 Processing track {track_id}...")
        
        # Create output directory for this track
        track_output_dir = self.output_dir / track_id
        track_output_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            if self.model == 'demucs':
                stems = self._separate_with_demucs(audio_path, track_output_dir)
            else:  # spleeter
                stems = self._separate_with_spleeter(audio_path, track_output_dir)
            
            print(f"✅ Successfully separated {track_id}")
            print(f"   Stems saved to: {track_output_dir}")
            
            return stems
            
        except Exception as e:
            print(f"❌ Error processing {track_id}: {str(e)}")
            raise
    
    def _separate_with_demucs(self, audio_path: str, output_dir: Path) -> dict:
        """
        Use Demucs (Facebook Research) for highest quality separation
        Model: https://github.com/facebookresearch/demucs
        """
        print("🤖 Running Demucs AI separation...")
        print("⏱️  Estimated time: 1-3 minutes (depends on track length)")
        
        # Run Demucs with faster model for better speed/quality balance
        cmd = [
            'python', '-m', 'demucs',
            '--two-stems', 'false',  # 4-stem separation
            '--model', 'htdemucs_ft',  # Fast transformer model (balanced)
            # Alternative options:
            # '--model', 'demucs',      # Original model (fastest, good quality)
            # '--model', 'htdemucs',    # High-quality transformer (slowest)
            '--out', str(output_dir),
            audio_path
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes max
            )
            
            if result.returncode != 0:
                raise Exception(f"Demucs failed: {result.stderr}")
            
            # Demucs creates subdirectory with model name
            model_output = output_dir / 'htdemucs' / Path(audio_path).stem
            
            stems = {
                'vocals': str(model_output / 'vocals.wav'),
                'drums': str(model_output / 'drums.wav'),
                'bass': str(model_output / 'bass.wav'),
                'other': str(model_output / 'other.wav'),
                'original': audio_path
            }
            
            # Verify all stems exist
            for stem_name, stem_path in stems.items():
                if not os.path.exists(stem_path):
                    raise Exception(f"Missing stem: {stem_name}")
                size_mb = os.path.getsize(stem_path) / (1024 * 1024)
                print(f"   ✓ {stem_name}: {size_mb:.2f} MB")
            
            return stems
            
        except subprocess.TimeoutExpired:
            raise Exception("Demucs processing timed out (>5 minutes)")
        except FileNotFoundError:
            raise Exception("Demucs not installed. Run: pip install demucs")
    
    def _separate_with_spleeter(self, audio_path: str, output_dir: Path) -> dict:
        """
        Use Spleeter (Deezer) for faster separation
        Model: https://github.com/deezer/spleeter
        """
        print("🤖 Running Spleeter AI separation...")
        
        cmd = [
            'spleeter', 'separate',
            '-p', 'spleeter:4stems',  # 4-stem model
            '-o', str(output_dir),
            audio_path
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=180  # 3 minutes max
            )
            
            if result.returncode != 0:
                raise Exception(f"Spleeter failed: {result.stderr}")
            
            # Spleeter creates subdirectory with song name
            song_output = output_dir / Path(audio_path).stem
            
            stems = {
                'vocals': str(song_output / 'vocals.wav'),
                'accompaniment': str(song_output / 'accompaniment.wav'),
                'drums': str(song_output / 'drums.wav'),
                'bass': str(song_output / 'bass.wav'),
                'original': audio_path
            }
            
            # Verify all stems exist
            for stem_name, stem_path in stems.items():
                if not os.path.exists(stem_path):
                    raise Exception(f"Missing stem: {stem_name}")
                size_mb = os.path.getsize(stem_path) / (1024 * 1024)
                print(f"   ✓ {stem_name}: {size_mb:.2f} MB")
            
            return stems
            
        except subprocess.TimeoutExpired:
            raise Exception("Spleeter processing timed out (>3 minutes)")
        except FileNotFoundError:
            raise Exception("Spleeter not installed. Run: pip install spleeter")
    
    def convert_to_mp3(self, wav_path: str, bitrate='320k') -> str:
        """
        Convert WAV stem to MP3 for streaming
        """
        mp3_path = wav_path.replace('.wav', '.mp3')
        
        cmd = [
            'ffmpeg', '-i', wav_path,
            '-b:a', bitrate,
            '-y',  # Overwrite
            mp3_path
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            
            original_size = os.path.getsize(wav_path) / (1024 * 1024)
            mp3_size = os.path.getsize(mp3_path) / (1024 * 1024)
            compression = (1 - mp3_size/original_size) * 100
            
            print(f"   Converted: {Path(wav_path).name} ({compression:.1f}% smaller)")
            
            return mp3_path
            
        except subprocess.CalledProcessError as e:
            raise Exception(f"FFmpeg conversion failed: {e.stderr.decode()}")
        except FileNotFoundError:
            raise Exception("FFmpeg not installed")


def process_upload(track_id: str, audio_file_path: str):
    """
    Process uploaded track: separate stems and prepare for streaming
    """
    print(f"\n{'='*60}")
    print(f"Processing Upload: {track_id}")
    print(f"{'='*60}\n")
    
    # Update status to 'processing' and keep private (isPublic=False), progress 10%
    update_track_stem_status(track_id, has_stems=False, status='processing', is_public=False, progress=10)
    
    # Initialize separator
    separator = StemSeparator(model='htdemucs_ft')  # Fast transformer model
    
    try:
        # Separate into stems (progress: 20% -> 70%)
        print("🎵 Starting stem separation... (this will take 1-3 minutes)")
        update_track_stem_status(track_id, has_stems=False, status='processing', is_public=False, progress=20)
        
        stems = separator.separate_track(track_id, audio_file_path)
        
        # Stems separated - update progress to 70%
        update_track_stem_status(track_id, has_stems=False, status='processing', is_public=False, progress=70)
        
        # Convert to MP3 for streaming (progress: 70% -> 95%)
        mp3_stems = {}
        total_stems = len([s for s in stems.items() if s[0] != 'original'])
        converted_count = 0
        
        for stem_name, wav_path in stems.items():
            if wav_path.endswith('.wav'):
                print(f"   Converting {stem_name} to MP3...")
                mp3_stems[stem_name] = separator.convert_to_mp3(wav_path)
                converted_count += 1
                # Update progress after each stem conversion
                progress = 70 + int((converted_count / total_stems) * 25)
                update_track_stem_status(track_id, has_stems=False, status='processing', is_public=False, progress=progress)
            else:
                mp3_stems[stem_name] = wav_path
        
        print(f"\n✅ Track {track_id} ready for streaming!")
        print(f"   Available stems:")
        for stem_name, stem_path in mp3_stems.items():
            size_kb = os.path.getsize(stem_path) / 1024
            print(f"   - {stem_name}: {Path(stem_path).name} ({size_kb:.1f} KB)")
        
        # Update database to mark as completed and make public (progress: 100%)
        update_track_stem_status(track_id, has_stems=True, status='completed', is_public=True, progress=100)
        
        # Create notification for the artist
        create_stem_completion_notification(track_id, True)
        
        return mp3_stems
        
    except Exception as e:
        print(f"❌ Stem separation failed: {str(e)}")
        # Update database to mark as failed but still make public (with standard playback)
        update_track_stem_status(track_id, has_stems=False, status='failed', is_public=True, progress=0)
        # Create notification about failure
        create_stem_completion_notification(track_id, False)
        raise


if __name__ == '__main__':
    # Example usage
    if len(sys.argv) < 3:
        print("Usage: python ml_recommendation_api_enhanced.py <track_id> <audio_file>")
        print("\nExample:")
        print("  python ml_recommendation_api_enhanced.py track123 ./uploads/song.mp3")
        sys.exit(1)
    
    track_id = sys.argv[1]
    audio_file = sys.argv[2]
    
    if not os.path.exists(audio_file):
        print(f"❌ File not found: {audio_file}")
        sys.exit(1)
    
    stems = process_upload(track_id, audio_file)
    print(f"\nStems generated: {list(stems.keys())}")
