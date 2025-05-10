document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const API_URL = 'http://localhost:3000/api/comments';
    const commentsList = document.querySelector('.comments-list');
    const commentForm = document.querySelector('.comment-form');
    const commentInput = document.querySelector('.comment-input');
    const commentAuthor = document.querySelector('.comment-author');
    const stars = document.querySelectorAll('.star');
    const ratingText = document.querySelector('.rating-text');
    
    let currentRating = 0;

    // Initialize rating system
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.getAttribute('data-value'));
            updateStars();
            updateRatingText();
        });

        star.addEventListener('mouseover', () => {
            const value = parseInt(star.getAttribute('data-value'));
            updateHoverStars(value);
        });

        star.addEventListener('mouseout', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });

    function updateStars() {
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < currentRating);
        });
    }

    function updateHoverStars(value) {
        stars.forEach((star, index) => {
            star.classList.toggle('hover', index < value);
        });
    }

    function updateRatingText() {
        const ratings = [
            "Оцените нас!",
            "Ужасно",
            "Плохо",
            "Нормально",
            "Хорошо",
            "Отлично"
        ];
        ratingText.textContent = ratings[currentRating];
    }

    // Load comments from server
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

    // Render comments to DOM
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
                        ${'★'.repeat(comment.rating)}${'☆'.repeat(5 - comment.rating)}
                    </div>` : ''
                }
                <div class="comment-text">${comment.comment_text}</div>
            </div>
        `).join('');
    }

    // Format date
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

    // Show loading state
    function showLoading() {
        commentsList.innerHTML = '<div class="loading">Загрузка комментариев...</div>';
    }

    // Show empty state
    function showEmptyMessage() {
        commentsList.innerHTML = '<div class="empty">Пока нет комментариев. Будьте первым!</div>';
    }

    // Show error state
    function showError(message) {
        commentsList.innerHTML = `<div class="error">${message}</div>`;
    }

    // Handle form submission
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
            
            // Clear form and reload comments
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

    // Event listeners
    commentForm.addEventListener('submit', handleSubmit);

    // Initial load
    loadComments();
});