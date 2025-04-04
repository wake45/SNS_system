let loadedHomeFeeds = []; // 피드 데이터

// 댓글 모달 요소 가져오기
const commentHomeModal = document.getElementById('commentModal');
const closeHomeCommentModal = document.getElementById('closeCommentModal');
const homeCommentList = document.getElementById('commentList');
const homeNewComment = document.getElementById('newComment');
const homeSubmitComment = document.getElementById('submitComment');

// 현재 선택된 피드 ID 저장 변수
let currentHomeFeedId = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/home', {
        method: 'GET',
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch feeds');
      }
  
      const feeds = await response.json();
      const feedContainer = document.getElementById('feedContainer');
  
      feeds.forEach(feed => {
        const feedElement = document.createElement('div');
        feedElement.className = 'feed-item';
        feedElement.innerHTML = `
          <h3>${feed.author_name}</h3>
          <p>${feed.content}</p>
          ${feed.image_url ? `<img src="${feed.image_url}" alt="Feed image">` : ''}
          <span>${new Date(feed.created_at).toLocaleString()}</span>
        `;
        feedContainer.appendChild(feedElement);
      });
    } catch (error) {
      console.error('Error loading feeds:', error);
    }
});
  

// '댓글' 버튼 클릭 시 호출되는 함수
function openCommentModal(feedId) {
  currentHomeFeedId = feedId;
  loadComments(feedId);
  commentHomeModal.classList.remove('hidden');
}

// 댓글 모달 닫기 버튼 클릭 시
closeHomeCommentModal.onclick = function() {
  commentHomeModal.classList.add('hidden');
  currentHomeFeedId = null;
  homeCommentList.innerHTML = '';
  homeNewComment.value = '';
}

// 댓글 목록 로딩 함수
function loadComments(feedId) {
  const feed = loadedFeeds.find(f => f.id === feedId);
  if (!feed) {
    console.error('피드를 찾을 수 없습니다:', feedId);
    return;
  }

  homeCommentList.innerHTML = ''; // 기존 댓글 목록 초기화

  feed.comments.forEach(comment => {
    const commentItem = document.createElement('div');
    commentItem.className = 'p-2 border-b';
    commentItem.innerHTML = `
      <p class="text-gray-800"><strong>${comment.commenter_name}</strong>: ${comment.comment}</p>
      <p class="text-gray-500 text-sm">${new Date(comment.commented_at).toLocaleString('ko-KR')}</p>
    `;
    homeCommentList.appendChild(commentItem);
  });
}

// 새로운 댓글 작성 함수
homeSubmitComment.onclick = function() {
  const commentText = homeNewComment.value.trim();
  if (!commentText) {
    alert('댓글을 입력하세요.');
    return;
  }

  fetch(`/feed/${currentHomeFeedId}/comment`, {
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
      const feed = loadedFeeds.find(f => f.id === currentHomeFeedId);
      if (feed) {
        feed.comments.push({
          commenter_name: data.commenter_name, // 서버에서 반환한 댓글 작성자 이름
          comment: commentText,
          commented_at: new Date().toISOString(),
        });
        loadComments(currentHomeFeedId); // 댓글 목록 다시 로딩
        homeNewComment.value = ''; // 입력 필드 초기화
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

    const deleteFeedButton = document.getElementById('deleteFeedButton');
    deleteFeedButton.onclick = () => deleteFeed(feedId);

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

// 모달 창에 데이터 표시
function displayModal(title, content) {
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    modalTitle.innerText = title;
    modalContent.innerHTML = content;
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
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

document.getElementById('searchButton').addEventListener('click', function() {
    const email = document.getElementById('emailInput').value.trim();
    if (email) {
      fetch(`/home/profile?email=${encodeURIComponent(email)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
          }
          return response.text();
        })
        .then(html => {
          document.open();
          document.write(html);
          document.close();
        })
        .catch(error => {
          console.error('데이터를 가져오는 중 문제가 발생했습니다:', error);
        });
    } else {
      alert('이메일을 입력하세요.');
    }
  });
  