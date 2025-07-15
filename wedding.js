// הגדרות עם קטגוריות
const CATEGORIES = [
    { id: 'friends-rony', name: '👥 חברים רוני', emoji: '👥' },
    { id: 'friends-sarah', name: '👭 חברות שרה', emoji: '👭' },
    { id: 'family-rony', name: '👨‍👩‍👧‍👦 משפחה רוני', emoji: '👨‍👩‍👧‍👦' },
    { id: 'family-sarah', name: '👨‍👩‍👧‍👦 משפחה שרה', emoji: '👨‍👩‍👧‍👦' },
    { id: 'family-friends', name: '👨‍👩‍👧‍👦 חברים של המשפחה', emoji: '👨‍👩‍👧‍👦' }
];

let currentGuest = '';
let currentCategory = '';
let cameraStream = null;
let currentFacingMode = 'user';
let selectedFilter = 'all';

// פונקציות ניווט
function showPage(pageId) {
    document.querySelectorAll('.container > div').forEach(div => {
        div.classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
}

function goHome() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    showPage('mainPage');
}

function showPublicGallery() {
    showPage('publicGalleryPage');
    loadPublicGallery();
}

// התחלת מצלמה
async function startCamera() {
    const guestName = document.getElementById('guestName').value.trim();
    const categoryId = document.getElementById('categorySelect').value;
    
    if (!guestName) {
        alert('אנא הכנס את שמך');
        return;
    }

    if (!categoryId) {
        alert('אנא בחר קטגוריה');
        return;
    }

    currentGuest = guestName;
    currentCategory = categoryId;

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode }
        });

        const video = document.getElementById('video');
        video.srcObject = cameraStream;
        
        video.onloadedmetadata = () => {
            video.play();
        };
        
        showPage('cameraPage');
        updateCounter();
        
        const categoryName = CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
        showStatus(`📸 מוכן לצילום! קטגוריה: ${categoryName}`);
        
    } catch (error) {
        console.error('שגיאה במצלמה:', error);
        alert('לא ניתן לפתוח את המצלמה. ודא שנתת הרשאה.');
    }
}

