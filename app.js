const express = require('express');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Promisify fs functions
const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

// Route to handle file creation
app.post('/create', async (req, res) => {
    const content = req.body.content || 'New File Found';
    const currentDate = new Date();
    const fileName = `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}_${String(currentDate.getHours()).padStart(2, '0')}-${String(currentDate.getMinutes()).padStart(2, '0')}-${currentDate.getSeconds()}-${currentDate.getMilliseconds()}.txt`;
    const directoryPath = path.join(__dirname, 'Files');
    const filePath = path.join(directoryPath, fileName);

    try {
        await mkdir(directoryPath, { recursive: true });
        await writeFile(filePath, content);
        res.redirect('/Files');
    } catch (err) {
        console.error('Error creating file:', err);
        res.status(500).send("We encountered an issue while creating the file. Please try again later.");
    }
});

// Route to handle file deletion
app.get('/delete/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const directoryPath = path.join(__dirname, 'Files');

    try {
        const files = await readdir(directoryPath);

        if (id < 0 || id >= files.length) {
            return res.status(404).send('File not found');
        }

        const filePath = path.join(directoryPath, files[id]);
        await unlink(filePath);

        res.send(`
            <html>
                <head>
                    <title>Redirecting...</title>
                    <script>
                        let countdown = 1; // Countdown starts at 1 second
                        const intervalId = setInterval(() => {
                            document.getElementById('countdown').innerText = countdown;
                            countdown--;

                            if (countdown < 0) {
                                clearInterval(intervalId);
                                window.location.href = '/Files';
                            }
                        }, 1000); // Update every second
                    </script>
                </head>
                <body>
                    <p>File with id ${id} has been deleted successfully.</p>
                    <p>Redirecting to the file list in <span id="countdown">1</span> seconds...</p>
                </body>
            </html>
        `);
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display file list
app.get('/Files', async (req, res) => {
    try {
        const directoryPath = path.join(__dirname, 'Files');
        const files = await readdir(directoryPath);
        const filesWithId = files.map((file, index) => ({ id: index, name: file }));
        res.render('files', { files: filesWithId });
    } 
    catch (err) {
        console.error('Error reading directory:', err);
        res.status(500).send("Something went wrong");
    }
});

// Route to view file content
app.get('/Files/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const directoryPath = path.join(__dirname, 'Files');

    try {
        const files = await readdir(directoryPath);

        if (id < 0 || id >= files.length) {
            return res.status(404).send('File not found');
        }

        const fileName = files[id];
        const filePath = path.join(directoryPath, fileName);

        const data = await fs.promises.readFile(filePath, 'utf8');
        res.render('viewFile', { content: data });
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to edit file content
app.get('/edit/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const directoryPath = path.join(__dirname, 'Files');

    try {
        const files = await readdir(directoryPath);

        if (id < 0 || id >= files.length) {
            return res.status(404).send('File not found');
        }

        const filePath = path.join(directoryPath, files[id]);
        const data = await fs.promises.readFile(filePath, 'utf8');
        res.render('edit', { id: id, content: data });
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to update file content
app.post('/update/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const directoryPath = path.join(__dirname, 'Files');
    const content = req.body.content;

    try {
        const files = await readdir(directoryPath);

        if (id < 0 || id >= files.length) {
            return res.status(404).send('File not found');
        }

        const filePath = path.join(directoryPath, files[id]);
        await fs.promises.writeFile(filePath, content);
        res.redirect('/Files');
    } catch (err) {
        console.error('Error updating file:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to serve static files
app.get('/public/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

app.get('/public/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

// Route for home page
app.get('/', async (req, res) => {
    try {
        const directoryPath = path.join(__dirname, 'views');
        const files = await readdir(directoryPath);
        res.render('index', { title: 'Home Page', message: 'Welcome to my website', files: files });
    } catch (err) {
        console.error('Error loading home page:', err);
        res.status(500).send("We encountered an issue while loading your data. Please try again later.");
    }
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
