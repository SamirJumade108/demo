const fs = require('fs');

function storeDataToFileStorage(inputString, inputObject, filePath) {
    try {

        // Check if the file exists
        if (fs.existsSync(filePath)) {
            // Read data from file
            const data = fs.readFileSync(filePath, 'utf8');

            // Parse the data
            let storedData;
            try {
                storedData = data ? JSON.parse(data) : {};
            } catch (error) {
                console.error('Error parsing stored data:', error);
                storedData = {};
            }

            // Update or add the new data
            if (inputString in storedData) {
                // If the input string already exists, update its associated object
                storedData[inputString] = inputObject;
            } else {
                // Otherwise, add the new entry
                storedData[inputString] = inputObject;
            }

            // Write the updated data back to the file
            fs.writeFileSync(filePath, JSON.stringify(storedData, null, 2));
        } else {
            // If the file doesn't exist, create a new one and store the data
            const newData = {
                [inputString]: inputObject
            };
            fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
        }
    } catch (e) {
        console.log(e);
    }
}

async function getObjectFromString(inputString, filePath) {
    try {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err); // Reject the promise with the error
                } else {
                    try {
                        const storedData = JSON.parse(data);
                        if (inputString in storedData) {
                            return resolve(storedData[inputString]);
                        } else {
                            console.log('Input string not found in the stored data.');
                            resolve(null); // Reject the promise with the parse error
                        }
                    } catch (parseError) {
                        reject(null); // Reject the promise with the parse error
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error reading or parsing file:', error);
        return null;
    }
}

module.exports = { storeDataToFileStorage, getObjectFromString };
