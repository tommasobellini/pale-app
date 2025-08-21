import './style.css'
import { setupPDFUpload } from './pdf-handler.js'
import { WorkoutDisplay } from './workout-display.js'

class GymTracker {
  constructor() {
    this.workoutData = null
    this.currentDay = null
    this.render()
    this.setupEventListeners()
  }

  render() {
    document.querySelector('#app').innerHTML = `
      <div class="gym-tracker">
        <header class="header">
          <h1>🏋️ Gym Tracker</h1>
          <p>Carica la tua scheda di palestra PDF e traccia i tuoi allenamenti</p>
        </header>
        
        <main class="main-content">
          <div class="upload-section ${this.workoutData ? 'hidden' : ''}">
            <div class="upload-container">
              <div class="upload-zone" id="upload-zone">
                <div class="upload-icon">📄</div>
                <h3>Carica la tua scheda PDF</h3>
                <p>Trascina qui il file PDF o clicca per selezionarlo</p>
                <input type="file" id="pdf-input" accept=".pdf" style="display: none;">
                <button class="upload-btn" id="upload-btn">Scegli File PDF</button>
              </div>
              <div class="loading hidden" id="loading">
                <div class="spinner"></div>
                <p>Elaborando PDF...</p>
              </div>
            </div>
          </div>

          <div class="workout-section ${this.workoutData ? '' : 'hidden'}" id="workout-section">
            <div class="controls">
              <button class="btn secondary" id="upload-new">Carica Nuovo PDF</button>
              <div class="day-selector" id="day-selector">
                <!-- Days will be populated dynamically -->
              </div>
            </div>
            <div class="workout-display" id="workout-display">
              <!-- Workout data will be displayed here -->
            </div>
          </div>
        </main>
      </div>
    `
  }

  setupEventListeners() {
    const uploadBtn = document.getElementById('upload-btn')
    const uploadZone = document.getElementById('upload-zone')
    const pdfInput = document.getElementById('pdf-input')
    const uploadNew = document.getElementById('upload-new')

    // Upload button click
    uploadBtn?.addEventListener('click', () => pdfInput.click())

    // File input change
    pdfInput?.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]))

    // Drag and drop
    uploadZone?.addEventListener('dragover', (e) => {
      e.preventDefault()
      uploadZone.classList.add('drag-over')
    })

    uploadZone?.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over')
    })

    uploadZone?.addEventListener('drop', (e) => {
      e.preventDefault()
      uploadZone.classList.remove('drag-over')
      const file = e.dataTransfer.files[0]
      if (file && file.type === 'application/pdf') {
        this.handleFileUpload(file)
      }
    })

    // Upload new PDF
    uploadNew?.addEventListener('click', () => {
      this.workoutData = null
      this.currentDay = null
      this.render()
      this.setupEventListeners()
    })
  }

  async handleFileUpload(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Per favore seleziona un file PDF valido')
      return
    }

    this.showLoading(true)
    
    try {
      const pdfHandler = setupPDFUpload()
      const extractedData = await pdfHandler.extractWorkoutData(file)
      
      this.workoutData = extractedData
      this.currentDay = Object.keys(extractedData)[0] || null
      
      this.showLoading(false)
      this.render()
      this.setupEventListeners()
      this.renderWorkoutData()
      
    } catch (error) {
      console.error('Errore nel processare il PDF:', error)
      alert('Errore nel processare il file PDF. Assicurati che sia una scheda di palestra valida.')
      this.showLoading(false)
    }
  }

  showLoading(show) {
    const loading = document.getElementById('loading')
    const uploadZone = document.getElementById('upload-zone')
    
    if (show) {
      loading?.classList.remove('hidden')
      uploadZone?.classList.add('hidden')
    } else {
      loading?.classList.add('hidden')
      uploadZone?.classList.remove('hidden')
    }
  }

  renderWorkoutData() {
    if (!this.workoutData) return

    // Render day selector
    const daySelector = document.getElementById('day-selector')
    const days = Object.keys(this.workoutData)
    
    daySelector.innerHTML = `
      <h3>Seleziona Giorno:</h3>
      <div class="day-buttons">
        ${days.map(day => `
          <button class="day-btn ${day === this.currentDay ? 'active' : ''}" 
                  data-day="${day}">${day}</button>
        `).join('')}
      </div>
    `

    // Add day button listeners
    daySelector.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentDay = e.target.dataset.day
        this.renderWorkoutData()
      })
    })

    // Render workout display
    const workoutDisplay = document.getElementById('workout-display')
    const workoutDisplayComponent = new WorkoutDisplay()
    workoutDisplay.innerHTML = workoutDisplayComponent.render(this.workoutData[this.currentDay] || [])
  }
}

// Initialize app
new GymTracker()
