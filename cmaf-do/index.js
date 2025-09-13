const fs = require('fs/promises');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// --- Configuration ---
// The folder where the DASH files will be created.
const OUTPUT_FOLDER = 'output_dash';
// Desired duration of each video chunk in seconds.
const CHUNK_DURATION = 6;
// ---------------------

/**
 * Processes a single video file into CMAF-compliant DASH format using FFmpeg.
 * @param {string} inputPath The full path to the source video file.
 */
async function processVideo(inputPath) {
    const filename = path.basename(inputPath);
    // --- FIX: Resolve the input path to an absolute path before we change directory ---
    const absoluteInputPath = path.resolve(inputPath);
    console.log(`⚙️  Processing '${filename}' into CMAF-compliant DASH...`);

    // --- FIX: Store the original directory to return to it later ---
    const originalCwd = process.cwd();

    try {
        const videoNameWithoutExt = path.parse(filename).name;

        // Create a unique output directory for this video's DASH files.
        const outputDir = path.join(originalCwd, OUTPUT_FOLDER, videoNameWithoutExt);
        await fs.mkdir(outputDir, { recursive: true });

        // --- FIX: Change the script's working directory to the output folder ---
        process.chdir(outputDir);
        console.log(`   Temporarily changed working directory to: ${outputDir}`);

        // Now that we are in the correct folder, the output paths can be simple filenames.
        const manifestPath = 'manifest.mpd';
        const initSegName = 'init-$RepresentationID$.m4s';
        const mediaSegName = 'chunk-$RepresentationID$-$Number%05d$.m4s';
        
        // Use a Promise to handle the asynchronous nature of fluent-ffmpeg
        await new Promise((resolve, reject) => {
            // Use the absolute path for the input file, since our working directory has changed.
            ffmpeg(absoluteInputPath)
                .outputOptions([
                    '-map 0:v:0',      
                    '-map 0:a:0',      
                    '-c:v libx264',    
                    '-preset medium',
                    '-crf 23',
                    '-c:a aac',        
                    '-b:a 128k',       
                    `-seg_duration ${CHUNK_DURATION}`,
                    '-movflags cmaf',  
                    '-f dash',         
                    '-use_template 1',
                    '-use_timeline 0',
                    `-init_seg_name ${initSegName}`,
                    `-media_seg_name ${mediaSegName}`,
                ])
                .on('start', (commandLine) => {
                    console.log(`[FFmpeg] Spawned: ${commandLine}`);
                })
                .on('error', (err) => {
                    console.error(`❌ Error processing '${filename}'.`);
                    console.error(`   FFmpeg error: ${err.message}`);
                    reject(err);
                })
                .on('end', () => {
                    // The outputDir is now the current directory, so we resolve it for a clear log message.
                    console.log(`✅ Successfully processed '${filename}'.`);
                    console.log(`   CMAF/DASH files are located in: ${path.resolve(manifestPath, '..')}`);
                    resolve();
                })
                .save(manifestPath); 
        });

    } catch (error) {
        console.error(`An unexpected error occurred while processing ${filename}:`, error);
    } finally {
        // --- FIX: IMPORTANT - Always change back to the original directory ---
        process.chdir(originalCwd);
        console.log(`   Restored working directory to: ${originalCwd}`);
    }
}

/**
 * Main function to run the script. It now reads command-line arguments.
 */
async function main() {
    // Get command line arguments. 
    // process.argv[0] is node executable, process.argv[1] is the script file.
    // The actual arguments start at index 2.
    const inputPath = process.argv[2];

    if (!inputPath) {
        console.error("❌ Error: Please provide a path to a video file.");
        console.log("   Usage: node index.js <path/to/your/video.mp4>");
        return; // Exit the script
    }

    try {
        // Check if the file exists before trying to process it.
        await fs.access(inputPath);
        
        // The output folder will be created inside processVideo now.
        // We don't need to create it here anymore.

        // Start the video processing.
        await processVideo(inputPath);

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`❌ Error: The file does not exist at path: ${inputPath}`);
        } else {
            console.error("An unexpected error occurred:", error);
        }
    }
}

// Run the main function
main();

