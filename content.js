let blockedUsers = [];

function hideBlockedPosts() {

  const posts = document.querySelectorAll('[data-testid="tweet"]');

  posts.forEach(post => {
    const userLink = post.querySelector('a[role="link"][href^="/"]');
    if (userLink) {
      const username = userLink.getAttribute('href').slice(1).split('/')[0];
      console.log('Checking post from user:', username);
      if (blockedUsers.includes('@' + username)) {
        post.style.display = 'none';
        console.log('Hidden post from blocked user:', username);
      }
    }
  });
}

function loadBlockedUsers() {
  chrome.storage.sync.get('blockedUsers', (data) => {
    blockedUsers = data.blockedUsers || [];
    hideBlockedPosts();
  });
}

loadBlockedUsers();

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      hideBlockedPosts();
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBlockedUsers') {
    console.log('Received updated blocked users:', request.blockedUsers);
    blockedUsers = request.blockedUsers;
    hideBlockedPosts();
    sendResponse({status: 'success'});
  }
  return true;
});