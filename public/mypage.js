let loadedFeeds = []; // 피드 데이터

// 모달 요소 가져오기
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');

// 모달 닫기 버튼 설정
const closeModal = document.getElementById('closeModal');
closeModal.onclick = function() {
    modal.style.display = 'none';
}

// 댓글 모달 요소 가져오기
const commentModal = document.getElementById('commentModal');
const closeCommentModal = document.getElementById('closeCommentModal');
const commentList = document.getElementById('commentList');
const newComment = document.getElementById('newComment');
const submitComment = document.getElementById('submitComment');

// 현재 선택된 피드 ID 저장 변수
let currentFeedId = null;

// '댓글' 버튼 클릭 시 호출되는 함수
function openCommentModal(feedId) {
  currentFeedId = feedId;
  loadComments(feedId);
  commentModal.classList.remove('hidden');
}

// 댓글 모달 닫기 버튼 클릭 시
closeCommentModal.onclick = function() {
  commentModal.classList.add('hidden');
  currentFeedId = null;
  commentList.innerHTML = '';
  newComment.value = '';
}

// 댓글 목록 로딩 함수
function loadComments(feedId) {
  const feed = loadedFeeds.find(f => f.id === feedId);
  if (!feed) {
    console.error('피드를 찾을 수 없습니다:', feedId);
    return;
  }

  commentList.innerHTML = ''; // 기존 댓글 목록 초기화

  feed.comments.forEach(comment => {
    const commentItem = document.createElement('div');
    commentItem.className = 'p-2 border-b';
    commentItem.innerHTML = `
      <p class="text-gray-800"><strong>${comment.commenter_name}</strong>: ${comment.comment}</p>
      <p class="text-gray-500 text-sm">${new Date(comment.commented_at).toLocaleString('ko-KR')}</p>
    `;
    commentList.appendChild(commentItem);
  });
}

// 새로운 댓글 작성 함수
submitComment.onclick = function() {
  const commentText = newComment.value.trim();
  if (!commentText) {
    alert('댓글을 입력하세요.');
    return;
  }

  fetch(`/feed/${currentFeedId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ comment: commentText }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('댓글이 성공적으로 추가되었습니다.');
      // 클라이언트 측에서 즉시 댓글 목록 갱신
      const feed = loadedFeeds.find(f => f.id === currentFeedId);
      if (feed) {
        feed.comments.push({
          commenter_name: data.commenter_name, // 서버에서 반환한 댓글 작성자 이름
          comment: commentText,
          commented_at: new Date().toISOString(),
        });
        loadComments(currentFeedId); // 댓글 목록 다시 로딩
        newComment.value = ''; // 입력 필드 초기화
      }
    } else {
      alert(data.message || '댓글 작성 중 오류가 발생했습니다.');
    }
  })
  .catch(error => {
    console.error('댓글 작성 중 오류 발생:', error);
    alert('댓글 작성 중 오류가 발생했습니다.');
  });
};

document.addEventListener('DOMContentLoaded', function () {
    fetch(`/feed/user?isMyPage=${isMyPage}&email=${userEmail}`)
        .then(response => response.json())
        .then(feeds => {
        console.log(feeds);
        loadedFeeds = feeds; // 전역에 저장

        const feedContainer = document.getElementById('feedContainer');
        feeds.forEach(feed => {
            const feedItem = document.createElement('div');
            feedItem.className = 'relative';
            feedItem.innerHTML = `<img src="${feed.image_url}" alt="피드 이미지" class="w-full h-48 object-cover cursor-pointer" onclick="showDetail('${feed.id}')">`;
            feedContainer.appendChild(feedItem);
        });
        })
        .catch(error => console.error('피드를 불러오는 중 오류 발생:', error));
});

function deleteFeed(feedId) {
    fetch(`/feed/${feedId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
    })
    .then(response => {
        if (response.ok) {
        alert('피드가 성공적으로 삭제되었습니다.');
        location.reload(); // 페이지 새로고침
        } else {
        response.json().then(data => {
            alert(data.message || '피드 삭제 중 오류가 발생했습니다.');
        });
        }
    })
    .catch(error => {
        console.error('삭제 요청 중 오류 발생:', error);
        alert('피드 삭제 중 오류가 발생했습니다.');
    });
};

