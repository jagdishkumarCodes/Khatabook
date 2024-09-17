document.addEventListener('DOMContentLoaded', async function () {
    // Select the buttons and input fields
    const submitButton = document.querySelector('.btn');
    const fileDescription = document.querySelector('.fileDescription');
    const submitNewFileButton = document.querySelector('.New-button');

    // Handle form submission with Ctrl + Enter
    if (submitButton) {
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey && event.key === 'Enter') {
                if (fileDescription && fileDescription.value.trim() === '') {
                    alert('Please enter a file description');
                } else {
                    submitButton.click(); // Trigger the button click
                }
            }
        });
    } else {
        console.error('Submit button not found');
    }

    // Redirect to home page on new file button click
    if (submitNewFileButton) {
        submitNewFileButton.addEventListener('click', function () {
            window.location.href = '/';
        });
    } else {
        console.error('Submit new file button not found');
    }

    // Fetch file content
    async function getFileContent(fileId) {
        try {
            const response = await fetch(`/Files/${fileId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            const fileContentDiv = document.getElementById('file-content');
            if (fileContentDiv) {
                fileContentDiv.innerText = data; // Display file content
            } else {
                console.error('File content div not found');
            }
        } catch (err) {
            console.error('Error fetching file content:', err);
        }
    }

    // Add event listeners to view and edit buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    const editButtons = document.querySelectorAll('.edit-btn');

    viewButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const fileId = button.getAttribute('data-id');
            await getFileContent(fileId);
        });
    });

    editButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const fileId = button.getAttribute('data-id');
            await getFileContent(fileId);
        });
    });

    // Function to delete a file
    async function deleteFile(fileId) {
        try {
            const response = await fetch(`/Files/${fileId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            console.log(`File ${fileId} deleted successfully`);
            // Remove the file from the list
            const fileElement = document.querySelector(`[data-file-id="${fileId}"]`);
            if (fileElement) {
                fileElement.parentNode.removeChild(fileElement);
            } else {
                console.error(`File element with id ${fileId} not found`);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const fileId = button.getAttribute('data-id');
            await deleteFile(fileId);
        });
    });
});
