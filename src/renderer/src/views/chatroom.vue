<template>
  <div>
    <div class="header">
      <span>Chat with my local Ollama</span>
    </div>
    <div class="chat-container">
      <fieldset
        v-for="(message, idx) in messages"
        :key="idx"
        :class="`message ${message.type === 'me' ? 'right-align-box' : 'left-align-box'}`"
        :style="`--background: ${getMessageTypeColor(message.type)}`"
      >
        <legend :style="`font-size: 10px; color:${getMessageTypeColor(message.type)}`">
          {{ message.type }}
        </legend>
        <div
          v-if="message.type === 'ollama'"
          class="message-content"
          v-html="generateMarkdown(message.content)"
        ></div>
        <div v-else class="message-content">{{ message.content }}</div>
      </fieldset>
      <div
        v-if="processing"
        ref="loader"
        style="display: flex; align-items: center; gap: 10px; padding: 10px"
      >
        <div class="loader"></div>
        <div>Ollama is answering the question, it will take some time...</div>
      </div>
    </div>
    <div class="input-window">
      <input
        v-model="query"
        type="text"
        style="flex: 2 1 auto"
        :disabled="processing"
        @keypress="(e) => e.key === 'Enter' && send()"
      />
      <button :disabled="processing" style="flex: 1 1 auto" @click="send()">send</button>
      <button :disabled="processing" style="flex: 0 1 auto" @click="clear()">clear</button>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default {
  name: 'Chatroom',
  data() {
    return {
      query: '',
      messages: [],
      processing: false
    }
  },
  methods: {
    async send() {
      this.messages.push({
        type: 'me',
        content: this.query
      })
      this.processing = true
      setTimeout(() => {
        // scroll to the loader
        this.$refs.loader.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      await this.sendQueryAsUser()
      this.processing = false
      this.query = ''
    },
    clear() {
      this.messages = []
    },
    async sendQueryAsUser() {
      const query = this.query.trim()
      if (query) {
        const res = await window.api.fetchFromOllama('http://127.0.0.1:11434', 'llama3.2:1b', query)

        if (res) {
          this.messages.push({
            type: 'ollama',
            content: res
          })
        } else {
          this.messages.push({
            type: 'error',
            content: 'No response'
          })
        }
      }
    },
    getMessageTypeColor(type) {
      switch (type) {
        case 'me':
          return '#788FA6'
        case 'ollama':
          return '#256F3A'
        case 'error':
          return '#FFBBBB'
        default:
          return 'white'
      }
    },
    generateMarkdown(text) {
      return marked(DOMPurify.sanitize(marked.parse(text)))
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  overflow-y: auto;
  height: calc(100vh - 120px);
  padding: 10px 0px;
}

.message {
  padding: 0px;
  flex-shrink: 0;
  border: 1px solid var(--background);
  margin: 10px 10px 0px 10px;
  border-radius: 5px;
}

.header {
  padding: 10px;
  flex-shrink: 0;
  background-color: #eee;
  border-bottom: 1px solid #ccc;
  font-weight: bold;
  color: #333;
}

.input-window {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding: 10px;
  border-top: 1px solid #ccc;
}

input {
  flex: 3 1 auto;
  height: 32px;
}

.message-header {
  font-size: 10px;
  padding: 5px;
  margin: 0px;
  background-color: var(--background);
  border-radius: 5px 5px 0px 0px;
}

.message-content {
  padding: 5px;
}

.right-align-box {
  width: 80%;
  position: relative;
  right: 0;
  margin-left: auto;
}

.left-align-box {
  width: 80%;
  position: relative;
  left: 0;
  margin-right: auto;
}

.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
