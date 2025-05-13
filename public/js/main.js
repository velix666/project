document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api/comments';
    const commentsList = document.querySelector('.comments-list');
    const commentForm = document.querySelector('.comment-form');
    const commentInput = document.querySelector('.comment-input');
    const commentAuthor = document.querySelector('.comment-author');
    const stars = document.querySelectorAll('.star');
    const ratingText = document.querySelector('.rating-text');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            currentRating = value;
            updateStars(value);
            
            const ratingMessages = [
                "Rate us!",
                "Excellent",
                "Good",
                "Normal",
                "Bad",
                "Terrible"
            ];
            ratingText.textContent = ratingMessages[value];
        });
        
        star.addEventListener('mouseover', function() {
            const value = parseInt(this.getAttribute('data-value'));
            updateStars(value, !true);
        });
        
        star.addEventListener('mouseout', function() {
            updateStars(currentRating);
        });
    });
    
    function updateStars(value, isHover = false) {
        stars.forEach(s => {
            s.classList.remove('active', 'hover');
            if (parseInt(s.getAttribute('data-value')) >= value) {
                s.classList.add(isHover ? 'hover' : 'active');
            }
        });
    }

    async function loadComments() {
        try {
            showLoading();
            
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const comments = await response.json();
            
            if (comments.length === 0) {
                showEmptyMessage();
                return;
            }
            
            renderComments(comments);
        } catch (error) {
            console.error('Error loading comments:', error);
            showError('Не удалось загрузить комментарии. Пожалуйста, обновите страницу.');
        }
    }

    function renderComments(comments) {
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.user_name}</span>
                    <span class="comment-date">
                        ${formatDate(comment.created_at)}
                    </span>
                </div>
                ${comment.rating ? `
                    <div class="comment-rating">
                        ${ratingMessages[6 - comment.rating]}
                    </div>` : ''
                }
                <div class="comment-text">${comment.comment_text}</div>
            </div>
        `).join('');
    }

    function formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }

    function showLoading() {
        commentsList.innerHTML = '<div class="loading">Загрузка комментариев...</div>';
    }

    function showEmptyMessage() {
        commentsList.innerHTML = '<div class="empty">Пока нет комментариев. Будьте первым!</div>';
    }

    function showError(message) {
        commentsList.innerHTML = `<div class="error">${message}</div>`;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        const author = commentAuthor.value.trim() || 'Аноним';
        const text = commentInput.value.trim();
        
        if (!text) {
            alert('Пожалуйста, введите текст комментария');
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: author,
                    comment_text: text,
                    rating: currentRating || null
                })
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
            
            commentInput.value = '';
            commentAuthor.value = '';
            currentRating = 0;
            updateStars();
            updateRatingText();
            await loadComments();
            
        } catch (error) {
            console.error('Error submitting comment:', error);
            showError('Ошибка при отправке комментария. Пожалуйста, попробуйте снова.');
        }
    }

    commentForm.addEventListener('submit', handleSubmit);

    // Initial load
    loadComments();
});

document.addEventListener('DOMContentLoaded', function () {
    const submitBtn = document.querySelector('.submit-btn');
    const authorInput = document.querySelector('.comment-author');
    const commentInput = document.querySelector('.comment-input');
    const commentsList = document.querySelector('.comments-list');

    async function loadComments() {
        const res = await fetch('/comments');
        const comments = await res.json();

        commentsList.innerHTML = '';
        comments.forEach(c => {
            const div = document.createElement('div');
            div.className = 'comment';
            div.innerHTML = `
                <div class="comment-author">${c.author || 'Аноним'}</div>
                <div class="comment-text">${c.text}</div>
                <div class="comment-date">${new Date(c.created_at).toLocaleDateString()}</div>
            `;
            commentsList.appendChild(div);
        });
    }

    submitBtn.addEventListener('click', async () => {
        const author = authorInput.value.trim();
        const text = commentInput.value.trim();
        if (!text) return;

        await fetch('/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author, text })
        });

        authorInput.value = '';
        commentInput.value = '';
        loadComments();
    });

    loadComments();
});
