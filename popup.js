let blockedUsers = [];

function updateBlockedList() {
  const blockedList = document.getElementById('blockedList');
  blockedList.innerHTML = '';
  if (blockedUsers.length === 0) {
    blockedList.innerHTML = '<li class="text-gray-500 text-center">No blocked users yet</li>';
    return;
  }
  blockedUsers.forEach(user => {
    const li = document.createElement('li');
    li.className = 'flex justify-between items-center bg-gray-700 p-2 rounded-lg animate-fade-in';
    li.innerHTML = `
      <span class="font-medium">${user}</span>
      <button class="text-red-400 hover:text-red-300 transition duration-200" data-username="${user}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    blockedList.appendChild(li);
  });
}

function addBlockedUser(username) {
  const formattedUsername = username.startsWith('@') ? username : '@' + username;
  if (!blockedUsers.includes(formattedUsername)) {
    blockedUsers.push(formattedUsername);
    saveBlockedUsers();
  }
}

function removeBlockedUser(username) {
  blockedUsers = blockedUsers.filter(user => user !== username);
  saveBlockedUsers();
}

function saveBlockedUsers() {
  chrome.storage.sync.set({ blockedUsers }, () => {
    console.log('Saved blocked users:', blockedUsers);
    updateBlockedList();
    notifyContentScript();
  });
}

function notifyContentScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'updateBlockedUsers', blockedUsers }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError.message);
        }
      });
    }
  });
}

document.getElementById('blockForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById('username');
  const username = usernameInput.value.trim();
  if (username) {
    addBlockedUser(username);
    usernameInput.value = '';
    usernameInput.focus();
  }
});

document.getElementById('blockedList').addEventListener('click', (e) => {
  if (e.target.closest('button')) {
    const username = e.target.closest('button').getAttribute('data-username');
    removeBlockedUser(username);
  }
});

chrome.storage.sync.get('blockedUsers', (data) => {
  blockedUsers = data.blockedUsers || [];
  updateBlockedList();
});
