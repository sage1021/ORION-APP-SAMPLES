// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, query, orderBy, onSnapshot, addDoc,
  updateDoc, doc, serverTimestamp, increment, where, getDocs, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD0e21P_9lIin0GB1VGdUHAN4ZrkeEMxPI",
  authDomain: "orion--project.firebaseapp.com",
  projectId: "orion--project",
  storageBucket: "orion--project.firebasestorage.app",
  messagingSenderId: "91554323371",
  appId: "1:91554323371:web:5b5ba0c66b6d767ed6d0ee",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ================= STATE =================
let currentUser = { name: "User", handle: "@user", avatar: "media/HIM.jpeg", uid: null };
let posts = [];
let activeFilter = "all";
let selectedCloudinaryUrl = "";
let activeCommentPostId = null;
let commentsUnsubscribe = null;

// ================= SPLASH SCREEN (Bulletproof) =================
window.addEventListener("load", () => {
  console.log("✅ Window loaded, starting splash screen timer...");
  const splashScreen = document.getElementById("splashScreen");
  if (splashScreen) {
    setTimeout(() => {
      console.log("✅ Fading out splash screen...");
      splashScreen.classList.add("fade-out");
      document.body.classList.remove("splash-lock");
      setTimeout(() => { 
        splashScreen.style.display = "none"; 
        console.log("✅ Splash screen removed.");
      }, 600); // Matches CSS transition time
    }, 1500);
  }
});

// ================= AUTH GUARD =================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("⚠️ No user found, redirecting to login...");
    window.location.replace("login.html");
    return;
  }
  
  console.log("✅ User authenticated:", user.uid);
  currentUser.uid = user.uid;
  
  try {
    // Clean, standard Firestore query
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      currentUser.name = data.name || "User";
      currentUser.handle = `@${data.name.toLowerCase().replace(/\s+/g, '')}`;
      currentUser.avatar = data.avatar || "media/HIM.jpeg";
    }
  } catch (err) { 
    console.error("❌ Error loading user:", err); 
  }

  // Update UI with real user data
  document.querySelectorAll(".compose-user img, .comment-form img").forEach(img => img.src = currentUser.avatar);
  document.querySelectorAll(".compose-user b").forEach(b => b.textContent = currentUser.name);
  document.querySelectorAll(".compose-user span").forEach(span => span.textContent = currentUser.handle);
  
  const composerPrompt = document.querySelector("#composerPrompt");
  if (composerPrompt) {
    composerPrompt.textContent = `What's happening in your orbit, ${currentUser.name}?`;
  }

  // Start listening to posts
  listenToPosts();
});

// ================= THEME TOGGLE =================
const themeToggle = document.getElementById("themeToggle");
const body = document.body;
const savedTheme = localStorage.getItem("orion-theme");

if (savedTheme === "dark") {
  body.classList.add("dark");
  themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggle?.addEventListener("click", () => {
  body.classList.toggle("dark");
  const isDark = body.classList.contains("dark");
  themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  localStorage.setItem("orion-theme", isDark ? "dark" : "light");
});

// ================= FIRESTORE: LISTEN TO POSTS =================
function listenToPosts() {
  console.log("📡 Listening to posts...");
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    posts = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    renderPosts();
  });
}

