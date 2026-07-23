// 1. Your Data
const stories = [
  { name: 'Alex', avatar: 'images/users/alex.jpg', media: 'images/stories/alex.jpg' },
  { name: 'Sarah', avatar: 'images/users/sarah.jpg', media: 'images/stories/sarah.mp4' }
];

// 2. Render Stories
const container = document.getElementById('stories-container');
stories.forEach(story => {
  container.innerHTML += `
    <div class="story" onclick="openStory('${story.name}', '${story.avatar}', '${story.media}')">
      <div class="story-circle online">
        <div class="story-inner"><img src="${story.avatar}"></div>
      </div>
      <p>${story.name}</p>
    </div>`;
});

// 3. Open Story Function
function openStory(name, avatar, media) {
  document.getElementById('viewerUsername').innerText = name;
  document.getElementById('viewerAvatar').src = avatar;
  document.getElementById('viewerMedia').innerHTML = `<img src="${media}">`;
  document.getElementById('storyViewer').classList.add('active');
}