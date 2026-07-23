// ================= DATA (Your "Database") =================
const storiesData = [
  { id: 'you', username: 'You', avatar: 'images/users/you.jpg', type: 'add' },
  { id: 1, username: 'Alex', avatar: 'images/users/alex.jpg', status: 'online', media: 'images/stories/alex.jpg', type: 'image' },
  { id: 2, username: 'Sarah', avatar: 'images/users/sarah.jpg', status: 'online', media: 'images/stories/sarah.mp4', type: 'video' },
  { id: 3, username: 'John', avatar: 'images/users/john.jpg', status: 'away', media: 'images/stories/john.jpg', type: 'image' },
  { id: 4, username: 'Emma', avatar: 'images/users/emma.jpg', status: 'busy', media: 'images/stories/emma.jpg', type: 'image' }
];

const postsData = [
  { 
    id: 1, username: 'Joshua', avatar: 'images/users/joshua.jpg', location: 'Tokyo, Japan', 
    image: 'images/posts/post1.jpg', likes: 1245, caption: 'The game in Japan was amazing! 🌸', time: '2 hours ago' 
  },
  { 
    id: 2, username: 'Alex Rivera', avatar: 'images/users/alex.jpg', location: 'New York, USA', 
    image: 'images/posts/post2.jpg', likes: 892, caption: 'City lights and late nights ✨', time: '4 hours ago' 
  },
  { 
    id: 3, username: 'Sarah Chen', avatar: 'images/users/sarah.jpg', location: 'Paris, France', 
    image: 'images/posts/post3.jpg', likes: 2341, caption: 'Living my best life in Paris 🥐', time: '6 hours ago' 
  }
];

// ================= RENDER FUNCTIONS =================
function renderStories() {
  const container = document.getElementById('stories-container');
  container.innerHTML = storiesData.map(story => {
    if (story.type === 'add') {
      return `
        <div class="story">
          <div class="story-circle add-story">
            <div class="story-inner"><img src="${story.avatar}" alt="${story.username}"></div>
            <span class="add-badge"><i class="fa-solid fa-plus"></i></span>
          </div>
          <p>${story.username}</p>
        </div>`;
    }
    return `
      <div class="story" data-username="${story.username}" data-avatar="${story.avatar}" data-media="${story.media}" data-type="${story.type}">
        <div class="story-circle ${story.status}">
          <div class="story-inner"><img src="${story.avatar}" alt="${story.username}"></div>
          <span class="status-dot ${story.status}-status"></span>
        </div>
        <p>${story.username}</p>
      </div>`;
  }).join('');
}

function renderFeed() {
  const container = document.getElementById('feed-container');
  container.innerHTML = postsData.map(post => `
    <div class="post">
      <div class="post-header">
        <div class="profile">
          <div class="avatar"><img src="${post.avatar}" alt="${post.username}"></div>
          <div class="profile-info">
            <h4>${post.username}</h4>
            <p><i class="fa-solid fa-location-dot"></i> ${post.location}</p>
          </div>
        </div>
        <button class="post-menu"><i class="fa-solid fa-ellipsis"></i></button>
      </div>
      <div class="post-image"><img src="${post.image}" alt="Post"></div>
      <div class="post-actions">
        <div class="action-left">
          <button class="action-btn like-btn"><i class="fa-regular fa-heart"></i></button>
          <button class="action-btn"><i class="fa-regular fa-comment"></i></button>
          <button class="action-btn"><i class="fa-regular fa-paper-plane"></i></button>
        </div>
        <button class="action-btn bookmark-btn"><i class="fa-regular fa-bookmark"></i></button>
      </div>
      <div class="post-info">
        <p class="likes"><b>${post.likes.toLocaleString()} likes</b></p>
        <p class="caption"><b>${post.username}</b> ${post.caption}</p>
        <p class="timestamp">${post.time}</p>
      </div>
    </div>
  `).join('');
}

// ================= EVENT LISTENERS =================
document.addEventListener('DOMContentLoaded', () => {
  renderStories();
  renderFeed();

  // Story Viewer Logic (Event Delegation)
  document.getElementById('stories-container').addEventListener('click', (e) => {
    const storyEl = e.target.closest('.story');
    if (!storyEl || storyEl.querySelector('.add-story')) return;

    const username = storyEl.dataset.username;
    const avatar = storyEl.dataset.avatar;
    const media = storyEl.dataset.media;
    const type = storyEl.dataset.type;

    document.getElementById('viewerUsername').innerText = username;
    document.getElementById('viewerAvatar').src = avatar;
    
    const viewerMedia = document.getElementById('viewerMedia');
    viewerMedia.innerHTML = type === 'video' 
      ? `<video src="${media}" autoplay controls></video>` 
      : `<img src="${media}" alt="Story">`;

    document.getElementById('storyViewer').classList.add('active');
    
    // Progress bar animation
    const progress = document.getElementById('storyProgress');
    progress.style.transition = 'none'; progress.style.width = '0%';
    setTimeout(() => { progress.style.transition = 'width 5s linear'; progress.style.width = '100%'; }, 50);
  });

  // Close Story
  document.getElementById('closeStory').addEventListener('click', () => {
    document.getElementById('storyViewer').classList.remove('active');
    document.getElementById('viewerMedia').innerHTML = '';
  });

  // Like Button Toggle (Event Delegation)
  document.getElementById('feed-container').addEventListener('click', (e) => {
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
      const icon = likeBtn.querySelector('i');
      icon.classList.toggle('fa-regular');
      icon.classList.toggle('fa-solid');
      likeBtn.style.color = icon.classList.contains('fa-solid') ? '#ef4444' : 'var(--primary)';
    }
  });

  // Create Modal Toggle
  document.getElementById('openCreate').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('createModal').classList.add('active');
  });
  document.getElementById('closeCreate').addEventListener('click', () => {
    document.getElementById('createModal').classList.remove('active');
  });
});