// צילום תמונה
function capturePhoto() {
    if (!currentGuest || !currentCategory) {
        alert('שגיאה: אין שם אורח או קטגוריה');
        return;
    }

    const allPhotos = JSON.parse(localStorage.getItem('wedding-photos-by-category') || '{}');
    
    if (!allPhotos[currentCategory]) {
        allPhotos[currentCategory] = {};
    }
    if (!allPhotos[currentCategory][currentGuest]) {
        allPhotos[currentCategory][currentGuest] = [];
    }

    const myPhotos = allPhotos[currentCategory][currentGuest];
    if (myPhotos.length >= 15) {
        alert('הגעת למקסימום של 15 תמונות');
        return;
    }

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    
    if (!video.videoWidth) {
        alert('המצלמה לא מוכנה. המתן רגע ונסה שוב');
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    const photoData = {
        id: Date.now(),
        data: imageData,
        timestamp: new Date().toISOString(),
        guest: currentGuest,
        category: currentCategory,
        categoryName: CATEGORIES.find(c => c.id === currentCategory)?.name || currentCategory,
        timeDisplay: new Date().toLocaleString('he-IL')
    };

    allPhotos[currentCategory][currentGuest].push(photoData);
    localStorage.setItem('wedding-photos-by-category', JSON.stringify(allPhotos));

    updateCounter();
    
    const remaining = 15 - allPhotos[currentCategory][currentGuest].length;
    showStatus(`✅ תמונה נשמרה! נותרו ${remaining} תמונות`);
}

// עדכון מונה
function updateCounter() {
    const allPhotos = JSON.parse(localStorage.getItem('wedding-photos-by-category') || '{}');
    const myPhotos = allPhotos[currentCategory]?.[currentGuest] || [];
    const remaining = 15 - myPhotos.length;
    
    document.getElementById('remainingPhotos').textContent = remaining;
}

// טעינת גלריה
function loadPublicGallery() {
    const allPhotos = JSON.parse(localStorage.getItem('wedding-photos-by-category') || '{}');
    const galleryContent = document.getElementById('publicGalleryContent');

    if (Object.keys(allPhotos).length === 0) {
        galleryContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>🎉 ברוכים הבאים לגלריית החתונה!</h3>
                <p>אין תמונות עדיין. התמונות יופיעו כאן אחרי שהאורחים יתחילו לצלם.</p>
            </div>
        `;
        return;
    }

    let totalPhotos = 0;
    let totalGuests = 0;

    Object.keys(allPhotos).forEach(categoryId => {
        Object.keys(allPhotos[categoryId]).forEach(guestName => {
            const guestPhotos = allPhotos[categoryId][guestName] || [];
            totalPhotos += guestPhotos.length;
            if (guestPhotos.length > 0) totalGuests++;
        });
    });

    galleryContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: rgba(144, 183, 121, 0.3); border-radius: 20px;">
            <strong>גלריית החתונה</strong><br>
            <div style="margin: 10px 0; font-size: 24px;">
                🎉 ${totalPhotos} תמונות מ-${totalGuests} אורחים 🎉
            </div>
        </div>
    `;

    CATEGORIES.forEach(category => {
        const categoryPhotos = allPhotos[category.id];
        if (!categoryPhotos || Object.keys(categoryPhotos).length === 0) return;

        let categoryTotalPhotos = 0;
        Object.keys(categoryPhotos).forEach(guest => {
            categoryTotalPhotos += categoryPhotos[guest].length;
        });

        const categorySection = document.createElement('div');
        categorySection.className = 'guest-section';
        categorySection.setAttribute('data-category', category.id);
        
        categorySection.innerHTML = `<h3>${category.emoji} ${category.name} (${categoryTotalPhotos} תמונות)</h3>`;

        Object.keys(categoryPhotos).forEach(guestName => {
            const guestPhotos = categoryPhotos[guestName];
            if (guestPhotos.length === 0) return;

            const guestDiv = document.createElement('div');
            guestDiv.style.marginBottom = '25px';
            
            guestDiv.innerHTML = `<h4 style="color: #4A6741;">${guestName} (${guestPhotos.length} תמונות)</h4>`;
            
            const grid = document.createElement('div');
            grid.className = 'photos-grid';
            
            guestPhotos.forEach((photo, index) => {
                const photoDiv = document.createElement('div');
                photoDiv.className = 'photo-item';
                photoDiv.innerHTML = `
                    <img src="${photo.data}" alt="תמונה של ${guestName}" style="width: 100%; height: 150px; object-fit: cover;">
                    <div style="position: absolute; bottom: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; padding: 3px 8px; border-radius: 8px; font-size: 10px;">
                        ${index + 1}/${guestPhotos.length}
                    </div>
                `;
                grid.appendChild(photoDiv);
            });
            
            guestDiv.appendChild(grid);
            categorySection.appendChild(guestDiv);
        });
        
        galleryContent.appendChild(categorySection);
    });
}

// פונקציות נוספות
function flipCamera() {
    alert('החלפת מצלמה - פונקציה תתווסף');
}

function viewMyPhotos() {
    alert('התמונות שלי - פונקציה תתווסף');
}

function goBackToCamera() {
    showPage('cameraPage');
}

function filterGallery(categoryId) {
    selectedFilter = categoryId;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`filter-${categoryId}`).classList.add('active');

    const sections = document.querySelectorAll('[data-category]');
    sections.forEach(section => {
        if (categoryId === 'all' || section.getAttribute('data-category') === categoryId) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

function refreshPublicGallery() {
    loadPublicGallery();
}

function downloadAllPublicPhotos() {
    alert('הורדת תמונות - פונקציה תתווסף');
}

function showStatus(message) {
    const statusDiv = document.getElementById('photoStatus');
    if (statusDiv) {
        statusDiv.textContent = message;
    }
}

// התחלה
document.addEventListener('DOMContentLoaded', function() {
    showPage('mainPage');
});
