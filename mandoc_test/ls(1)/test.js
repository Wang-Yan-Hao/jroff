const Jroff = require('../../dist/jroff.js');
const { exec } = require('child_process');
const fs = require('fs');

const mandocPath = './ls.1';

// Jroff

// Read the file as a string synchronously
try {
    const fileContent = fs.readFileSync(mandocPath, 'utf8');
    console.log(fileContent); // Print the file content as a string
} catch (err) {
    console.error(`Error reading file: ${err.message}`);
}

// Instantiate a new generator
var generator = new Jroff.HTMLGenerator();
// Generate the HTML output
var result = generator.generate(fileContent, 'doc');

// Function to write the result to
var outputPath = './jroff_ls.html';

// Write the result to b.html
fs.writeFile(outputPath, result, (writeError) => {
    if (writeError) {
    console.error(`Error writing to ${outputPath}: ${writeError.message}`);
    return;
    }
    console.log(`Successfully saved the result as ${outputPath}`);
});

// Mandoc
outputPath = './mandoc_ls.html';

// Execute mandoc command
exec(`mandoc ${mandocPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing mandoc: ${error.message}`);
      return;
    }
  
    if (stderr) {
      console.error(`Mandoc encountered an error: ${stderr}`);
      return;
    }
  
    // Write the output to apple.html
    fs.writeFile(outputPath, stdout, (writeError) => {
      if (writeError) {
        console.error(`Error writing to ${outputPath}: ${writeError.message}`);
        return;
      }
      console.log(`Successfully saved the result as ${outputPath}`);
    });
});

// Compare this two html, maybe using diff.js