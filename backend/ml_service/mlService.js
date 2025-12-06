const { spawn } = require('child_process');
const path = require('path');

exports.runPrediction = (diseaseType, features) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'predict.py');

    const python = spawn('python3', [
      scriptPath,
      diseaseType,
      ...features.map(String)
    ]);

    let resultData = '';
    let errorData = '';

    python.stdout.on('data', (data) => {
      resultData += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        return reject(errorData || `Python process exited with code ${code}`);
      }

      try {
        const parsed = JSON.parse(resultData);

        // If the model was not found, reject
        if (parsed.error && parsed.error.includes('Model not found')) {
          return reject(parsed.error);
        }

        resolve(parsed);
      } catch (err) {
        reject(`Invalid JSON from Python: ${err.message}`);
      }
    });
  });
};
