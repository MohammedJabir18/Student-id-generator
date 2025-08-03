// Progress bar animation
function updateProgress(percentage) {
    document.getElementById('progressBar').style.width = percentage + '%';
}

// Show custom modal with enhanced styling
function showMessage(message, type = 'info') {
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = `modal ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                type === 'error' ? 'fas fa-exclamation-circle' : 
                'fas fa-info-circle';
    
    modal.innerHTML = `
        <div class="text-3xl mb-4">
            <i class="${icon}"></i>
        </div>
        <p class="text-lg font-semibold">${message}</p>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    setTimeout(() => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }, 3000);
}

// Enhanced image upload handler
function handleImageUpload(event, targetElementId) {
    const file = event.target.files[0];
    if (file) {
        updateProgress(25);
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.getElementById(targetElementId);
            imgElement.src = e.target.result;
            updateProgress(50);
            
            // Add a subtle animation
            imgElement.style.transform = 'scale(0.8)';
            imgElement.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                imgElement.style.transform = 'scale(1)';
            }, 100);
            
            setTimeout(() => updateProgress(0), 1000);
            showMessage('Image uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Enhanced text update function
function updateCardText(inputId, cardElementId) {
    const inputElement = document.getElementById(inputId);
    const cardElement = document.getElementById(cardElementId);

    cardElement.textContent = inputElement.value;

    inputElement.addEventListener('input', () => {
        cardElement.textContent = inputElement.value;
        
        // Add subtle animation on text change
        cardElement.style.transform = 'scale(1.05)';
        cardElement.style.transition = 'transform 0.2s ease';
        setTimeout(() => {
            cardElement.style.transform = 'scale(1)';
        }, 200);
    });
}

// Update combined address and mobile
function updateCombinedAddressMobile() {
    const address = document.getElementById('addressInput').value;
    const mobile = document.getElementById('mobileInput').value;
    document.getElementById('cardAddressMobile').textContent = `Address: ${address} — Mobile: ${mobile}`;
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add entrance animations with delays
    const sections = document.querySelectorAll('.section-enter');
    sections.forEach((section, index) => {
        section.style.animationDelay = `${index * 0.2}s`;
    });

    // Image upload listeners
    document.getElementById('collegeLogoUpload').addEventListener('change', (e) => handleImageUpload(e, 'cardLogo'));
    document.getElementById('studentPhotoUpload').addEventListener('change', (e) => handleImageUpload(e, 'cardStudentPhoto'));
    document.getElementById('principalSignatureUpload').addEventListener('change', (e) => handleImageUpload(e, 'cardPrincipalSignature'));

    // Text field listeners
    updateCardText('collegeNameInput', 'cardCollegeName');
    updateCardText('nameInput', 'cardName');
    updateCardText('classInput', 'cardClass');
    updateCardText('rollNumberInput', 'cardRollNumber');
    updateCardText('dobInput', 'cardDob');
    updateCardText('yearInput', 'cardYear');
    
    // Address and mobile listeners
    updateCombinedAddressMobile();
    document.getElementById('addressInput').addEventListener('input', updateCombinedAddressMobile);
    document.getElementById('mobileInput').addEventListener('input', updateCombinedAddressMobile);

    // Add input focus effects
    const inputs = document.querySelectorAll('.input-enhanced');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.transform = 'translateY(-2px)';
        });
        input.addEventListener('blur', () => {
            input.style.transform = 'translateY(0)';
        });
    });
});

// Download functions
async function downloadAsPNG(canvas, studentName) {
    const pngUrl = canvas.toDataURL('image/png');
    const pngLink = document.createElement('a');
    pngLink.href = pngUrl;
    pngLink.download = `${studentName}_id_card.png`;
    document.body.appendChild(pngLink);
    pngLink.click();
    document.body.removeChild(pngLink);
}

async function downloadAsPDF(canvas, studentName) {
    const { jsPDF } = window.jspdf;
    const pdfWidth = 53.34;
    const pdfHeight = 86.36;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${studentName}_id_card.pdf`);
}

// Enhanced download functionality
document.getElementById('downloadCardButton').addEventListener('click', async () => {
    const card = document.getElementById('idCardPreview');
    const button = document.getElementById('downloadCardButton');
    
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
    button.disabled = true;

    const scaleFactor = 4;

    try {
        updateProgress(20);
        showMessage("Generating your professional ID card...", "info");

        const canvas = await html2canvas(card, {
            scale: scaleFactor,
            useCORS: true,
            logging: false,
            width: card.offsetWidth,
            height: card.offsetHeight,
            scrollX: -window.scrollX,
            scrollY: -window.scrollY,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight
        });
        updateProgress(60);

        const studentName = document.getElementById('nameInput').value.replace(/ /g, '_') || 'student';
        const format = document.querySelector('input[name="format"]:checked').value;

        if (format === 'png' || format === 'both') {
            await downloadAsPNG(canvas, studentName);
            updateProgress(80);
        }

        if (format === 'pdf' || format === 'both') {
            await downloadAsPDF(canvas, studentName);
            updateProgress(100);
        }
        
        setTimeout(() => {
            let successMessage = "🎉 ID card downloaded successfully!";
            if (format === 'png') successMessage = "🎉 PNG downloaded successfully!";
            if (format === 'pdf') successMessage = "🎉 PDF downloaded successfully!";
            if (format === 'both') successMessage = "🎉 PNG and PDF downloaded successfully!";
            
            showMessage(successMessage, "success");
            updateProgress(0);
        }, 500);

    } catch (error) {
        console.error("Error generating card:", error);
        showMessage("❌ Failed to generate card. Please try again.", "error");
        updateProgress(0);
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        document.getElementById('downloadCardButton').click();
    }
});

// Add smooth scrolling and other enhancements
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.animated-bg');
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});
