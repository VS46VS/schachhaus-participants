document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const statusMessage = document.getElementById('statusMessage');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            name: formData.get('name').trim(),
            club: formData.get('club').trim(),
            birthYear: formData.get('birthYear'),
            eloDwz: formData.get('eloDwz'),
            email: formData.get('email').trim(),
            privacy: formData.get('privacy')
        };
        
        if (!validateForm(data)) {
            return;
        }
        
        try {
            await submitRegistration(data);
            showMessage('Anmeldung erfolgreich gesendet! Sie erhalten eine Bestätigung per E-Mail.', 'success');
            form.reset();
        } catch (error) {
            console.error('Submission error:', error);
            showMessage('Fehler beim Senden der Anmeldung. Bitte versuchen Sie es erneut.', 'error');
        }
    });
    
    function validateForm(data) {
        if (!data.name || data.name.length < 2) {
            showMessage('Bitte geben Sie einen gültigen Namen ein.', 'error');
            return false;
        }
        
        if (!data.club || data.club.length < 2) {
            showMessage('Bitte geben Sie einen gültigen Vereinsnamen ein.', 'error');
            return false;
        }
        
        const currentYear = new Date().getFullYear();
        const birthYear = parseInt(data.birthYear);
        
        if (!birthYear || birthYear < 1920 || birthYear > currentYear) {
            showMessage('Bitte geben Sie ein gültiges Geburtsjahr ein.', 'error');
            return false;
        }
        
        if (!data.email || !isValidEmail(data.email)) {
            showMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
            return false;
        }
        
        if (!data.privacy) {
            showMessage('Bitte akzeptieren Sie die Datenschutzerklärung und AGB.', 'error');
            return false;
        }
        
        return true;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async function submitRegistration(data) {
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird gesendet...';
        
        try {
            const response = await fetch('http://128.140.110.152/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    club: data.club,
                    birthYear: parseInt(data.birthYear),
                    eloDwz: data.eloDwz ? parseInt(data.eloDwz) : null,
                    email: data.email || null
                })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Anmeldung senden';
        }
    }
    
    function showMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.classList.add('hidden');
            }, 5000);
        }
    }
});