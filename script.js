const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit',async(e) => {
    e.preventDefault(); // stops the page from refreshing

    const formData = { // gather data from the text typed in the input boxes
        name: contactForm.name.value,
        email: contactForm.email.value,
        message: contactForm.message.value,
    };

    try {
        const response = await fetch('http://localhost:3000/send-message', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if(result.status === 'success') {
            alert('Message delivered.');
            contactForm.reset();
        } else {
            alert('Server error. Check Terminal');
        }
    } catch (err) {
        alert('Could not connect to server. Is "node server.js running?');
    }
});