<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Estados reactivos
const links = ref([]);
const newLink = ref({ title: '', url: '', tags: '' });
const newComment = ref({ text: '', linkId: '' });
const selectedLink = ref(null);
const searchTags = ref('');

// Métodos
const fetchLinks = async (tags = '') => {
  try {
    const response = await axios.get(`${API_URL}/links${tags ? `?tags=${tags}` : ''}`);
    links.value = response.data;
  } catch (error) {
    console.error('Error fetching links:', error);
  }
};

const handleSearch = async (e) => {
  e.preventDefault();
  await fetchLinks(searchTags.value);
};

const handleSubmitLink = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${API_URL}/links`, {
      ...newLink.value,
      tags: newLink.value.tags.split(',').map(tag => tag.trim())
    });
    links.value.push(response.data);
    newLink.value = { title: '', url: '', tags: '' };
  } catch (error) {
    console.error('Error creating link:', error);
  }
};

const handleVote = async (id, voteType) => {
  try {
    const response = await axios.patch(`${API_URL}/links/${id}/vote`, { voteType });
    const index = links.value.findIndex(link => link._id === response.data._id);
    if (index !== -1) {
      links.value[index] = response.data;
    }
  } catch (error) {
    console.error('Error voting:', error);
  }
};

const handleSubmitComment = async (e) => {
  e.preventDefault();
  try {
    await axios.post(`${API_URL}/comments`, newComment.value);
    if (selectedLink.value) {
      const response = await axios.get(`${API_URL}/links/${selectedLink.value._id}`);
      selectedLink.value = response.data;
    }
    newComment.value = { text: '', linkId: '' };
  } catch (error) {
    console.error('Error creating comment:', error);
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchLinks();
});
</script>

<template>
  <div class="app">
    <div class="container">
      <h1>
        <font-awesome-icon :icon="['fas', 'plus-circle']" /> Añadir nuevo enlace
      </h1>
      <div class="card">
        <form @submit.prevent="handleSubmitLink" class="form">
          <input
            v-model="newLink.title"
            type="text"
            placeholder="Título"
          >
          <input
            v-model="newLink.url"
            type="url"
            placeholder="URL"
          >
          <input
            v-model="newLink.tags"
            type="text"
            placeholder="Tags (separados por comas)"
          >
          <button type="submit">Añadir enlace</button>
        </form>
      </div>

      <h1>
        <font-awesome-icon :icon="['fas', 'filter']" /> Buscar por etiquetas
      </h1>
      <div class="search-section">
        <form @submit.prevent="handleSearch" class="search-form">
          <input
            v-model="searchTags"
            type="text"
            placeholder="Buscar por etiquetas (separadas por comas)"
            class="search-input"
          >
          <button type="submit">Buscar</button>
        </form>
      </div>

      <h1>
        <font-awesome-icon :icon="['fas', 'list']" /> Lista de enlaces
      </h1>

      <div class="links-container">
        <div v-for="link in links" :key="link._id" class="link-card">
          <div class="link-content">
            <div class="link-info">
              <h2>{{ link.title }}</h2>
              <a :href="link.url" target="_blank" rel="noopener noreferrer">
                {{ link.url }}
              </a>
              <div class="tags">
                <span v-for="tag in link.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
            <div class="vote-section">
              <button @click="handleVote(link._id, 'up')">
                <font-awesome-icon :icon="['fas', 'circle-up']" />
              </button>
              <span class="vote-count">{{ link.votes || 0 }}</span>
              <button @click="handleVote(link._id, 'down')">
                <font-awesome-icon :icon="['fas', 'circle-down']" />
              </button>
              <button @click="selectedLink = link">
                <font-awesome-icon :icon="['fas', 'comment']" />
              </button>
            </div>
          </div>
          
          <div v-if="selectedLink?._id === link._id" class="comments-section">
            <h3>Comentarios</h3>
            <form @submit.prevent="handleSubmitComment" class="comment-form">
              <input
                v-model="newComment.text"
                type="text"
                placeholder="Añadir comentario"
                @input="newComment.linkId = link._id"
              >
              <button type="submit">Comentar</button>
            </form>
            <div class="comments-list">
              <div v-for="comment in selectedLink.comments" 
                   :key="comment._id" 
                   class="comment">
                {{ comment.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fondo general de la aplicación */
.app {
  min-height: 100vh;
  background-color: #121212;
  color: #e0e0e0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Contenedor principal */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

/* Tarjetas */
.card {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

/* Formulario */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form input {
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #1e1e1e;
  color: #e0e0e0;
}

button {
  background-color: #30a390;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #248070;
}

/* Sección de búsqueda */
.search-section {
  margin-bottom: 2rem;
}

.search-form {
  display: flex;
  gap: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #1e1e1e;
  color: #e0e0e0;
}

/* Enlaces */
.links-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.link-card {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.link-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.link-info {
  flex: 1;
}

.link-info h2 {
  margin: 0 0 0.5rem 0;
}

.link-info a {
  color: #46e5d8;
  text-decoration: none;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background: #292929;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: #e0e0e0;
}

/* Votos */
.vote-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.vote-section button {
  background: none;
  border: none;
  padding: 0.25rem;
  color: #9CA3AF;
  cursor: pointer;
}

.vote-section button:hover {
  color: #46e5d8;
}

.vote-count {
  font-weight: bold;
  color: #e0e0e0;
}

/* Comentarios */
.comments-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
}

.comment-form {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.comment-form input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #1e1e1e;
  color: #e0e0e0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment {
  background: #292929;
  padding: 0.75rem;
  border-radius: 4px;
  color: #e0e0e0;
}
</style>