// ================= RENDERING =================
function formatCount(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 2000 ? 1 : 1)}k` : value;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function timeAgo(timestamp) {
  if (!timestamp) return "Just now";
  const ms = timestamp.seconds ? timestamp.seconds * 1000 : timestamp;
  const minutes = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function getVisiblePosts() {
  const searchQuery = document.querySelector("#searchInput")?.value.trim().toLowerCase() || "";
  return posts.filter((post) => {
    const matchesFilter = activeFilter === "all" || post.category === activeFilter;
    const searchable = `${post.userName || post.user} ${post.handle} ${post.text} ${(post.tags || []).join(" ")}`.toLowerCase();
    return matchesFilter && searchable.includes(searchQuery);
  });
}

function renderPosts() {
  const visible = getVisiblePosts();
  const resultCount = document.querySelector("#resultCount");
  const feedList = document.querySelector("#feedList");
  
  if (resultCount) {
    resultCount.textContent = `Showing ${visible.length} ${visible.length === 1 ? "post" : "posts"}`;
  }
  
  if (feedList) {
    feedList.innerHTML = visible.map((post) => `
      <article class="post" data-post-id="${post.id}">
        <div class="post-header">
          <div class="profile-line">
            <img class="avatar" src="${post.userAvatar || post.avatar}" alt="" />
            <div>
              <b>${escapeHtml(post.userName || post.user)}</b>
              <span>${escapeHtml(post.handle)} - ${timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
        ${post.imageUrl || post.image ? `<div class="media-frame"><img src="${post.imageUrl || post.image}" alt="" /></div>` : ""}
        <div class="post-actions">
          <div class="action-group">
            <button class="like-button ${post.liked ? "liked" : ""}" type="button" title="Like">
              <i class="${post.liked ? "fa-solid" : "fa-regular"} fa-heart"></i>
            </button>
            <button class="comment-button" type="button" title="Comment">
              <i class="fa-regular fa-comment"></i>
            </button>
            <button class="share-button" type="button" title="Share">
              <i class="fa-regular fa-paper-plane"></i>
            </button>
          </div>
          <button class="save-button ${post.saved ? "saved" : ""}" type="button" title="Save">
            <i class="${post.saved ? "fa-solid" : "fa-regular"} fa-bookmark"></i>
          </button>
        </div>
        <div class="post-copy">
          <b class="meta">${formatCount(post.likes || 0)} likes - ${formatCount(post.commentsCount || 0)} comments</b>
          <p><b>${escapeHtml(post.userName || post.user)}</b> ${escapeHtml(post.text)}</p>
          <div class="tag-row">${(post.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        </div>
      </article>
    `).join("");

    if (!visible.length) {
      feedList.innerHTML = '<article class="post"><div class="post-copy"><b>No matches yet</b><p>Try a different search or feed filter.</p></div></article>';
    }
  }
}

// ================= COMPOSER MODAL =================
const composerModal = document.querySelector("#composerModal");
const postText = document.querySelector("#postText");
const postMedia = document.querySelector("#postMedia");
const mediaFileName = document.querySelector("#mediaFileName");
const mediaPreview = document.querySelector("#mediaPreview");
const publishPost = document.querySelector("#publishPost");

function openComposer(e) {
  if (e) e.preventDefault();
  composerModal.classList.add("open");
  composerModal.setAttribute("aria-hidden", "false");
  postText.focus();
}

function resetComposer() {
  postText.value = "";
  postMedia.value = "";
  selectedCloudinaryUrl = "";
  mediaFileName.textContent = "No image selected";
  mediaPreview.hidden = true;
  mediaPreview.innerHTML = "";
  updatePublishState();
}

function closeComposerModal() {
  composerModal.classList.remove("open");
  composerModal.setAttribute("aria-hidden", "true");
  resetComposer();
}

function updatePublishState() {
  if (publishPost) {
    publishPost.disabled = !postText.value.trim() && !selectedCloudinaryUrl;
  }
}

document.querySelector("#openComposer")?.addEventListener("click", openComposer);
document.querySelector("#mobileComposer")?.addEventListener("click", openComposer);
document.querySelector("#composerPrompt")?.addEventListener("click", openComposer);
document.querySelector("#closeComposer")?.addEventListener("click", closeComposerModal);
composerModal?.addEventListener("click", (e) => { if (e.target === composerModal) closeComposerModal(); });
postText?.addEventListener("input", updatePublishState);

// Image Upload to Cloudinary
postMedia?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const localUrl = URL.createObjectURL(file);
  mediaFileName.textContent = file.name;
  mediaPreview.innerHTML = `<img src="${localUrl}" alt="Preview" />`;
  mediaPreview.hidden = false;
  updatePublishState();

  if (publishPost) {
    publishPost.textContent = "Uploading...";
    publishPost.disabled = true;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ORION_UPLOADS");

  try {
    const response = await fetch("https://api.cloudinary.com/v1_1/azgfmicp/auto/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data.secure_url) {
      selectedCloudinaryUrl = data.secure_url;
      updatePublishState();
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Image upload failed. Please try again.");
    selectedCloudinaryUrl = "";
    mediaPreview.hidden = true;
    mediaFileName.textContent = "No image selected";
  } finally {
    if (publishPost) {
      publishPost.textContent = "Post";
      updatePublishState();
    }
  }
});

document.querySelectorAll("[data-quick]").forEach((button) => {
  button.addEventListener("click", () => {
    postText.value = button.dataset.quick;
    updatePublishState();
    postText.focus();
  });
});

publishPost?.addEventListener("click", async () => {
  const text = postText.value.trim();
  if (!text && !selectedCloudinaryUrl) return;

  publishPost.disabled = true;
  publishPost.textContent = "Posting...";

  try {
    await addDoc(collection(db, "posts"), {
      userId: currentUser.uid,
      userName: currentUser.name,
      handle: currentUser.handle,
      userAvatar: currentUser.avatar,
      text: text,
      imageUrl: selectedCloudinaryUrl,
      likes: 0,
      commentsCount: 0,
      category: activeFilter === "all" ? "art" : activeFilter,
      tags: ["#ORION"],
      createdAt: serverTimestamp(),
    });
    closeComposerModal();
    document.querySelector("#feed")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error("Error posting:", error);
    alert("Failed to create post.");
  } finally {
    publishPost.textContent = "Post";
    publishPost.disabled = false;
  }
});

// ================= FEED INTERACTIONS =================
document.querySelector("#feedList")?.addEventListener("click", async (event) => {
  const article = event.target.closest(".post");
  if (!article) return;
  const postId = article.dataset.postId;
  const post = posts.find((p) => String(p.id) === postId);
  if (!post) return;

  if (event.target.closest(".like-button")) {
    const btn = event.target.closest(".like-button");
    const isLiked = btn.classList.contains("liked");
    const change = isLiked ? -1 : 1;
    
    btn.classList.toggle("liked");
    btn.querySelector("i").classList.toggle("fa-solid");
    btn.querySelector("i").classList.toggle("fa-regular");
    
    await updateDoc(doc(db, "posts", postId), { likes: increment(change) });
    return;
  }

  if (event.target.closest(".save-button")) {
    const btn = event.target.closest(".save-button");
    const isSaved = btn.classList.contains("saved");
    btn.classList.toggle("saved");
    btn.querySelector("i").classList.toggle("fa-solid");
    btn.querySelector("i").classList.toggle("fa-regular");
    return;
  }

  if (event.target.closest(".comment-button")) {
    openComments(post);
    return;
  }

  if (event.target.closest(".share-button")) {
    const shareText = `${post.userName || post.user} on ORION: ${post.text}`;
    if (navigator.share) {
      await navigator.share({ title: "ORION", text: shareText, url: location.href });
    } else {
      await navigator.clipboard?.writeText(shareText);
      alert("Post text copied to clipboard.");
    }
  }
});

// ================= COMMENTS MODAL =================
const commentsModal = document.querySelector("#commentsModal");
const commentsList = document.querySelector("#commentsList");
const commentForm = document.querySelector("#commentForm");
const commentInput = document.querySelector("#commentInput");

function openComments(post) {
  activeCommentPostId = post.id;
  commentsModal.classList.add("open");
  commentsModal.setAttribute("aria-hidden", "false");
  listenToComments(post.id);
  commentInput.focus();
}

function listenToComments(postId) {
  if (commentsUnsubscribe) commentsUnsubscribe();
  commentsList.innerHTML = '<div class="comment-bubble"><p>Loading comments...</p></div>';
  
  const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "asc"));
  commentsUnsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      commentsList.innerHTML = '<div class="comment-bubble"><b>No comments yet</b><p>Start the conversation.</p></div>';
      return;
    }
    commentsList.innerHTML = snapshot.docs.map(docSnap => {
      const c = docSnap.data();
      return `
        <div class="comment-item">
          <img src="${c.userAvatar}" alt="" />
          <div class="comment-bubble">
            <b>${escapeHtml(c.userName)}</b>
            <p>${escapeHtml(c.text)}</p>
          </div>
        </div>
      `;
    }).join("");
    commentsList.scrollTop = commentsList.scrollHeight;
  });
}

document.querySelector("#closeComments")?.addEventListener("click", () => {
  commentsModal.classList.remove("open");
  commentsModal.setAttribute("aria-hidden", "true");
  activeCommentPostId = null;
  if (commentsUnsubscribe) commentsUnsubscribe();
});

commentsModal?.addEventListener("click", (event) => {
  if (event.target === commentsModal) {
    commentsModal.classList.remove("open");
    commentsModal.setAttribute("aria-hidden", "true");
    activeCommentPostId = null;
    if (commentsUnsubscribe) commentsUnsubscribe();
  }
});

commentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = commentInput.value.trim();
  if (!text || !activeCommentPostId) return;

  commentInput.value = "";
  commentInput.disabled = true;

  try {
    await addDoc(collection(db, "comments"), {
      postId: activeCommentPostId,
      userId: currentUser.uid,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: text,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "posts", activeCommentPostId), { commentsCount: increment(1) });
  } catch (err) {
    console.error("Error posting comment:", err);
  } finally {
    commentInput.disabled = false;
    commentInput.focus();
  }
});

// ================= TABS & SEARCH =================
document.querySelectorAll(".tabs button").forEach((tab) => {
  tab.addEventListener("click", () => {
    activeFilter = tab.dataset.filter;
    document.querySelectorAll(".tabs button").forEach((item) => item.classList.toggle("active", item === tab));
    renderPosts();
  });
});

document.querySelector("#searchInput")?.addEventListener("input", renderPosts);