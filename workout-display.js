export class WorkoutDisplay {
  constructor() {
    this.editingExercise = null
  }

  render(exercises) {
    if (!exercises || exercises.length === 0) {
      return `
        <div class="no-workout">
          <h3>Nessun esercizio trovato per questo giorno</h3>
          <p>Prova a caricare un PDF diverso o controlla il formato del tuo file.</p>
        </div>
      `
    }

    return `
      <div class="workout-container">
        <div class="workout-header">
          <h2>📋 Allenamento del Giorno</h2>
          <div class="workout-stats">
            <span class="stat">
              <strong>${exercises.length}</strong> esercizi
            </span>
            <span class="stat">
              <strong>${this.getTotalSets(exercises)}</strong> serie totali
            </span>
          </div>
        </div>

        <div class="exercises-list">
          ${exercises.map((exercise, index) => this.renderExercise(exercise, index)).join('')}
        </div>

        <div class="workout-actions">
          <button class="btn primary" onclick="window.gymTracker.addExercise()">
            ➕ Aggiungi Esercizio
          </button>
          <button class="btn secondary" onclick="window.gymTracker.exportWorkout()">
            📤 Esporta Allenamento
          </button>
        </div>
      </div>
    `
  }

  renderExercise(exercise, index) {
    const isEditing = this.editingExercise === index

    if (isEditing) {
      return `
        <div class="exercise-card editing">
          <div class="exercise-edit-form">
            <input type="text" id="edit-name-${index}" value="${exercise.name}" placeholder="Nome esercizio">
            <div class="edit-row">
              <input type="number" id="edit-sets-${index}" value="${exercise.sets}" placeholder="Serie" min="0">
              <input type="text" id="edit-reps-${index}" value="${exercise.reps}" placeholder="Ripetizioni">
              <input type="number" id="edit-weight-${index}" value="${exercise.weight}" placeholder="Peso (kg)" min="0" step="0.5">
            </div>
            <textarea id="edit-notes-${index}" placeholder="Note">${exercise.notes}</textarea>
            <div class="edit-actions">
              <button class="btn small primary" onclick="window.gymTracker.saveExercise(${index})">
                ✅ Salva
              </button>
              <button class="btn small secondary" onclick="window.gymTracker.cancelEdit()">
                ❌ Annulla
              </button>
            </div>
          </div>
        </div>
      `
    }

    return `
      <div class="exercise-card" onclick="window.gymTracker.editExercise(${index})">
        <div class="exercise-header">
          <h3 class="exercise-name">${exercise.name}</h3>
          <div class="exercise-actions">
            <button class="btn-icon" onclick="event.stopPropagation(); window.gymTracker.duplicateExercise(${index})" title="Duplica">
              📋
            </button>
            <button class="btn-icon delete" onclick="event.stopPropagation(); window.gymTracker.deleteExercise(${index})" title="Elimina">
              🗑️
            </button>
          </div>
        </div>
        
        <div class="exercise-details">
          <div class="detail-item">
            <span class="detail-label">Serie:</span>
            <span class="detail-value">${exercise.sets || '-'}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Ripetizioni:</span>
            <span class="detail-value">${exercise.reps || '-'}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Peso:</span>
            <span class="detail-value">${exercise.weight ? exercise.weight + ' kg' : '-'}</span>
          </div>
          
          ${exercise.notes ? `
            <div class="detail-item full-width">
              <span class="detail-label">Note:</span>
              <span class="detail-value notes">${exercise.notes}</span>
            </div>
          ` : ''}
          
          ${exercise.originalText && exercise.originalText !== 'Sample' ? `
            <div class="original-text">
              <small>Testo originale: "${exercise.originalText}"</small>
            </div>
          ` : ''}
        </div>
        
        <div class="exercise-progress">
          <div class="progress-item">
            <label>Completato:</label>
            <input type="checkbox" onchange="window.gymTracker.toggleComplete(${index}, this.checked)">
          </div>
          <div class="progress-item">
            <label>Peso attuale:</label>
            <input type="number" placeholder="${exercise.weight || 0}" step="0.5" 
                   onchange="window.gymTracker.updateCurrentWeight(${index}, this.value)">
          </div>
        </div>
      </div>
    `
  }

  getTotalSets(exercises) {
    return exercises.reduce((total, exercise) => total + (exercise.sets || 0), 0)
  }
}

// Add global methods for interaction
window.gymTracker = {
  editExercise: (index) => {
    const display = document.querySelector('.workout-display')
    if (display) {
      display.querySelector('.workout-container').dataset.editingIndex = index
      // Re-render with editing state
      // This would need to be connected to the main app state
      console.log('Edit exercise:', index)
    }
  },
  
  saveExercise: (index) => {
    console.log('Save exercise:', index)
    // Implementation would save the edited values
  },
  
  cancelEdit: () => {
    console.log('Cancel edit')
    // Implementation would cancel editing
  },
  
  duplicateExercise: (index) => {
    console.log('Duplicate exercise:', index)
    // Implementation would duplicate the exercise
  },
  
  deleteExercise: (index) => {
    if (confirm('Sei sicuro di voler eliminare questo esercizio?')) {
      console.log('Delete exercise:', index)
      // Implementation would delete the exercise
    }
  },
  
  addExercise: () => {
    console.log('Add exercise')
    // Implementation would add a new exercise
  },
  
  exportWorkout: () => {
    console.log('Export workout')
    // Implementation would export the workout data
  },
  
  toggleComplete: (index, completed) => {
    console.log('Toggle complete:', index, completed)
    // Implementation would mark exercise as completed
  },
  
  updateCurrentWeight: (index, weight) => {
    console.log('Update weight:', index, weight)
    // Implementation would update current weight
  }
}
