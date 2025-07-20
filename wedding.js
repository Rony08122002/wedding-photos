// wedding.js – גרסה סופית לעברית 💍📸

const CLIENT_ID = "967885226703-ol8ovgfju4fo60ep51cr3qg1upnj885n.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const FOLDER_ID = "17IRliZOqbVC4THjKnc3TcwShvxnc9qi6";
let accessToken = "1//04hoyuKa91vfDCgYIARAAGAQSNwF-L9IrbLZnThS-qoZhSCTTFw_46R_lYVlIujZ8R1iaI2ErR9t6JsaMZbLUHN3BikJapGCOywA";

// בחירת אלמנטים
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture");
const uploadBtn = document.getElementById("upload");
const gallery = document.getElementById("gallery");

let imageBlob = null;

// הפעלת מצלמה
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    alert("📵 לא ניתן להפעיל את המצלמה. בדוק הרשאות בדפדפן.");
  });

// צילום תמונה מהווידאו
captureBtn.addEventListener("click", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  canvas.style.display = "block";

  canvas.toBlob((blob) => {
    imageBlob = blob;
    uploadBtn.disabled = false;
  }, "image/jpeg");
});

// העלאת תמונה ל-Google Drive
uploadBtn.addEventListener("click", async () => {
  if (!imageBlob) return;

  const metadata = {
    name: `wedding_${Date.now()}.jpg`,
    mimeType: "image/jpeg",
    parents: [FOLDER_ID],
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", imageBlob);

  gallery.innerHTML = "📤 מעלה תמונה...";

  try {
    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
      }),
      body: form,
    });

    if (res.ok) {
      alert("✅ התמונה הועלתה בהצלחה!");
      uploadBtn.disabled = true;
      loadGallery();
    } else {
      alert("❌ ההעלאה נכשלה. ודא שהתוקן עדיין בתוקף.");
    }
  } catch (error) {
    alert("⚠️ שגיאה כללית בהעלאה. נסה שוב.");
    console.error(error);
  }
});

// טעינת הגלריה
async function loadGallery() {
  gallery.innerHTML = "📁 טוען גלריה...";
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${CLIENT_ID}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    gallery.innerHTML = "";

    if (data.files && data.files.length > 0) {
      data.files.forEach(file => {
        const img = document.createElement("img");
        img.src = `https://drive.google.com/uc?id=${file.id}`;
        img.alt = file.name;
        gallery.appendChild(img);
      });
    } else {
      gallery.innerHTML = "📷 עדיין לא הועלו תמונות.";
    }
  } catch (error) {
    gallery.innerHTML = "🚫 שגיאה בטעינת הגלריה.";
    console.error(error);
  }
}

// טען את הגלריה כשנכנסים לדף
loadGallery();