function showDetail(feedId) {
    const feed = loadedFeeds.find(f => f.id === feedId);
    if (!feed) {
        console.error('피드를 찾을 수 없습니다:', feedId);
        return;
    }

    document.getElementById('detailModalImage').src = feed.image_url;
    document.getElementById('feedContent').textContent = feed.content;
    document.getElementById('createdAt').textContent = new Date(feed.created_at).toLocaleDateString('ko-KR');
    document.getElementById('likeCount').textContent = `${feed.likes.length}명`;
    document.getElementById('commentCount').textContent = `${feed.comments.length}개`;

    if (isMyPage) {
        const deleteFeedButton = document.getElementById('deleteFeedButton');
        deleteFeedButton.onclick = () => deleteFeed(feedId);
    }

    const commentButton = document.getElementById('commentButton');
    commentButton.onclick = () => openCommentModal(feedId);

    const likeButton = document.getElementById('likeButton');
    likeButton.disabled = false;
    likeButton.textContent = '좋아요';
    likeButton.onclick = () => handleLike(feedId);

    document.getElementById('detailModal').classList.remove('hidden');
}

// 피드 상세 모달 닫기
document.getElementById('detailCloseModal').addEventListener('click', function() {
    document.getElementById('detailModal').classList.add('hidden');
});

// 프로필 이미지를 클릭했을 때 파일 선택 창 열기
function handleProfileClick() {
    document.getElementById('fileInput').click();
}

// 프로필 이미지 변경
function handleFileChange(event) {
    const file = event.target.files[0];

    if (file) {
        if (!file.type.startsWith('image/')) {
        alert('이미지 파일을 선택해주세요.');
        return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
        document.getElementById('profileImage').src = e.target.result;
        };
        reader.readAsDataURL(file);

        // 서버로 이미지와 사용자 ID를 함께 업로드 요청
        const formData = new FormData();
        formData.append('profileImage', file);        

        fetch('/user/upload', {
        method: 'POST',
        body: formData,
        })
        .then(response => response.json())
        .then(data => {
        // 서버에서 반환한 이미지 URL을 프로필 이미지로 설정
        location.reload(); // 페이지 새로고침
        })
        .catch(error => {
        console.error('업로드 실패:', error);
        });
    }
}

// 팔로워 버튼 클릭 시 호출되는 함수
function handleFollowerClick(followerIds) {
    fetch('/user/get-usernames', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: followerIds }),
    })
        .then(response => response.json())
        .then(data => {
        if (Array.isArray(data)) {
            if (data.usernames.length === 0) {
            displayModal('팔로워 목록', '팔로워가 없습니다.');
            } else {
            const content = data.usernames.map(username => `<p>${username}</p>`).join('');
            displayModal('팔로워 목록', content);
            }
        }
        else {
            displayModal('팔로워 목록', '팔로워가 없습니다.');
        }
        })
        .catch(error => console.error('팔로워 목록을 불러오는 중 오류 발생:', error));
}

// 팔로잉 버튼 클릭 시 호출되는 함수
function handleFollowingClick(followingIds) {
    fetch('/user/get-usernames', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: followingIds }),
    })
        .then(response => response.json())
        .then(data => {
        if (Array.isArray(data)) {
            if (data.usernames.length === 0) {
            displayModal('팔로잉 목록', '팔로잉하는 사용자가 없습니다.');
            } else {
            const content = data.usernames.map(username => `<p>${username}</p>`).join('');
            displayModal('팔로잉 목록', content);
            }
        } else {
            displayModal('팔로잉 목록', '팔로잉하는 사용자가 없습니다.');
        }
        })
        .catch(error => console.error('팔로잉 목록을 불러오는 중 오류 발생:', error));
}

// 모달 창에 데이터 표시
function displayModal(title, content) {
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    modalTitle.innerText = title;
    modalContent.innerHTML = content;
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
}

function writePost() {
    window.location.href = '/create-feed.html';
}

function handleLike(feedId) {
    fetch(`/feed/${feedId}/like`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === '좋아요가 추가되었습니다.') {
        alert('좋아요를 눌렀습니다.');
        location.reload(); // 페이지 새로고침
        } else {
        alert(data.message);
        }
    })
    .catch(error => {
        console.error('좋아요 처리 중 오류 발생:', error);
    });
}

function goHome() {
    window.location.href = '/home';
}

function handleFollow() {
    alert("팔로우 기능 실행");
}

function startChat() {
    alert("채팅 시작");
}

function logout() {
    fetch('/auth/logout', {
        method: 'POST',
        credentials: 'same-origin' // 쿠키를 포함하여 요청을 보냅니다.
    })
    .then(response => {
        if (response.redirected) {
        window.location.href = response.url; // 리디렉션된 URL로 이동
        } else {
        alert('로그아웃에 실패했습니다.');
        }
    })
    .catch(error => {
        console.error('로그아웃 중 오류 발생:', error);
    });
}
