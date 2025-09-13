import os
import subprocess
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- Configuration ---
# 1. The folder you will drop your source videos into.
SOURCE_FOLDER = "source_videos"
# 2. The folder where the DASH files will be created.
OUTPUT_FOLDER = "output_dash"
# 3. Desired duration of each video chunk in seconds.
CHUNK_DURATION = 6
# 4. Video extensions the script will look for.
SUPPORTED_EXTENSIONS = ('.mp4', '.mkv', '.mov', '.avi')
# ---------------------

class VideoHandler(FileSystemEventHandler):
    """A handler for file system events, specifically for new video files."""
    def on_created(self, event):
        """Called when a file or directory is created."""
        if not event.is_directory and event.src_path.lower().endswith(SUPPORTED_EXTENSIONS):
            print(f"✅ New video detected: {os.path.basename(event.src_path)}")
            # Wait a moment to ensure the file is fully copied before processing.
            time.sleep(2) 
            process_video(event.src_path)

def process_video(input_path):
    """
    Processes a single video file into CMAF-compliant DASH format using FFmpeg.
    """
    filename = os.path.basename(input_path)
    video_name_without_ext = os.path.splitext(filename)[0]
    
    # Create a unique output directory for this video's DASH files.
    output_dir = os.path.join(OUTPUT_FOLDER, video_name_without_ext)
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"⚙️  Processing '{filename}' into CMAF-compliant DASH...")
    
    # Correctly build the full path for all output files.
    init_seg_name = os.path.join(output_dir, 'init-$RepresentationID$.m4s')
    media_seg_name = os.path.join(output_dir, 'chunk-$RepresentationID$-$Number%05d$.m4s')
    manifest_path = os.path.join(output_dir, 'manifest.mpd')
    
    # Construct the FFmpeg command.
    command = [
        'ffmpeg',
        '-i', input_path,
        '-map', '0:v:0', '-map', '0:a:0', 
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', 
        '-c:a', 'aac', '-b:a', '128k', 
        '-seg_duration', str(CHUNK_DURATION),
        
        # --- Add this flag for CMAF compliance ---
        '-movflags', 'cmaf',
        # ------------------------------------------

        '-f', 'dash',
        '-use_template', '1',
        '-use_timeline', '0',
        '-init_seg_name', init_seg_name,
        '-media_seg_name', media_seg_name,
        manifest_path
    ]
    
    try:
        # Execute the command.
        subprocess.run(command, check=True)
        print(f"✅ Successfully processed '{filename}'.")
        print(f"   CMAF/DASH files are located in: {output_dir}")
    except subprocess.CalledProcessError:
        print(f"❌ Error processing '{filename}'.")
        print(f"   FFmpeg returned an error. Please check the console output above for details.")

if __name__ == "__main__":
    # Create source and output folders if they don't exist.
    os.makedirs(SOURCE_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    
    # Setup the watchdog observer to monitor the source folder.
    event_handler = VideoHandler()
    observer = Observer()
    observer.schedule(event_handler, SOURCE_FOLDER, recursive=False)
    
    print(f"🚀 Watchdog script started. Monitoring folder: '{SOURCE_FOLDER}'")
    print("Press Ctrl+C to stop.")
    
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
    print("\n🛑 Script stopped.")