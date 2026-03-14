const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const { promisify } = require("util");

const execPromise = promisify(exec);

/**
 * Process audio file into multiple formats and bitrates
 * @param {Buffer} fileBuffer - Original file buffer
 * @param {string} originalName - Original file name
 * @returns {Promise<Array<{buffer: Buffer, name: string, mimetype: string}>>}
 */
const processAudio = async (fileBuffer, originalName) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "muzikax-"));
  const inputExt = path.extname(originalName);
  const inputPath = path.join(tempDir, `input${inputExt}`);
  const baseName = path.parse(originalName).name.replace(/\s+/g, "-");

  try {
    // Write original buffer to temp file
    await fs.writeFile(inputPath, fileBuffer);

    const outputs = [
      { name: `${baseName}_96.ogg`, format: "libvorbis", bitrate: "96k", ext: ".ogg", mimetype: "audio/ogg" },
      { name: `${baseName}_160.ogg`, format: "libvorbis", bitrate: "160k", ext: ".ogg", mimetype: "audio/ogg" },
      { name: `${baseName}_320.ogg`, format: "libvorbis", bitrate: "320k", ext: ".ogg", mimetype: "audio/ogg" },
      { name: `${baseName}.m4a`, format: "aac", bitrate: "256k", ext: ".m4a", mimetype: "audio/mp4" },
    ];

    const processedFiles = [];

    for (const output of outputs) {
      const outputPath = path.join(tempDir, output.name);
      
      let ffmpegCmd = "";
      if (output.ext === ".ogg") {
        // Using -b:a for ogg bitrates instead of -qscale:a to be more precise for the user's requirements
        ffmpegCmd = `ffmpeg -i "${inputPath}" -c:a ${output.format} -b:a ${output.bitrate} "${outputPath}"`;
      } else {
        ffmpegCmd = `ffmpeg -i "${inputPath}" -c:a ${output.format} -b:a ${output.bitrate} "${outputPath}"`;
      }

      await execPromise(ffmpegCmd);
      const buffer = await fs.readFile(outputPath);
      processedFiles.push({
        buffer,
        name: output.name,
        mimetype: output.mimetype
      });
    }

    return processedFiles;
  } catch (error) {
    console.error("Error processing audio with FFmpeg:", error);
    throw error;
  } finally {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error("Error cleaning up temp files:", cleanupError);
    }
  }
};

module.exports = {
  processAudio
};
