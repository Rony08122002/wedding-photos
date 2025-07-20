// script.js – מעודכן לעברית ✨

const CLIENT_ID = "967885226703-ol8ovgfju4fo60ep51cr3qg1upnj885n.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const FOLDER_ID = "17IRliZOqbVC4THjKnc3TcwShvxnc9qi6";

let accessToken = "1//04hoyuKa91vfDCgYIARAAGAQSNwF-L9IrbLZnThS-qoZhSCTTFw_46R_lYVlIujZ8R1iaI2ErR9t6JsaMZbLUHN3BikJapGCOywA";

// מצלמה והעלאה
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture");
const uploadBtn = document.getElementById("upload");
const gallery = document.getElementById("gallery");

navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    alert("הגישה למצלמה נדחתה. בדוק הרשאות בדפדפן.");
  });

let imageBlob = null;
captureBtn.addEventListener("click", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  canvas.toBlob((blob) => {
    imageBlob = blob;
    uploadBtn.disabled = false;
  }, "image/jpeg");
});

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

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
    }),
    body: form,
  });

  if (res.ok) {
    alert("✨ התמונה הועלתה בהצלחה! תודה ששיתפת רגע מהאירוע שלנו.");
    uploadBtn.disabled = true;
    loadGallery();
  } else {
    alert("😔 ההעלאה נכשלה. נסה שוב או רענן את ההתחברות.");
  }
});

async function loadGallery() {
  gallery.innerHTML = "טוען גלריה...";
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${CLIENT_ID}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await res.json();
  gallery.innerHTML = "";
  if (data.files) {
    data.files.forEach(file => {
      const img = document.createElement("img");
      img.src = `https://drive.google.com/uc?id=${file.id}`;
      img.alt = file.name;
      gallery.appendChild(img);
    });
  } else {
    gallery.innerHTML = "לא נמצאו תמונות עדיין.";
  }
}

loadGallery();
